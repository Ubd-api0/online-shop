import Link from "next/link";
import { BadgeCheck, Truck, ShieldCheck, Headphones, ShoppingBag, PackageCheck, MapPin, Smile } from "lucide-react";
import { getStorefront } from "@/lib/data/shops";
import { PageHero, PageBody } from "@/components/info/info-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import appConfig from "@/config/appConfig";

export const metadata = {
  title: "About us",
  description: `Learn about ${appConfig.name} — what we sell, how we work and what we promise our customers.`,
};

const VALUES = [
  { icon: BadgeCheck, title: "Quality we stand behind", text: "Every product is checked before it leaves our hands, and our return policy has your back if something isn't right." },
  { icon: Truck, title: "Delivery across Pakistan", text: "Real courier rates, honest delivery estimates and live tracking from dispatch to your door." },
  { icon: ShieldCheck, title: "Safe, flexible payments", text: "Cash on Delivery, cards, EasyPaisa and JazzCash — prices are always verified at checkout." },
  { icon: Headphones, title: "People who answer", text: `Message us from your account and a real person replies — ${appConfig.policies.supportHours}.` },
];

const STEPS = [
  { icon: ShoppingBag, title: "Pick what you love", text: "Browse, add to cart or tap Buy Now." },
  { icon: PackageCheck, title: "We pack it", text: `In-stock orders are packed within ${appConfig.policies.processingDays}.` },
  { icon: MapPin, title: "Track every step", text: "Courier and tracking number appear in your order." },
  { icon: Smile, title: "Enjoy it", text: `Not happy? Request a return within ${appConfig.policies.returnWindowDays} days.` },
];

export default async function AboutPage() {
  const storefront = await getStorefront();
  const name = storefront.name || appConfig.name;
  const categories = (storefront.categories || []).slice(0, 10);

  return (
    <>
      <PageHero
        eyebrow="About us"
        title={`About ${name}`}
        subtitle={
          storefront.description && storefront.description !== "Welcome to our store."
            ? storefront.description
            : `${name} is an online store built to make shopping simple and reliable — a curated catalogue, honest pricing and fast, transparent delivery.`
        }
      />
      <PageBody className="space-y-16">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4 leading-7 text-muted">
            <h2 className="font-display text-2xl font-semibold text-content">Our story</h2>
            <p>
              We started {name} with a simple idea: buying online should feel as trustworthy as buying from a shop you
              know. That means clear prices with no surprises at checkout, delivery charges worked out the way couriers
              actually charge, and an order you can follow every step of the way.
            </p>
            <p>
              Every order is prepared and dispatched by our own team. If something is made to order, we tell you the lead
              time up front — and your delivery estimate already includes it.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <Card key={title} variant="solid" className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="text-xs font-semibold text-muted">STEP {i + 1}</span>
                </div>
                <h3 className="font-semibold text-content">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-6 font-display text-2xl font-semibold text-content">What we promise</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <Card key={title} variant="solid" className="p-6">
                <Icon className="mb-4 size-8 text-brand" strokeWidth={1.6} />
                <h3 className="font-semibold text-content">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </Card>
            ))}
          </div>
        </section>

        {categories.length > 0 && (
          <section>
            <h2 className="mb-4 font-display text-2xl font-semibold text-content">What you&apos;ll find here</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link
                  key={String(c._id || c.name)}
                  href={`/products?category=${encodeURIComponent(c.name)}`}
                  className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-content transition-colors hover:border-brand hover:text-brand"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col items-start justify-between gap-6 rounded-lg bg-brand p-8 text-white sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="font-display text-2xl font-semibold">Ready to start shopping?</h2>
            <p className="mt-1 text-white/85">New arrivals and best sellers are waiting for you.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/products">
              <Button variant="outline" className="border-white bg-white text-brand hover:bg-white/90">
                Browse products
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Contact us
              </Button>
            </Link>
          </div>
        </section>
      </PageBody>
    </>
  );
}
