import appConfig from "@/config/appConfig";

// FAQ copy — written to match how the store actually works (checkout,
// delivery engine, order lifecycle, refunds). Policy numbers come from
// appConfig.policies so every page quotes the same values.
export function getFaqGroups() {
  const p = appConfig.policies;
  const store = appConfig.name;

  return [
    {
      key: "orders",
      title: "Orders",
      items: [
        {
          q: "How do I place an order?",
          a: `Add products to your cart (or tap "Buy Now" on any product), choose the items you want to check out, enter your delivery address, pick a delivery option and payment method, then place your order. You'll get an order number straight away.`,
        },
        {
          q: "Can I buy only some of the items in my cart?",
          a: "Yes. Every item in your cart has a checkbox — tick only the items you want to buy now. The rest stay in your cart for later.",
        },
        {
          q: "Can I change or cancel my order?",
          a: `You can cancel an order yourself from My Orders until it is handed to the courier (status "Order placed", "Being made" or "Ready to ship"). After that it can no longer be cancelled, but you can request a return once it's delivered.`,
        },
        {
          q: "What does \"made to order\" mean?",
          a: "Some products are produced after you order them. Their product page shows the expected lead time, and your estimated delivery date at checkout already includes it.",
        },
        {
          q: "Do I need an account to order?",
          a: "Yes — an account lets you track orders, save addresses and request returns. Sign up with your email, open the verification link we send you, and you're ready to shop.",
        },
      ],
    },
    {
      key: "delivery",
      title: "Delivery & tracking",
      items: [
        {
          q: "How much is delivery?",
          a: "Delivery is calculated from the parcel's weight and your city, the same way couriers charge. You'll see the exact fee — and any free-delivery offer — at checkout before you pay. Full rates are on our Shipping & Returns page.",
        },
        {
          q: "How long will delivery take?",
          a: `In-stock orders are packed within ${p.processingDays}. Delivery time then depends on your location — your checkout shows a "Get by" date range, and the Shipping & Returns page lists times for every zone. Express delivery is available in many areas.`,
        },
        {
          q: "How do I track my order?",
          a: "Open My Account → Track Order (or My Orders → Track). You'll see every step with dates, and once your parcel is dispatched, the courier name, tracking number and a link to the courier's own tracking page.",
        },
        {
          q: "Which cities do you deliver to?",
          a: "We deliver across Pakistan, including remote areas such as Gilgit-Baltistan and Azad Kashmir. Remote areas may take a little longer.",
        },
        {
          q: "Do you ship internationally?",
          a: "Not at the moment — we currently deliver within Pakistan only.",
        },
      ],
    },
    {
      key: "payments",
      title: "Payments & vouchers",
      items: [
        {
          q: "Which payment methods do you accept?",
          a: "Depending on the products in your order, you can choose Cash on Delivery, pay in full online (card, EasyPaisa, JazzCash or PayPal), or pay a part in advance and the rest on delivery. Available options are shown at checkout.",
        },
        {
          q: "Is it safe to pay online?",
          a: `Yes. Online payments are processed by our payment partners — ${store} never sees or stores your card number. Prices and totals are always re-checked on our server when the order is placed.`,
        },
        {
          q: "How do I use a voucher code?",
          a: "Enter the code in the Voucher box on the checkout page and tap Apply. The discount appears in your order summary immediately; if a code can't be used for your items, we'll tell you why.",
        },
        {
          q: "Is there a fee for Cash on Delivery?",
          a: "If a cash-handling fee applies, it's shown as a separate line in your order summary before you place the order.",
        },
      ],
    },
    {
      key: "returns",
      title: "Returns & refunds",
      items: [
        {
          q: "What is your return policy?",
          a: `You can request a return within ${p.returnWindowDays} days of delivery. Items should be unused, in their original condition and packaging. See Shipping & Returns for the full policy.`,
        },
        {
          q: "How do I request a refund?",
          a: `Open the delivered order from My Orders and tap "Request a refund". You can follow the request on the same page.`,
        },
        {
          q: "When will I get my money back?",
          a: `Once your return is approved, refunds are processed within ${p.refundProcessingDays} to your original payment method. Cash-on-delivery orders are refunded by bank transfer or mobile wallet.`,
        },
      ],
    },
    {
      key: "account",
      title: "Account & support",
      items: [
        {
          q: "I didn't receive my verification email.",
          a: "Check your spam or promotions folder. You can also simply try to log in — if your email isn't verified yet, we'll send you a fresh link automatically.",
        },
        {
          q: "How do I change my password or address?",
          a: "Go to My Account → Change Password, or My Account → Address Book to add, edit or remove saved addresses.",
        },
        {
          q: "How can I contact customer support?",
          a: `Message us from the Messages section of your account, or use the Contact page. We're available ${p.supportHours}.`,
        },
      ],
    },
  ];
}
