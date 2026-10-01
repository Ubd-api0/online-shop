// Single source of truth for the order lifecycle — used by the API (which
// transitions are allowed), the seller's status picker and the customer's
// tracking timeline. Status strings are unchanged from the original app so
// existing orders keep working.

export const NORMAL_STAGES = [
  "Processing",
  "Transferred to delivery partner",
  "Shipping",
  "Received",
  "On the way",
  "Delivered",
];

export const MADE_TO_ORDER_STAGES = [
  "Processing",
  "Manufacturing",
  "Ready to ship",
  "Transferred to delivery partner",
  "Shipping",
  "Received",
  "On the way",
  "Delivered",
];

export const REFUND_STAGES = ["Processing refund", "Refund Success"];
export const CANCELLED = "Cancelled";

// Customer-facing wording for each stage.
export const STAGE_INFO = {
  Processing: { title: "Order placed", text: "We've received your order and are preparing it." },
  Manufacturing: { title: "Being made", text: "Your item is being made to order." },
  "Ready to ship": { title: "Ready to ship", text: "Your order is packed and waiting for pickup." },
  "Transferred to delivery partner": { title: "Handed to courier", text: "Your parcel has been handed to the courier." },
  Shipping: { title: "In transit", text: "Your parcel is travelling to your city." },
  Received: { title: "Arrived in your city", text: "Your parcel reached the local courier facility." },
  "On the way": { title: "Out for delivery", text: "The rider is on the way to your address." },
  Delivered: { title: "Delivered", text: "Your order has been delivered. Enjoy!" },
  "Processing refund": { title: "Refund requested", text: "Your refund request is being processed." },
  "Refund Success": { title: "Refunded", text: "Your refund has been completed." },
  Cancelled: { title: "Cancelled", text: "This order was cancelled." },
};

export const stagesFor = (order) => (order?.hasMadeToOrder ? MADE_TO_ORDER_STAGES : NORMAL_STAGES);

// The customer may cancel until the parcel leaves the store.
export const CUSTOMER_CANCELLABLE = ["Processing", "Manufacturing", "Ready to ship"];

export const isRefundStatus = (s) => REFUND_STAGES.includes(s);

// Statuses the seller may move an order to from its current status:
// forward along its stage list, or Cancelled before it has been delivered.
export function nextStatusesFor(order) {
  const current = order?.status;
  if (current === CANCELLED || current === "Refund Success") return [];
  if (current === "Processing refund") return ["Refund Success"];
  const stages = stagesFor(order);
  const idx = stages.indexOf(current);
  const forward = idx === -1 ? stages : stages.slice(idx + 1);
  return current === "Delivered" ? [] : [...forward, CANCELLED];
}

export function statusTone(status) {
  if (status === "Delivered" || status === "Refund Success") return "success";
  if (status === CANCELLED) return "destructive";
  if (isRefundStatus(status)) return "warning";
  return "info";
}
