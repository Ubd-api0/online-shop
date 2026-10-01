import { NextResponse } from "next/server";
import { withErrorHandling, ApiError } from "@/lib/api/errors";
import { getStorefront } from "@/lib/data/shops";
import { sendContactEmails } from "@/lib/email/send";
import appConfig from "@/config/appConfig";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v, n) => String(v || "").trim().slice(0, n);

// Contact form -> email to the store (reply goes straight to the customer).
export const POST = withErrorHandling(async (request) => {
  const body = await request.json().catch(() => ({}));
  const name = clip(body.name, 100);
  const email = clip(body.email, 200);
  const subject = clip(body.subject, 150) || "General question";
  const orderId = clip(body.orderId, 40);
  const message = clip(body.message, 4000);

  // Honeypot: real users never fill this hidden field.
  if (body.website) return NextResponse.json({ success: true, message: "Thanks! We'll get back to you soon." });

  if (!name) throw new ApiError("Please enter your name", 400);
  if (!EMAIL_RE.test(email)) throw new ApiError("Please enter a valid email address", 400);
  if (message.length < 10) throw new ApiError("Please write a message of at least 10 characters", 400);

  const storefront = await getStorefront();
  const to = appConfig.supportEmail || storefront.email || process.env.SMPT_MAIL;
  if (!to) throw new ApiError("The store hasn't set a contact email yet", 500);

  await sendContactEmails({ to, name, email, subject, orderId, message, origin: request.headers.get("origin") }).catch((err) => {
    throw new ApiError(`Sorry, your message couldn't be sent (${err.message}). Please try again later.`, 500);
  });

  return NextResponse.json({ success: true, message: "Thanks! Your message has been sent — we'll reply by email soon." });
});
