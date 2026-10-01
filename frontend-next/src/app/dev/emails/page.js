import { notFound } from "next/navigation";
import {
  verifyEmailTemplate,
  welcomeTemplate,
  orderTemplate,
  contactToStoreTemplate,
  contactReceiptTemplate,
} from "@/lib/email/templates";

export const metadata = { title: "Email previews" };

// Development-only gallery of every transactional email, rendered with
// sample data (nothing is sent). 404s in production.
export default function EmailPreviews() {
  if (process.env.NODE_ENV === "production") notFound();

  const origin = "http://localhost:3000";
  const user = { _id: "u1", name: "Ayesha Khan", email: "ayesha@example.com" };
  const img = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=200`;
  const order = {
    _id: "6abdf9419c43377399bb259a",
    user,
    cart: [
      { name: "Milano 3-Seater Velvet Sofa", qty: 1, discountPrice: 73800, images: [img(1866149)] },
      { name: "Marble Top Round Coffee Table", qty: 2, discountPrice: 31500, images: [img(2995012)] },
    ],
    subTotal: 136800,
    shippingFee: 1450,
    codFee: 0,
    discount: 5000,
    couponCode: "WELCOME10",
    totalPrice: 133250,
    paymentMethod: "cod",
    remainingAmount: 133250,
    shippingAddress: {
      fullName: "Ayesha Khan",
      phone: "03001234567",
      address1: "House 12, Street 4, Block 7",
      address2: "Gulshan-e-Iqbal",
      city: "Karachi",
      province: "SD",
      zipCode: "75300",
    },
    delivery: { etaFrom: new Date(Date.now() + 3 * 864e5), etaTo: new Date(Date.now() + 5 * 864e5) },
    courier: { name: "TCS", trackingNumber: "TCS88812345" },
    statusHistory: [{ status: "On the way", note: "Rider assigned: Bilal" }],
    cancelReason: "Changed my mind",
  };

  const emails = [
    ["Verify email", verifyEmailTemplate({ user, url: `${origin}/activation/sample-token`, origin })],
    ["Welcome", welcomeTemplate({ user, origin })],
    ["Order confirmation", orderTemplate({ order, origin, status: "Processing" })],
    ["Shipped", orderTemplate({ order, origin, status: "Transferred to delivery partner" })],
    ["Out for delivery", orderTemplate({ order, origin, status: "On the way" })],
    ["Delivered", orderTemplate({ order, origin, status: "Delivered" })],
    ["Cancelled", orderTemplate({ order, origin, status: "Cancelled" })],
    ["Refund complete", orderTemplate({ order, origin, status: "Refund Success" })],
    ["Contact → store", contactToStoreTemplate({ name: "Ayesha Khan", email: user.email, subject: "Order & delivery", orderId: "#99BB259A", message: "Hi! Can I change the delivery address for my order? I'm moving next week.", origin })],
    ["Contact receipt", contactReceiptTemplate({ name: "Ayesha Khan", subject: "Order & delivery", message: "Hi! Can I change the delivery address for my order?", origin })],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-semibold text-content">Email previews</h1>
      <p className="mb-6 text-sm text-muted">Sample data only — nothing is sent. Development builds only.</p>
      <div className="grid gap-8 xl:grid-cols-2">
        {emails.map(([label, t]) => (
          <section key={label}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
            <p className="mb-2 text-sm font-medium text-content">Subject: {t.subject}</p>
            <iframe title={label} srcDoc={t.html} className="h-[760px] w-full rounded-lg border border-border bg-white" />
          </section>
        ))}
      </div>
    </div>
  );
}
