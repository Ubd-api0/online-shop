// Couriers a shipment can be handed to. `site` is the courier's public site,
// where customers can look up a tracking number; when the seller pastes a
// direct tracking link for a parcel, that link is used instead.
export const COURIERS = [
  { key: "tcs", name: "TCS", site: "https://www.tcsexpress.com" },
  { key: "leopards", name: "Leopards Courier", site: "https://www.leopardscourier.com" },
  { key: "mnp", name: "M&P", site: "https://www.mulphilog.com" },
  { key: "postex", name: "PostEx", site: "https://postex.pk" },
  { key: "trax", name: "Trax", site: "https://trax.pk" },
  { key: "callcourier", name: "Call Courier", site: "https://callcourier.com.pk" },
  { key: "daewoo", name: "Daewoo FastEx", site: "https://fastex.pk" },
  { key: "pakpost", name: "Pakistan Post", site: "https://ep.gov.pk" },
  { key: "own", name: "Own rider", site: "" },
  { key: "other", name: "Other", site: "" },
];

export const courierByKey = (key) => COURIERS.find((c) => c.key === key);

export function trackingLink(courier) {
  if (!courier) return "";
  if (courier.trackingUrl) return courier.trackingUrl;
  return courierByKey(courier.key)?.site || "";
}
