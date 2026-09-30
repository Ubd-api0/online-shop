"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "What is your return policy?",
    a: "If you're not satisfied with your purchase, we accept returns within 30 days of delivery. To initiate a return, please email us with your order number and a brief explanation of why you're returning the item.",
  },
  {
    q: "How do I track my order?",
    a: "You can track your order by clicking the tracking link in your shipping confirmation email, or by logging into your account and viewing the order details.",
  },
  {
    q: "How do I contact customer support?",
    a: "You can contact our customer support team via the Contact page, or by calling us between 9am and 5pm, Monday through Friday.",
  },
  {
    q: "Can I change or cancel my order?",
    a: "Unfortunately, once an order has been placed, we are not able to make changes or cancellations. If you no longer want the items you've ordered, you can return them for a refund within 30 days of delivery.",
  },
  {
    q: "Do you offer international shipping?",
    a: "Currently, we only offer domestic shipping.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Visa, Mastercard, PayPal, and also offer cash on delivery.",
  },
];

export function FaqAccordion() {
  const [active, setActive] = useState(null);

  return (
    <div className="max-w-3xl space-y-4">
      {FAQS.map((item, i) => (
        <div key={item.q} className="border-b border-border pb-4">
          <button
            className="flex w-full items-center justify-between text-left"
            onClick={() => setActive(active === i ? null : i)}
          >
            <span className="text-lg font-medium text-content">{item.q}</span>
            <ChevronDown
              className={`size-5 shrink-0 text-muted transition-transform ${
                active === i ? "rotate-180" : ""
              }`}
            />
          </button>
          {active === i && <p className="mt-4 text-base text-muted">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}
