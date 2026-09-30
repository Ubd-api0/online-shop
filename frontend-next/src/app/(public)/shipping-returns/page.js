import { LegalSection } from "@/components/legal/legal-section";
import appConfig from "@/config/appConfig";

export const metadata = { title: "Shipping & Returns" };

export default function ShippingReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <h1 className="text-3xl font-bold text-content">Shipping & Returns</h1>

      <LegalSection title="Shipping">
        <p>
          Orders are processed within 1–2 business days. In-stock items ship immediately;
          made-to-order items ship after the lead time shown on the product page.
        </p>
        <p>A flat shipping fee is calculated at checkout and shown before you pay.</p>
      </LegalSection>

      <LegalSection title="Returns">
        <p>
          If you&apos;re not satisfied, you can request a return within 30 days of delivery. Items
          should be unused and in their original condition.
        </p>
        <p>
          To start a return, open the order under Profile → Orders and choose &ldquo;Give a
          Refund&rdquo;, or contact us and we&apos;ll help.
        </p>
      </LegalSection>

      <LegalSection title="Refunds">
        <p>
          Once a return is approved, the refund is issued to your original payment method.
          Cash-on-delivery orders are refunded by the method agreed with our team.
        </p>
      </LegalSection>

      <p className="text-sm text-muted">
        Questions about a specific order? Contact {appConfig.name} and we&apos;ll sort it out.
      </p>
    </div>
  );
}
