import Link from "next/link";
import { LegalSection } from "@/components/legal/legal-section";
import appConfig from "@/config/appConfig";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <h1 className="text-3xl font-bold text-content">Terms of Service</h1>
      <p className="leading-7 text-muted">By using {appConfig.name} you agree to the following terms.</p>

      <LegalSection title="Orders">
        <p>
          Placing an order is an offer to buy. We confirm acceptance when the order is processed.
          Prices and availability can change until an order is confirmed.
        </p>
      </LegalSection>

      <LegalSection title="Payment">
        <p>
          Accepted payment methods are shown at checkout. For advance or cash-on-delivery orders,
          the remaining balance is due as described at checkout.
        </p>
      </LegalSection>

      <LegalSection title="Returns & refunds">
        <p>
          Returns are governed by our{" "}
          <Link href="/shipping-returns" className="text-brand hover:underline">
            Shipping &amp; Returns
          </Link>{" "}
          policy.
        </p>
      </LegalSection>

      <LegalSection title="Accounts">
        <p>
          You are responsible for keeping your account credentials secure and for activity under
          your account.
        </p>
      </LegalSection>
    </div>
  );
}
