import Link from "next/link";
import { Truck, Zap, Gift, PackageCheck, RotateCcw } from "lucide-react";
import { getPublicShippingSettings } from "@/lib/data/shops";
import { ZONES } from "@/lib/shipping/rates";
import { provinceName } from "@/lib/shipping/pakistan";
import { formatPrice } from "@/lib/format";
import { PageHero, PageBody, DocLayout, HelpBanner } from "@/components/info/info-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import appConfig from "@/config/appConfig";

export const metadata = {
  title: "Shipping & Returns",
  description: `Delivery rates, delivery times, order tracking, cancellations and returns at ${appConfig.name}.`,
};

// Always reflects the owner's live settings (Dashboard -> Shipping).
export const dynamic = "force-dynamic";

const days = (a, b) => (a === b ? `${a} day${a === 1 ? "" : "s"}` : `${a}–${b} days`);

export default async function ShippingReturnsPage() {
  const s = await getPublicShippingSettings();
  const p = appConfig.policies;
  const zoneHint = {
    same_city: `Within ${s.originCity}`,
    same_province: `Elsewhere in ${provinceName(s.originProvince)}`,
    other_province: "All other provinces",
    remote: s.remoteProvinces.length ? s.remoteProvinces.map(provinceName).join(", ") : "Remote areas",
  };

  const highlights = [
    { icon: Truck, title: "Nationwide delivery", text: `Shipped from ${s.originCity} to every province.` },
    s.express.enabled && { icon: Zap, title: "Express available", text: `${days(s.express.etaMin, s.express.etaMax)} in most areas.` },
    s.freeShippingThreshold > 0 && {
      icon: Gift,
      title: "Free delivery",
      text: `Standard delivery is free on orders over ${formatPrice(s.freeShippingThreshold)}.`,
    },
    { icon: RotateCcw, title: `${p.returnWindowDays}-day returns`, text: "Easy returns on delivered orders." },
  ].filter(Boolean);

  const sections = [
    {
      id: "processing",
      title: "Order processing",
      content: (
        <>
          <p>
            In-stock orders are packed and handed to our courier partner within <strong>{p.processingDays}</strong>.
            Made-to-order items ship after the production time shown on the product page — your checkout estimate already
            includes it.
          </p>
          <p>Orders placed on Sundays or public holidays are processed on the next working day.</p>
        </>
      ),
    },
    {
      id: "rates",
      title: "Delivery rates & times",
      content: (
        <>
          <p>
            Delivery is priced the way couriers charge: a rate for the first 0.5 kg and a rate for each extra 0.5 kg,
            depending on how far your parcel travels. Weight is rounded up to the next 0.5 kg. You always see the exact fee
            at checkout before you pay.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-surface-alt text-left text-content">
                <tr>
                  <th className="px-4 py-3 font-semibold">Destination</th>
                  <th className="px-4 py-3 font-semibold">First 0.5 kg</th>
                  <th className="px-4 py-3 font-semibold">Each extra 0.5 kg</th>
                  <th className="px-4 py-3 font-semibold">Standard delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {ZONES.map((z) => {
                  const r = s.rates[z.key];
                  return (
                    <tr key={z.key}>
                      <td className="px-4 py-3">
                        <span className="block font-medium text-content">{z.label}</span>
                        <span className="text-xs text-muted">{zoneHint[z.key]}</span>
                      </td>
                      <td className="px-4 py-3 text-content">{formatPrice(r.firstHalfKg)}</td>
                      <td className="px-4 py-3 text-content">{formatPrice(r.extraHalfKg)}</td>
                      <td className="px-4 py-3 text-content">{days(r.etaMin, r.etaMax)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {s.express.enabled && (
            <p>
              <strong>Express delivery</strong> costs {s.express.multiplier}× the standard rate and arrives in{" "}
              {days(s.express.etaMin, s.express.etaMax)}. It&apos;s offered at checkout wherever it&apos;s faster than
              standard delivery.
            </p>
          )}
          {s.freeShippingThreshold > 0 && (
            <p>
              <strong>Free standard delivery</strong> on orders of {formatPrice(s.freeShippingThreshold)} or more.
            </p>
          )}
          {s.codFee > 0 && (
            <p>
              A cash-handling fee of <strong>{formatPrice(s.codFee)}</strong> applies to Cash-on-Delivery orders.
            </p>
          )}
          <p>We currently deliver within Pakistan only.</p>
        </>
      ),
    },
    {
      id: "tracking",
      title: "Tracking your order",
      content: (
        <>
          <p>
            Follow every step from <Link href="/profile/track">Track Order</Link> in your account. Once your parcel is
            dispatched you&apos;ll see the courier, your tracking number and a link to the courier&apos;s own tracking page.
          </p>
          <p>
            Please keep your phone reachable on the delivery day — couriers call before delivering. Inspect the outer
            packaging when it arrives and mention any visible damage to the rider.
          </p>
        </>
      ),
    },
    {
      id: "cancellations",
      title: "Cancellations",
      content: (
        <p>
          You can cancel an order yourself from <Link href="/profile/orders">My Orders</Link> until it is handed to the
          courier. Once it has shipped it can&apos;t be cancelled, but you can request a return after delivery. If you paid
          online, cancelled orders are refunded in full.
        </p>
      ),
    },
    {
      id: "returns",
      title: "Returns",
      content: (
        <>
          <p>
            Not happy with an item? Request a return within <strong>{p.returnWindowDays} days of delivery</strong>: open
            the order from <Link href="/profile/orders">My Orders</Link> and tap <strong>Request a refund</strong>.
          </p>
          <p>To be eligible, items should be:</p>
          <ul>
            <li>unused and in the condition you received them, with tags and original packaging;</li>
            <li>complete, including any accessories, manuals and free gifts.</li>
          </ul>
          <p>
            Made-to-order or personalised items can only be returned if they arrive damaged, defective or not as
            described. If you received a wrong or damaged item, contact us within 48 hours with a photo and we&apos;ll
            arrange a replacement or refund at no cost to you.
          </p>
        </>
      ),
    },
    {
      id: "refunds",
      title: "Refunds",
      content: (
        <p>
          Once we receive and inspect the returned item, refunds are issued within <strong>{p.refundProcessingDays}</strong>{" "}
          to your original payment method. Cash-on-delivery orders are refunded by bank transfer or mobile wallet
          (EasyPaisa/JazzCash). Delivery fees are refunded when the return is due to our error.
        </p>
      ),
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Policies"
        title="Shipping & Returns"
        subtitle="How we deliver, what it costs, how to track your parcel — and what to do if something isn't right."
        updated={p.lastUpdated}
      />
      <PageBody>
        <div className="mb-12 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {highlights.map(({ icon: Icon, title, text }) => (
            <Card key={title} variant="solid" className="flex gap-3 p-5">
              <Icon className="mt-0.5 size-6 shrink-0 text-brand" />
              <div>
                <p className="font-semibold text-content">{title}</p>
                <p className="mt-0.5 text-sm text-muted">{text}</p>
              </div>
            </Card>
          ))}
        </div>
        <DocLayout sections={sections} />
        <HelpBanner text="Questions about a specific order? We'll sort it out.">
          <Link href="/profile/orders">
            <Button>
              <PackageCheck /> My orders
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline">
              Contact us
            </Button>
          </Link>
        </HelpBanner>
      </PageBody>
    </>
  );
}
