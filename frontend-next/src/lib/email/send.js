import { after } from "next/server";
import sendMail from "@/lib/email/sendMail";
import {
  verifyEmailTemplate,
  welcomeTemplate,
  orderTemplate,
  contactToStoreTemplate,
  contactReceiptTemplate,
  NOTIFY_STATUSES,
} from "@/lib/email/templates";
import { createActivationToken } from "@/lib/email/activation";

// One place that turns app events into emails. Order notifications are
// best-effort: a mail-server hiccup must never fail an order or a status change.

const siteOrigin = (origin) => origin || process.env.FRONTEND_URL || "http://localhost:3000";

const deliver = (to, { subject, html, text }, extra = {}) => sendMail({ email: to, subject, html, message: text, ...extra });

// Send without delaying the response. On serverless hosts (Vercel) a function
// can be frozen as soon as it responds, so plain fire-and-forget promises may
// never finish — after() keeps the function alive until the email is sent.
function inBackground(label, task) {
  const run = () => task().catch((e) => console.error(`[email] ${label} failed:`, e.message));
  try {
    after(run);
  } catch {
    run(); // outside a request scope (scripts)
  }
}

export async function sendVerificationEmail(user, origin) {
  const o = siteOrigin(origin);
  const url = `${o}/activation/${createActivationToken(user)}`;
  await deliver(user.email, verifyEmailTemplate({ user, url, origin: o }));
}

export function sendWelcomeEmail(user, origin) {
  inBackground("welcome", () => deliver(user.email, welcomeTemplate({ user, origin: siteOrigin(origin) })));
}

export function notifyOrderPlaced(order) {
  const to = order?.user?.email;
  if (!to) return;
  inBackground("order confirmation", () => deliver(to, orderTemplate({ order, origin: siteOrigin(), status: "Processing" })));
}

export function notifyOrderStatus(order) {
  const to = order?.user?.email;
  if (!to || !NOTIFY_STATUSES.includes(order.status)) return;
  inBackground("order status", () => deliver(to, orderTemplate({ order, origin: siteOrigin() })));
}

export async function sendContactEmails({ to, name, email, subject, orderId, message, origin }) {
  const o = siteOrigin(origin);
  await deliver(to, contactToStoreTemplate({ name, email, subject, orderId, message, origin: o }), { replyTo: email });
  // receipt to the customer — nice to have, never blocks
  inBackground("contact receipt", () => deliver(email, contactReceiptTemplate({ name, subject, message, origin: o })));
}
