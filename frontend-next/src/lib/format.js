import appConfig from "@/config/appConfig";

const { symbol, locale } = appConfig.currency || { symbol: "Rs.", locale: "en-PK" };

// "Rs. 1,250" — whole amounts are shown without decimals, fractional ones with two.
export function formatPrice(value) {
  const n = Number(value || 0);
  const digits = Number.isInteger(n) ? 0 : 2;
  return `${symbol} ${n.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

// "Tue, 7 Oct"
export function formatShortDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

// "7 Oct 2026"
export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// "7 Oct 2026, 3:42 pm"
export function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export const shortOrderId = (id) => `#${String(id || "").slice(-8).toUpperCase()}`;
