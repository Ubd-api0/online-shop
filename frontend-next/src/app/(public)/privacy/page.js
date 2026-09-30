import { LegalSection } from "@/components/legal/legal-section";
import appConfig from "@/config/appConfig";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <h1 className="text-3xl font-bold text-content">Privacy Policy</h1>
      <p className="leading-7 text-muted">
        This policy explains what information {appConfig.name} collects and how it is used.
      </p>

      <LegalSection title="Information we collect">
        <p>
          Account details you provide (name, email, phone), shipping addresses you save, and your
          order history. Payment is handled by our payment providers — we do not store card
          numbers.
        </p>
      </LegalSection>

      <LegalSection title="How we use it">
        <p>
          To process and deliver your orders, provide support, and keep your account secure. We
          do not sell your personal information.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You can view and update your profile, addresses and password at any time from the
          Profile page. Contact us to request deletion of your account.
        </p>
      </LegalSection>
    </div>
  );
}
