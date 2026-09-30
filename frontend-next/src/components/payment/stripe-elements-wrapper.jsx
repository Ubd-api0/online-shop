"use client";

import { useMemo } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PaymentForm } from "@/components/payment/payment-form";

export function StripeElementsWrapper({ config }) {
  const stripePromise = useMemo(
    () => (config?.stripeApiKey ? loadStripe(config.stripeApiKey) : null),
    [config?.stripeApiKey]
  );

  if (!stripePromise) return <PaymentForm initialConfig={config} />;

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm initialConfig={config} />
    </Elements>
  );
}
