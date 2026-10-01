import appConfig from "@/config/appConfig";
import { formatPrice, shortOrderId } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { provinceName } from "@/lib/shipping/pakistan";

// Branded transactional emails. Email clients ignore <style> tags and CSS
// variables, so everything is table layout + inline styles. Colors mirror the
// storefront theme (globals.css). Each template returns { subject, html, text }.

const C = {
  brand: "#f63b60",
  brandDark: "#e02a4f",
  ink: "#1f2937",
  muted: "#6b7280",
  border: "#e5e7eb",
  bg: "#f4f4f5",
  card: "#ffffff",
  soft: "#f9fafb",
  success: "#047857",
  successBg: "#ecfdf5",
  danger: "#dc2626",
  dangerBg: "#fef2f2",
  info: "#0369a1",
  infoBg: "#f0f9ff",
};
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) : "";

// ---- building blocks -----------------------------------------------------------

function button(href, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 8px"><tr><td style="border-radius:12px;background:${C.brand}">
    <a href="${esc(href)}" style="display:inline-block;padding:14px 30px;font:600 15px ${FONT};color:#ffffff;text-decoration:none;border-radius:12px">${esc(label)}</a>
  </td></tr></table>`;
}

function badge(icon, tone = "brand") {
  const map = { brand: [C.brand, "#fff1f3"], success: [C.success, C.successBg], danger: [C.danger, C.dangerBg], info: [C.info, C.infoBg] };
  const [fg, bg] = map[tone] || map.brand;
  return `<div style="width:64px;height:64px;line-height:64px;margin:0 auto 18px;border-radius:50%;background:${bg};color:${fg};font-size:30px;text-align:center">${icon}</div>`;
}

function infoBox(rows) {
  const tr = rows
    .filter(Boolean)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;font:14px ${FONT};color:${C.muted}">${esc(k)}</td><td style="padding:6px 0;font:600 14px ${FONT};color:${C.ink};text-align:right">${v}</td></tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0;padding:14px 18px;background:${C.soft};border:1px solid ${C.border};border-radius:12px">${tr}</table>`;
}

function itemsTable(items) {
  const rows = items
    .map((i) => {
      const img = i.images?.[0]
        ? `<img src="${esc(i.images[0])}" width="56" height="56" alt="" style="display:block;width:56px;height:56px;border-radius:10px;object-fit:cover;border:1px solid ${C.border}">`
        : `<div style="width:56px;height:56px;border-radius:10px;background:${C.soft};border:1px solid ${C.border}"></div>`;
      return `<tr>
        <td style="padding:10px 12px 10px 0;width:56px;vertical-align:top">${img}</td>
        <td style="padding:10px 0;vertical-align:top;font:14px ${FONT};color:${C.ink}">${esc(i.name)}<div style="font:13px ${FONT};color:${C.muted};margin-top:3px">Qty ${esc(i.qty)} × ${esc(formatPrice(i.discountPrice))}</div></td>
        <td style="padding:10px 0;vertical-align:top;font:600 14px ${FONT};color:${C.ink};text-align:right;white-space:nowrap">${esc(formatPrice(i.discountPrice * i.qty))}</td>
      </tr>`;
    })
    .join(`<tr><td colspan="3" style="border-top:1px solid ${C.border};font-size:0;line-height:0">&nbsp;</td></tr>`);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0">${rows}</table>`;
}

function totals(order) {
  const line = (k, v, strong) =>
    `<tr><td style="padding:4px 0;font:${strong ? "700 16px" : "14px"} ${FONT};color:${strong ? C.ink : C.muted}">${k}</td><td style="padding:4px 0;font:${strong ? "700 16px" : "600 14px"} ${FONT};color:${strong ? C.brand : C.ink};text-align:right">${v}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;padding-top:10px;border-top:2px solid ${C.border}">
    ${line("Items total", esc(formatPrice(order.subTotal || order.totalPrice)))}
    ${line("Delivery", order.shippingFee ? esc(formatPrice(order.shippingFee)) : "FREE")}
    ${order.codFee ? line("COD fee", esc(formatPrice(order.codFee))) : ""}
    ${order.discount ? line(`Voucher${order.couponCode ? ` (${esc(order.couponCode)})` : ""}`, `− ${esc(formatPrice(order.discount))}`) : ""}
    ${line("Total", esc(formatPrice(order.totalPrice)), true)}
  </table>`;
}

