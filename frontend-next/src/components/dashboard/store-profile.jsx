"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  MessageSquareText,
  Package,
  Pencil,
  Phone,
  Star,
  Tag,
  TrendingUp,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionCard } from "@/components/dashboard/section-card";
import { ReviewList } from "@/components/dashboard/review-list";
import { useShopCatalog } from "@/components/dashboard/use-shop-catalog";
import { formatDate, formatPrice } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

function Stat({ icon: Icon, label, value, href }) {
  const body = (
    <Card variant="solid" className="flex h-full items-center gap-3 p-4 transition-colors hover:border-brand/40">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-DEFAULT bg-brand/10 text-brand">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <div className="truncate text-xl font-semibold text-content">{value}</div>
        <div className="truncate text-xs text-muted">{label}</div>
      </div>
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function Detail({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted" />
      <div className="min-w-0">
        <div className="text-xs text-muted">{label}</div>
        <div className="break-words text-sm text-content">{children || "—"}</div>
      </div>
    </div>
  );
}

export function StoreProfile() {
  const { seller, products, events, reviews, averageRating, loading } = useShopCatalog();
  const [now] = useState(() => Date.now());

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted" />
      </div>
    );
  }

  const runningEvents = events.filter((e) => !e.Finish_Date || new Date(e.Finish_Date).getTime() > now).length;
  const bestSellers = [...products]
    .filter((p) => (p.sold_out || 0) > 0)
    .sort((a, b) => (b.sold_out || 0) - (a.sold_out || 0))
    .slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      {/* Profile header */}
      <Card variant="solid" className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand/30 via-brand/10 to-transparent sm:h-28" />
        <div className="flex flex-col gap-4 px-4 pb-5 sm:flex-row sm:items-end sm:px-6">
          <div className="relative -mt-12 size-24 shrink-0 overflow-hidden rounded-full border-4 border-surface bg-surface-alt shadow-md sm:-mt-14 sm:size-28">
            {seller.avatar && <Image src={seller.avatar} alt="" fill sizes="112px" className="object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-semibold text-content">{seller.name}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {averageRating.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
              {seller.createdAt && <> · Since {formatDate(seller.createdAt)}</>}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/" target="_blank" className={cn(buttonVariants({ variant: "outline" }), "flex-1 sm:flex-none")}>
              <ExternalLink /> View store
            </Link>
            <Link href="/settings" className={cn(buttonVariants(), "flex-1 sm:flex-none")}>
              <Pencil /> Edit profile
            </Link>
          </div>
        </div>
        {seller.description && (
          <p className="border-t border-border px-4 py-4 text-sm leading-relaxed text-muted sm:px-6">{seller.description}</p>
        )}
      </Card>

      {/* Key numbers */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Package} label="Products" value={products.length} href="/dashboard-products" />
        <Stat icon={Tag} label="Running events" value={runningEvents} href="/dashboard-events" />
        <Stat icon={Star} label="Average rating" value={averageRating.toFixed(1)} href="/dashboard-reviews" />
        <Stat icon={MessageSquareText} label="Reviews" value={reviews.length} href="/dashboard-reviews" />
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-5">
          <SectionCard
            icon={MapPin}
            title="Contact details"
            action={
              <Link href="/settings" className="text-sm text-brand hover:underline">
                Edit
              </Link>
            }
          >
            <div className="space-y-4">
              <Detail icon={Mail} label="Email">{seller.email}</Detail>
              <Detail icon={Phone} label="Phone">{seller.phoneNumber ? formatPhone(seller.phoneNumber) : null}</Detail>
              <Detail icon={MapPin} label="Address">
                {[seller.address, seller.zipCode].filter(Boolean).join(", ")}
              </Detail>
              <Detail icon={CalendarDays} label="Store created">{formatDate(seller.createdAt)}</Detail>
            </div>
          </SectionCard>

          <SectionCard icon={TrendingUp} title="Best sellers">
            {bestSellers.length ? (
              <ul className="space-y-3">
                {bestSellers.map((p) => (
                  <li key={p._id} className="flex items-center gap-3">
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-DEFAULT bg-surface-alt">
                      {p.images?.[0] && <Image src={p.images[0]} alt="" fill sizes="44px" className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-content">{p.name}</div>
                      <div className="text-xs text-muted">{formatPrice(p.discountPrice)}</div>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-content">{p.sold_out} sold</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No sales yet.</p>
            )}
          </SectionCard>
        </div>

        <SectionCard
          icon={MessageSquareText}
          title="Latest reviews"
          action={
            reviews.length > 0 && (
              <Link href="/dashboard-reviews" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
                View all <ArrowRight className="size-4" />
              </Link>
            )
          }
        >
          {reviews.length ? (
            <ReviewList reviews={reviews.slice(0, 5)} />
          ) : (
            <p className="py-6 text-center text-sm text-muted">No reviews yet.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
