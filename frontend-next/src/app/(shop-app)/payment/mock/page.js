import { Suspense } from "react";
import { PaymentMockContent } from "@/components/payment/payment-mock-content";

export const metadata = { title: "Payment sandbox" };

export default function PaymentMockPage() {
  return (
    <Suspense fallback={null}>
      <PaymentMockContent />
    </Suspense>
  );
}