function addressBlock(a = {}) {
  const lines = [
    `<strong style="color:${C.ink}">${esc(a.fullName)}</strong>`,
    a.phone && esc(formatPhone(a.phone)),
    esc([a.address1, a.address2].filter(Boolean).join(", ")),
    esc([a.city, provinceName(a.province), a.zipCode].filter(Boolean).join(", ")),
  ].filter(Boolean);
  return `<div style="font:14px/1.6 ${FONT};color:${C.muted}">${lines.join("<br>")}</div>`;
}

function h1(text) {
  return `<h1 style="margin:0 0 10px;font:700 24px/1.3 ${FONT};color:${C.ink};text-align:center">${text}</h1>`;
}
function p(text, center = true) {
  return `<p style="margin:0 0 12px;font:15px/1.65 ${FONT};color:${C.muted};${center ? "text-align:center" : ""}">${text}</p>`;
}
function sectionTitle(text) {
  return `<p style="margin:26px 0 8px;font:700 12px ${FONT};letter-spacing:.08em;text-transform:uppercase;color:${C.muted}">${text}</p>`;
}

// ---- page layout ---------------------------------------------------------------------

function layout({ origin, preheader, body, note }) {
  const store = esc(appConfig.name);
  const brand = appConfig.logoUrl
    ? `<img src="${esc(appConfig.logoUrl)}" alt="${store}" height="34" style="display:block;height:34px;border:0">`
    : `<span style="font:800 24px ${FONT};color:${C.brand};letter-spacing:-.02em">${store}</span>`;
  const link = (path, label) => `<a href="${esc(origin + path)}" style="color:${C.muted};text-decoration:none">${label}</a>`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only"><title>${store}</title></head>
<body style="margin:0;padding:0;background:${C.bg};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(preheader || "")}&#8203;&#8204;&#8203;&#8204;&#8203;&#8204;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg}"><tr><td align="center" style="padding:32px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
    <tr><td align="center" style="padding:0 0 22px"><a href="${esc(origin)}" style="text-decoration:none">${brand}</a></td></tr>
    <tr><td style="background:${C.card};border-radius:20px;border:1px solid ${C.border};overflow:hidden">
      <div style="height:6px;background:linear-gradient(90deg,${C.brand},#ff8a5c)"></div>
      <div style="padding:36px 32px 32px">${body}</div>
    </td></tr>
    ${note ? `<tr><td style="padding:18px 24px 0;font:13px/1.6 ${FONT};color:${C.muted};text-align:center">${note}</td></tr>` : ""}
    <tr><td style="padding:24px 24px 0;font:13px ${FONT};color:${C.muted};text-align:center">
      ${link("/products", "Shop")} &nbsp;·&nbsp; ${link("/profile/orders", "My orders")} &nbsp;·&nbsp; ${link("/faq", "Help")} &nbsp;·&nbsp; ${link("/contact", "Contact")}
    </td></tr>
    <tr><td style="padding:12px 24px 0;font:12px/1.6 ${FONT};color:#9ca3af;text-align:center">
      Support: ${esc(appConfig.policies?.supportHours || "")}<br>© ${new Date().getFullYear()} ${store}. All rights reserved.
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

// ---- templates ------------------------------------------------------------------------

export function verifyEmailTemplate({ user, url, origin }) {
  const store = appConfig.name;
  return {
    subject: `Verify your email for ${store}`,
    html: layout({
      origin,
      preheader: "One tap to activate your account.",
      body: [
        badge("✉"),
        h1(`Welcome, ${esc(user.name)}!`),
        p(`Thanks for joining <strong style="color:${C.ink}">${esc(store)}</strong>. Please confirm your email address to activate your account — you'll be signed in automatically.`),
        button(url, "Verify my email"),
        p(`This link expires in 24 hours.`),
        `<p style="margin:22px 0 0;padding-top:18px;border-top:1px solid ${C.border};font:12px/1.6 ${FONT};color:${C.muted};text-align:center;word-break:break-all">Button not working? Paste this link into your browser:<br><a href="${esc(url)}" style="color:${C.brand}">${esc(url)}</a></p>`,
      ].join(""),
      note: "Didn't create an account? You can safely ignore this email.",
    }),
    text: `Welcome, ${user.name}!\n\nPlease verify your email to activate your ${store} account:\n${url}\n\nThis link expires in 24 hours. If you didn't sign up, ignore this email.`,
  };
}

export function welcomeTemplate({ user, origin }) {
  const store = appConfig.name;
  return {
    subject: `Welcome to ${store} 🎉`,
    html: layout({
      origin,
      preheader: "Your account is ready — here's how to get started.",
      body: [
        badge("🎉", "success"),
        h1(`You're in, ${esc(user.name?.split(" ")[0] || "there")}!`),
        p(`Your ${esc(store)} account is ready. Here's what you can do:`),
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0">
          ${[
            ["🛋️", "Browse the catalogue", "New arrivals and best sellers, delivered across Pakistan."],
            ["🚚", "Track every order", "Courier, tracking number and live status in your account."],
            ["↩️", `${appConfig.policies?.returnWindowDays || 30}-day returns`, "Not right? Request a return from your orders."],
          ]
            .map(
              ([i, t, d]) => `<tr><td style="width:44px;padding:8px 0;font-size:22px;vertical-align:top">${i}</td><td style="padding:8px 0">
                <div style="font:600 15px ${FONT};color:${C.ink}">${t}</div><div style="font:14px/1.5 ${FONT};color:${C.muted}">${d}</div></td></tr>`
            )
            .join("")}
        </table>`,
        button(`${origin}/products`, "Start shopping"),
      ].join(""),
    }),
    text: `You're in, ${user.name}! Your ${store} account is ready. Start shopping: ${origin}/products`,
  };
}

const STATUS_COPY = {
  Processing: { icon: "🛍️", tone: "brand", title: "Thanks for your order!", line: "We've received your order and are getting it ready." },
  "Transferred to delivery partner": { icon: "📦", tone: "info", title: "Your order is on its way", line: "Your parcel has been handed to our courier partner." },
  "On the way": { icon: "🚚", tone: "info", title: "Out for delivery today", line: "The rider is on the way — please keep your phone reachable." },
  Delivered: { icon: "✅", tone: "success", title: "Delivered!", line: "Your order has been delivered. We hope you love it." },
  Cancelled: { icon: "✕", tone: "danger", title: "Your order was cancelled", line: "This order has been cancelled." },
  "Processing refund": { icon: "↩", tone: "info", title: "Refund requested", line: "We've received your refund request and will review it shortly." },
  "Refund Success": { icon: "💸", tone: "success", title: "Your refund is complete", line: "We've issued your refund to your original payment method." },
};

// Statuses that trigger a customer email (the others are internal steps).
export const NOTIFY_STATUSES = Object.keys(STATUS_COPY).filter((s) => s !== "Processing");

export function orderTemplate({ order, origin, status = order.status }) {
  const copy = STATUS_COPY[status] || STATUS_COPY.Processing;
  const id = shortOrderId(order._id);
  const url = `${origin}/user/track/order/${order._id}`;
  const placed = status === "Processing";
  const c = order.courier || {};
  const lastNote = [...(order.statusHistory || [])].reverse().find((h) => h.status === status)?.note;

  const rows = [
    ["Order", `<span style="font-family:monospace">${esc(id)}</span>`],
    placed && order.delivery?.etaFrom && ["Estimated delivery", `${esc(fmtDate(order.delivery.etaFrom))} – ${esc(fmtDate(order.delivery.etaTo))}`],
    placed && ["Payment", esc({ cod: "Cash on Delivery", online_full: "Paid online", partial_advance: "Advance + Cash on Delivery" }[order.paymentMethod] || "—")],
    order.remainingAmount > 0 && !["Delivered", "Cancelled", "Refund Success"].includes(status) && ["Due on delivery", esc(formatPrice(order.remainingAmount))],
    c.name && !placed && ["Courier", esc(c.name)],
    c.trackingNumber && !placed && ["Tracking number", `<span style="font-family:monospace">${esc(c.trackingNumber)}</span>`],
    status === "Cancelled" && order.cancelReason && ["Reason", esc(order.cancelReason)],
  ];

  const body = [
    badge(copy.icon, copy.tone),
    h1(esc(copy.title)),
    p(`Hi ${esc(order.shippingAddress?.fullName?.split(" ")[0] || order.user?.name?.split(" ")[0] || "there")}, ${esc(copy.line[0].toLowerCase() + copy.line.slice(1))}${lastNote && !placed ? ` <em>“${esc(lastNote)}”</em>` : ""}`),
    infoBox(rows),
    button(url, placed ? "View your order" : status === "Delivered" ? "Rate your items" : "Track your order"),
    sectionTitle(placed ? "Order summary" : "Items"),
    itemsTable(order.cart || []),
    placed ? totals(order) : "",
    placed ? sectionTitle("Delivering to") + addressBlock(order.shippingAddress) : "",
  ].join("");

  return {
    subject: placed ? `Order ${id} confirmed — thank you!` : `${copy.title} · Order ${id}`,
    html: layout({
      origin,
      preheader: `${copy.title} — order ${id}`,
      body,
      note: placed ? "You can cancel this order from your account until it's handed to the courier." : null,
    }),
    text: `${copy.title}\n\nOrder ${id}\n${copy.line}\n\nTrack it: ${url}`,
  };
}

export function contactToStoreTemplate({ name, email, subject, orderId, message, origin }) {
  return {
    subject: `[Contact] ${subject} — ${name}`,
    html: layout({
      origin,
      preheader: `${name}: ${message.slice(0, 80)}`,
      body: [
        badge("💬", "info"),
        h1("New message from the website"),
        infoBox([["From", esc(name)], ["Email", `<a href="mailto:${esc(email)}" style="color:${C.brand}">${esc(email)}</a>`], ["Topic", esc(subject)], orderId && ["Order", esc(orderId)]]),
        `<div style="padding:18px;border-left:4px solid ${C.brand};background:${C.soft};border-radius:8px;font:15px/1.65 ${FONT};color:${C.ink};white-space:pre-wrap">${esc(message)}</div>`,
        p(`Just hit <strong style="color:${C.ink}">Reply</strong> — your answer goes straight to ${esc(name)}.`),
      ].join(""),
    }),
    text: `From: ${name} <${email}>\nTopic: ${subject}${orderId ? `\nOrder: ${orderId}` : ""}\n\n${message}`,
  };
}

export function contactReceiptTemplate({ name, subject, message, origin }) {
  const store = appConfig.name;
  return {
    subject: `We got your message — ${store}`,
    html: layout({
      origin,
      preheader: "Thanks for reaching out — we'll reply soon.",
      body: [
        badge("✓", "success"),
        h1(`Thanks, ${esc(name.split(" ")[0])}!`),
        p(`We've received your message about <strong style="color:${C.ink}">${esc(subject)}</strong> and will reply by email, usually within one business day.`),
        `<div style="margin:20px 0;padding:16px 18px;background:${C.soft};border:1px solid ${C.border};border-radius:12px;font:14px/1.6 ${FONT};color:${C.muted};white-space:pre-wrap">${esc(message)}</div>`,
        button(`${origin}/faq`, "Browse quick answers"),
      ].join(""),
    }),
    text: `Thanks, ${name}! We received your message about "${subject}" and will reply soon.`,
  };
}
