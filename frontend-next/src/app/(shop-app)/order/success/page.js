import Link from "next/link";
import { CheckCircle2, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { shortOrderId } from "@/lib/format";

export const metadata = { title: "Order placed" };

export default async function OrderSuccessPage({ searchParams }) {
  const { id } = await searchParams;
  return (
    <div className="flex justify-center px-4 py-12">
      <Card variant="solid" className="w-full max-w-lg p-8 text-center">
        <CheckCircle2 className="mx-auto size-20 text-emerald-500" strokeWidth={1.5} />
        <h1 className="mt-4 font-display text-2xl font-semibold text-content">Thank you! Your order is placed.</h1>
        {id && (
          <p className="mt-2 text-muted">
            Order <span className="font-mono font-semibold text-content">{shortOrderId(id)}</span>
          </p>
        )}
        <p className="mt-2 text-sm text-muted">
          We&apos;ll keep you updated as it moves. You can follow every step from your orders page.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {id ? (
            <Link href={`/user/track/order/${id}`}>
              <Button className="w-full">
                <MapPin /> Track order
              </Button>
            </Link>
          ) : (
            <Link href="/profile/orders">
              <Button className="w-full">
                <Package /> View orders
              </Button>
            </Link>
          )}
          <Link href="/products">
            <Button variant="outline" className="w-full">
              Continue shopping
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
