import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { StripeElementsWrapper } from "@/components/payment/stripe-elements-wrapper";
import { getPaymentConfig } from "@/lib/data/payment";

export const metadata = { title: "Payment" };

export default async function PaymentPage() {
  const config = await getPaymentConfig();

  return (
    <>
      <CheckoutSteps active={2} />
      <StripeElementsWrapper config={config} />
    </>
  );
}
