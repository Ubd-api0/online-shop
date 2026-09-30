import { Mail, Phone, MapPin } from "lucide-react";
import { getStorefront } from "@/lib/data/shops";
import { Card } from "@/components/ui/card";
import appConfig from "@/config/appConfig";

export const metadata = { title: "Contact" };

function Row({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-1 size-[18px] shrink-0 text-brand" />
      <div>
        <div className="text-sm text-muted">{label}</div>
        <div className="text-content">{value}</div>
      </div>
    </div>
  );
}

export default async function ContactPage() {
  const storefront = await getStorefront();
  const email = appConfig.supportEmail || storefront.email;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold text-content">Contact us</h1>
      <p className="leading-7 text-muted">
        We&apos;re happy to help with orders, products or anything else. Reach {appConfig.name}{" "}
        using the details below.
      </p>

      <Card variant="solid" className="space-y-4 p-5">
        <Row icon={Mail} label="Email" value={email} />
        <Row icon={Phone} label="Phone" value={storefront.phoneNumber} />
        <Row icon={MapPin} label="Address" value={storefront.address} />
        {!email && !storefront.phoneNumber && !storefront.address && (
          <p className="text-sm text-muted">
            Contact details will appear here once the store owner adds them.
          </p>
        )}
      </Card>
    </div>
  );
}
