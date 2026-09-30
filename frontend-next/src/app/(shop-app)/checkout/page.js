import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage({ searchParams }) {
  const { mode } = await searchParams;
  return (
    <>
      <CheckoutSteps active={1} />
      <CheckoutForm mode={mode} />
    </>
  );
}
