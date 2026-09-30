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
};

export default appConfig;
