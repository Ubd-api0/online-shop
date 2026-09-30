import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Order placed" };

export default function OrderSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <CheckCircle2 className="size-24 text-green-500" strokeWidth={1.5} />
      <h1 className="mt-4 font-display text-2xl font-semibold text-content">
        Your order was placed successfully 🎉
      </h1>
      <p className="mt-2 text-muted">You can track it any time from your profile.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/profile">
          <Button>View orders</Button>
        </Link>
        <Link href="/products">
          <Button variant="outline">Continue shopping</Button>
        </Link>
      </div>
    </div>
  );
}
