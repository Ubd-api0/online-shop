import Link from "next/link";
import { PageHero, PageBody, DocLayout, HelpBanner } from "@/components/info/info-page";
import { Button } from "@/components/ui/button";
import appConfig from "@/config/appConfig";

export const metadata = {
  title: "Privacy Policy",
  description: `How ${appConfig.name} collects, uses and protects your personal information.`,
};

export default function PrivacyPage() {
  const store = appConfig.name;
  const sections = [
    {
      id: "collect",
      title: "Information we collect",
      content: (
        <>
          <p>We only collect what we need to run your account and deliver your orders:</p>
          <ul>
            <li>
              <strong>Account details</strong> — your name, email address, phone number, password (stored only in
              encrypted, hashed form) and profile photo if you add one.
            </li>
            <li>
              <strong>Delivery details</strong> — recipient name, mobile number and the addresses you save or use at
              checkout.
            </li>
            <li>
              <strong>Orders</strong> — what you bought, prices paid, delivery option, payment method and order status
              history.
            </li>
            <li>
              <strong>Messages</strong> — conversations you start with us through Messages or the contact form.
            </li>
            <li>
              <strong>Browser storage</strong> — your cart, wishlist and theme preference are kept in your own browser so
              they survive a page refresh. A secure sign-in cookie keeps you logged in.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "payments",
      title: "Payments",
      content: (
        <p>
          Online payments are processed by our payment partners (such as Stripe, PayPal, EasyPaisa and JazzCash). Your
          card or wallet details are entered on their secure systems — {store} never receives or stores your full card
          number or wallet PIN. We keep only a payment reference and status for your order.
        </p>
      ),
    },
    {
      id: "use",
      title: "How we use your information",
      content: (
        <ul>
          <li>to process, deliver and track your orders and handle returns;</li>
          <li>to verify your email, keep your account secure and prevent fraud;</li>
          <li>to reply to your questions and send messages about your orders;</li>
          <li>to improve our products, delivery and website.</li>
        </ul>
      ),
    },
    {
      id: "share",
      title: "Who we share it with",
      content: (
        <>
          <p>
            We <strong>never sell</strong> your personal information. We share only what is necessary with:
          </p>
          <ul>
            <li>
              <strong>Courier partners</strong> — the recipient name, phone number and delivery address needed to deliver
              your parcel;
            </li>
            <li>
              <strong>Payment providers</strong> — to process online payments and refunds;
            </li>
            <li>
              <strong>Service providers</strong> — such as email and hosting providers that help us run the store, under
              confidentiality obligations;
            </li>
            <li>authorities, when the law requires it.</li>
          </ul>
        </>
      ),
    },
    {
      id: "security",
      title: "How we protect it",
      content: (
        <p>
          Passwords are hashed, sign-in uses an HTTP-only secure cookie, and prices and payments are always verified on
          our servers. No system is perfectly secure, but we work to protect your data and limit access to staff who need
          it.
        </p>
      ),
    },
    {
      id: "retention",
      title: "How long we keep it",
      content: (
        <p>
          We keep your account information while your account is active. Order records are kept as long as needed for
          accounting, warranty and legal purposes, even if you close your account.
        </p>
      ),
    },
    {
      id: "rights",
      title: "Your choices and rights",
      content: (
        <>
          <p>
            You can view and update your profile, addresses and password at any time from{" "}
            <Link href="/profile">My Account</Link>, and clear your cart and wishlist from your browser.
          </p>
          <p>
            To request a copy of your data or deletion of your account, <Link href="/contact">contact us</Link> from the
            email address on your account.
          </p>
        </>
      ),
    },
    {
      id: "changes",
      title: "Changes to this policy",
      content: (
        <p>
          We may update this policy from time to time. The date at the top of this page shows when it last changed;
          significant changes will be highlighted on the website.
        </p>
      ),
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Policies"
        title="Privacy Policy"
        subtitle={`This policy explains what information ${store} collects, how we use it and the choices you have.`}
        updated={appConfig.policies.lastUpdated}
      />
      <PageBody>
        <DocLayout sections={sections} />
        <HelpBanner title="Questions about your privacy?" text="We're happy to explain how your data is handled.">
          <Link href="/contact">
            <Button>Contact us</Button>
          </Link>
        </HelpBanner>
      </PageBody>
    </>
  );
}
