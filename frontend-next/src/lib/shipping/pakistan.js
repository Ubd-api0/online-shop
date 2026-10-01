import { State, City } from "country-state-city";

// Pakistan provinces / territories and their cities, cleaned up for address
// pickers: diacritics stripped ("Muzaffarābād" -> "Muzaffarabad") and
// administrative duplicates ("Kotli District", "... Agency") dropped.
// Shared by the checkout UI and the server-side rate engine so both resolve
// the same zone for the same address.

const strip = (s) => s.normalize("NFD").replace(/\p{Mn}/gu, "").trim();
const ADMIN_UNIT = /\b(District|Agency|Division|Tehsil)\b/i;

export const PROVINCES = State.getStatesOfCountry("PK")
  .map((s) => ({ code: s.isoCode, name: strip(s.name) }))
  .sort((a, b) => a.name.localeCompare(b.name));

// Well-known places missing from the country-state-city dataset.
const EXTRA_CITIES = {
  PB: ["Attock"],
  KP: ["Swat"],
  GB: ["Hunza"],
  JK: ["Mirpur", "Bagh", "Rawalakot"],
};

// Shown first (in this order) before the user types anything.
export const POPULAR_CITIES = {
  PB: ["Lahore", "Faisalabad", "Rawalpindi", "Multan", "Gujranwala", "Sialkot", "Bahawalpur", "Sargodha"],
  SD: ["Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas"],
  KP: ["Peshawar", "Mardan", "Abbottabad", "Swat", "Kohat", "Dera Ismail Khan"],
  BA: ["Quetta", "Gwadar", "Turbat", "Khuzdar"],
  IS: ["Islamabad"],
  GB: ["Gilgit", "Skardu", "Hunza"],
  JK: ["Muzaffarabad", "Mirpur", "Kotli", "Rawalakot"],
};

const cityCache = new Map();

export function citiesOf(provinceCode) {
  if (!provinceCode) return [];
  if (!cityCache.has(provinceCode)) {
    const names = City.getCitiesOfState("PK", provinceCode)
      .map((c) => strip(c.name))
      .concat(EXTRA_CITIES[provinceCode] || [])
      .filter((n) => n && !ADMIN_UNIT.test(n));
    cityCache.set(provinceCode, [...new Set(names)].sort((a, b) => a.localeCompare(b)));
  }
  return cityCache.get(provinceCode);
}

export const provinceName = (code) => PROVINCES.find((p) => p.code === code)?.name || code || "";

export const sameCity = (a, b) => !!a && !!b && strip(a).toLowerCase() === strip(b).toLowerCase();

// Older saved addresses (from the previous checkout) stored the province
// code in `city` and had no `province`. Normalize both shapes.
export function normalizeAddress(address = {}) {
  const a = { ...address };
  if (!a.province && a.city && PROVINCES.some((p) => p.code === a.city)) {
    a.province = a.city;
    a.city = "";
  }
  if (!a.country) a.country = "PK";
  return a;
}
