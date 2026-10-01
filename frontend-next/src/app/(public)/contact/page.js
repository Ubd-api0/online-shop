import Link from "next/link";
import { Mail, Phone, MapPin, Clock, MessageCircle, HelpCircle, Truck } from "lucide-react";
import { getStorefront } from "@/lib/data/shops";
import { PageHero, PageBody } from "@/components/info/info-page";
import { ContactForm } from "@/components/info/contact-form";
import { Card } from "@/components/ui/card";
import appConfig from "@/config/appConfig";
import { formatPhone, normalizePhone } from "@/lib/phone";

// Rendered from the database; refreshed every 60s and on demand after
// dashboard edits (lib/revalidate.js) — never frozen at build time.
export const revalidate = 60;

export const metadata = {
  title: "Contact us",
  description: `Get in touch with ${appConfig.name} about orders, delivery, returns or products.`,
};

function InfoCard({ icon: Icon, label, children, href }) {
  const body = (
    <Card variant="solid" className="flex items-start gap-4 p-5 transition-colors hover:border-brand/50">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <div className="mt-0.5 break-words font-medium text-content">{children}</div>
      </div>
    </Card>
  );
  return href ? (
    <a href={href} className="block">
      {body}
    </a>
  ) : (
    body
  );
}

export default async function ContactPage() {
  const storefront = await getStorefront();
  const email = appConfig.supportEmail || storefront.email;
  // Hide the seed script's placeholder values until the owner sets real ones.
  const phone = storefront.phoneNumber && normalizePhone(storefront.phoneNumber) !== "03000000000" ? formatPhone(storefront.phoneNumber) : "";
  const address = storefront.address && storefront.address !== "Store address" ? storefront.address : "";

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We're here to help"
        subtitle="Questions about an order, a product or a return? Send us a message and our team will get back to you."
      />
      <PageBody>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <ContactForm />

          <div className="space-y-4">
            {email && (
              <InfoCard icon={Mail} label="Email" href={`mailto:${email}`}>
                {email}
              </InfoCard>
            )}
            {phone && (
              <InfoCard icon={Phone} label="Phone" href={`tel:${normalizePhone(phone)}`}>
                {phone}
              </InfoCard>
            )}
            {address && (
              <InfoCard icon={MapPin} label="Address">
                {address}
              </InfoCard>
            )}
            <InfoCard icon={Clock} label="Support hours">
              {appConfig.policies.supportHours}
            </InfoCard>

            <Card variant="flat" className="space-y-1 p-5">
              <p className="mb-2 text-sm font-semibold text-content">Faster answers</p>
              <Link href="/profile/inbox" className="flex items-center gap-2 py-1.5 text-sm text-content hover:text-brand">
                <MessageCircle className="size-4 text-brand" /> Chat with us from your account
              </Link>
              <Link href="/profile/track" className="flex items-center gap-2 py-1.5 text-sm text-content hover:text-brand">
                <Truck className="size-4 text-brand" /> Track an order
              </Link>
              <Link href="/faq" className="flex items-center gap-2 py-1.5 text-sm text-content hover:text-brand">
                <HelpCircle className="size-4 text-brand" /> Browse the FAQ
              </Link>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
