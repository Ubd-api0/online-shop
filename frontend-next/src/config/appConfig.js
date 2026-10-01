// ---------------------------------------------------------------------------
// Application branding config.
//
// This is the ONE file to edit when re-deploying the storefront for a
// different shop. It is the source of truth for the customer-facing brand:
// the header wordmark/logo, the footer brand block, the browser tab title,
// the favicon and the meta description.
//
// Operational data (shop phone / address / email, product catalogue, payment
// criteria, storefront hero & categories) still lives in the database and is
// edited by the owner from the dashboard — it is NOT configured here.
// ---------------------------------------------------------------------------

const appConfig = {
  // Brand / store name. Shown as the header wordmark (when `logoUrl` is empty),
  // the footer brand, and the browser tab title.
  name: "Shop",

  // One short line under the brand in the footer, also used as the page
  // <meta name="description">.
  tagline: "Your one-stop online store.",

  // Absolute URL to a logo image. Leave "" to render `name` as text instead.
  logoUrl: "",

  // Favicon: an absolute URL or a path served from /public (e.g. "/favicon.ico").
  favicon: "/favicon.ico",

  // Optional support email for the Contact page. Leave "" to fall back to the
  // shop email stored in the database (Dashboard → Settings).
  supportEmail: "",

  // Currency every price in the storefront and dashboard is shown in.
  // `symbol` is prefixed to amounts; `locale` controls digit grouping.
  currency: { code: "PKR", symbol: "Rs.", locale: "en-PK" },

  // Store policies quoted on the FAQ, Shipping & Returns, Terms and Contact
  // pages — edit here and every page stays consistent. Delivery prices and
  // times are NOT here: they come live from Dashboard -> Shipping.
  policies: {
    returnWindowDays: 30, // days after delivery a return/refund can be requested
    refundProcessingDays: "5–7 business days",
    processingDays: "1–2 business days", // time to pack & hand over in-stock orders
    supportHours: "Monday – Saturday, 10:00 am – 7:00 pm",
    lastUpdated: "2026-10-01", // shown on the legal pages
  },
};

export default appConfig;
