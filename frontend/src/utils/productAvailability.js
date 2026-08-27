// Fulfillment-aware availability helpers.
//  - in_stock:      available only while stock > 0
//  - made_to_order: always available (manufactured after the order is placed)

export const isMadeToOrder = (p) => p?.fulfillment === "made_to_order";

export const isAvailable = (p) =>
  isMadeToOrder(p) || Number(p?.stock ?? 0) > 0;

// Max quantity a customer may add for one product (made-to-order is effectively unlimited).
export const maxQty = (p) => (isMadeToOrder(p) ? 9999 : Number(p?.stock ?? 0));

export const availabilityLabel = (p) => {
  if (isMadeToOrder(p)) {
    return p?.leadTimeDays
      ? `Made to order · ships in ~${p.leadTimeDays} day${p.leadTimeDays > 1 ? "s" : ""}`
      : "Made to order";
  }
  return Number(p?.stock ?? 0) > 0 ? "In stock" : "Currently unavailable";
};

// short badge text for cards
export const availabilityBadge = (p) => {
  if (isMadeToOrder(p)) return "Made to order";
  return Number(p?.stock ?? 0) > 0 ? null : "Unavailable";
};
