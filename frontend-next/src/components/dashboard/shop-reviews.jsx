"use client";

import { useState } from "react";
import { Loader2, MessageSquareText, Star } from "lucide-react";
import { SectionCard } from "@/components/dashboard/section-card";
import { ReviewList, Stars } from "@/components/dashboard/review-list";
import { useShopCatalog } from "@/components/dashboard/use-shop-catalog";
import { cn } from "@/lib/utils";

const FILTERS = ["all", 5, 4, 3, 2, 1];

export function ShopReviews() {
  const { reviews, averageRating, loading } = useShopCatalog();
  const [filter, setFilter] = useState("all");

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted" />
      </div>
    );
  }

  const countFor = (stars) => reviews.filter((r) => Math.round(r.rating) === stars).length;
  const shown = filter === "all" ? reviews : reviews.filter((r) => Math.round(r.rating) === filter);

  return (
    <div className="mx-auto grid w-full max-w-5xl items-start gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <SectionCard icon={Star} title="Rating summary" className="lg:sticky lg:top-[88px]">
        <div className="flex items-end gap-3">
          <span className="text-4xl font-semibold leading-none text-content">{averageRating.toFixed(1)}</span>
          <div className="pb-0.5">
            <Stars rating={averageRating} />
            <p className="mt-1 text-xs text-muted">
              {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-2">
          {[5, 4, 3, 2, 1].map((s) => {
            const n = countFor(s);
            const pct = reviews.length ? (n / reviews.length) * 100 : 0;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(filter === s ? "all" : s)}
                className="flex w-full items-center gap-2 text-sm text-muted hover:text-content"
              >
                <span className="w-3 text-right">{s}</span>
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-alt">
                  <span className="block h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                </span>
                <span className="w-6 text-right tabular-nums">{n}</span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        icon={MessageSquareText}
        title="Customer reviews"
        description="What customers said about your products and events."
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "inline-flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors",
                filter === f
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border text-muted hover:border-content/30 hover:text-content"
              )}
            >
              {f === "all" ? `All (${reviews.length})` : (
                <>
                  {f} <Star className="size-3 fill-current" /> ({countFor(f)})
                </>
              )}
            </button>
          ))}
        </div>
        {shown.length ? (
          <ReviewList reviews={shown} />
        ) : (
          <p className="py-10 text-center text-sm text-muted">
            {reviews.length ? "No reviews with this rating." : "No reviews yet. They'll appear here once customers rate their orders."}
          </p>
        )}
      </SectionCard>
    </div>
  );
}
