// Pakistani phone numbers, in one place. Stored canonically as 11 digits with
// the leading 0 ("03001234567"); shown as "0300-1234567". Older records kept
// the number as a Number (leading 0 lost: 3001234567) — these helpers accept
// that too.

export const digitsOf = (v) => String(v ?? "").replace(/\D/g, "");

// Any input (+92 300 1234567, 0092..., 3001234567, 0300-1234567) -> "03001234567"-style digits.
export function normalizePhone(v) {
  let d = digitsOf(v);
  if (d.startsWith("0092")) d = "0" + d.slice(4);
  else if (d.startsWith("92") && d.length >= 12) d = "0" + d.slice(2);
  else if (d && !d.startsWith("0")) d = "0" + d;
  return d.slice(0, 11);
}

// "03001234567" -> "0300-1234567" (partial input is formatted as it grows).
export function formatPhone(v) {
  const d = normalizePhone(v);
  return d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
}

export const isValidMobile = (v) => /^03\d{9}$/.test(normalizePhone(v));

// Shop / landline numbers: 10–11 digits starting with 0.
export const isValidPhone = (v) => /^0\d{9,10}$/.test(normalizePhone(v));
