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

export async function sendVerificationEmail(user, origin) {
  const o = siteOrigin(origin);
  const url = `${o}/activation/${createActivationToken(user)}`;
  await deliver(user.email, verifyEmailTemplate({ user, url, origin: o }));
}

export async function sendWelcomeEmail(user, origin) {
  await deliver(user.email, welcomeTemplate({ user, origin: siteOrigin(origin) }));
}

export function notifyOrderPlaced(order) {
  const to = order?.user?.email;
  if (!to) return;
  deliver(to, orderTemplate({ order, origin: siteOrigin(), status: "Processing" })).catch((e) =>
    console.error("[email] order confirmation failed:", e.message)
  );
}

export function notifyOrderStatus(order) {
  const to = order?.user?.email;
  if (!to || !NOTIFY_STATUSES.includes(order.status)) return;
  deliver(to, orderTemplate({ order, origin: siteOrigin() })).catch((e) =>
    console.error("[email] order status email failed:", e.message)
  );
}

export async function sendContactEmails({ to, name, email, subject, orderId, message, origin }) {
  const o = siteOrigin(origin);
  await deliver(to, contactToStoreTemplate({ name, email, subject, orderId, message, origin: o }), { replyTo: email });
  // receipt to the customer — nice to have, never blocks
  deliver(email, contactReceiptTemplate({ name, subject, message, origin: o })).catch(() => {});
}
