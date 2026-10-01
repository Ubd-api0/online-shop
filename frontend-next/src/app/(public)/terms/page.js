import Link from "next/link";
import { PageHero, PageBody, DocLayout, HelpBanner } from "@/components/info/info-page";
import { Button } from "@/components/ui/button";
import appConfig from "@/config/appConfig";

export const metadata = {
  title: "Terms of Service",
  description: `The terms that apply when you shop at ${appConfig.name}.`,
};

export default function TermsPage() {
  const store = appConfig.name;
  const p = appConfig.policies;
  const sections = [
    {
      id: "agreement",
      title: "Agreement",
      content: (
        <p>
          By creating an account or placing an order with {store}, you agree to these terms together with our{" "}
          <Link href="/privacy">Privacy Policy</Link> and <Link href="/shipping-returns">Shipping &amp; Returns</Link>{" "}
          policy.
        </p>
      ),
    },
    {
      id: "accounts",
      title: "Your account",
      content: (
        <ul>
          <li>You must provide accurate details and verify your email address before your account can be used.</li>
          <li>Keep your password private — you are responsible for activity on your account.</li>
          <li>We may suspend accounts involved in fraud, abuse or repeated refused deliveries.</li>
        </ul>
      ),
    },
    {
      id: "products",
      title: "Products & pricing",
      content: (
        <>
          <p>
            We make every effort to describe and photograph products accurately; colours and finishes may vary slightly
            between screens. Made-to-order items are produced after you order, within the lead time shown on the product.
          </p>
          <p>
            Prices are shown in Pakistani Rupees and include applicable taxes unless stated otherwise. Prices, delivery
            fees and availability are confirmed by our system when your order is placed — the total you see at checkout is
            the total you pay.
          </p>
        </>
      ),
    },
    {
      id: "orders",
      title: "Orders",
      content: (
        <>
          <p>
            Placing an order is an offer to buy. The order is accepted when we start processing it. We may decline or
            cancel an order — for example if an item becomes unavailable or a pricing error occurs — and any amount you
            paid will be refunded in full.
          </p>
          <p>
            You can cancel an order yourself until it is handed to the courier, as described in our{" "}
            <Link href="/shipping-returns#cancellations">cancellation policy</Link>.
          </p>
        </>
      ),
    },
    {
      id: "payment",
      title: "Payment",
      content: (
        <>
          <p>
            Available payment methods — Cash on Delivery, full online payment, or a partial advance with the balance on
            delivery — are shown at checkout and may depend on the products in your order.
          </p>
          <p>
            For Cash-on-Delivery and advance orders, the remaining balance must be paid to the courier on delivery.
          </p>
        </>
      ),
    },
    {
      id: "vouchers",
      title: "Vouchers",
      content: (
        <p>
          Voucher codes apply only to eligible products and minimum order values stated with the voucher, cannot be
          exchanged for cash and may be withdrawn at any time. Only one voucher can be used per order.
        </p>
      ),
    },
    {
      id: "delivery",
      title: "Delivery",
      content: (
        <p>
          Delivery dates are estimates. Risk in the goods passes to you on delivery. Please check your parcel when it
          arrives and report visible damage straight away. Full details are in{" "}
          <Link href="/shipping-returns">Shipping &amp; Returns</Link>.
        </p>
      ),
    },
    {
      id: "returns",
      title: "Returns & refunds",
      content: (
        <p>
          You may request a return within {p.returnWindowDays} days of delivery under the conditions of our{" "}
          <Link href="/shipping-returns#returns">returns policy</Link>. Approved refunds are issued within{" "}
          {p.refundProcessingDays}.
        </p>
      ),
    },
    {
      id: "reviews",
      title: "Reviews & content",
      content: (
        <p>
          Reviews must be honest and about products you bought. We may remove content that is offensive, misleading or
          unrelated to the product.
        </p>
      ),
    },
    {
      id: "liability",
      title: "Liability",
      content: (
        <p>
          To the extent permitted by law, our liability for any order is limited to the amount you paid for it. Nothing in
          these terms limits your rights as a consumer under the laws of Pakistan.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to these terms",
      content: (
        <p>
          We may update these terms. The version in force when you place an order applies to that order. Questions?{" "}
          <Link href="/contact">Contact us</Link>.
        </p>
      ),
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Policies"
        title="Terms of Service"
        subtitle={`The rules for using ${store} and buying from us — written to be clear and fair.`}
        updated={p.lastUpdated}
      />
      <PageBody>
        <DocLayout sections={sections} />
        <HelpBanner text="If anything here is unclear, just ask.">
          <Link href="/contact">
            <Button>Contact us</Button>
          </Link>
        </HelpBanner>
      </PageBody>
    </>
  );
}
