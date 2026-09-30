import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <>
      <CheckoutSteps active={1} />
      <CheckoutForm />
    </>
  );
}
