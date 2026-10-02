"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Stars({ rating = 0, className }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn("size-4", i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-border")}
        />
      ))}
    </div>
  );
}

function Avatar({ src, name }) {
  return (
    <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-alt text-sm font-semibold text-muted">
      {src ? <Image src={src} alt="" fill sizes="40px" className="object-cover" /> : (name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

// One review per row: customer, stars, comment, and the product/event it's on.
export function ReviewList({ reviews, showItem = true }) {
  return (
    <ul className="divide-y divide-border">
      {reviews.map((r) => (
        <li key={r.key} className="flex gap-3 py-4 first:pt-0 last:pb-0">
          <Avatar src={r.user?.avatar} name={r.user?.name} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-medium text-content">{r.user?.name || "Customer"}</span>
              <Stars rating={r.rating} />
              {r.createdAt && <span className="text-xs text-muted">{formatDate(r.createdAt)}</span>}
            </div>
            {r.comment && <p className="mt-1 break-words text-sm text-content/90">{r.comment}</p>}
            {showItem && (
              <Link
                href={r.item.kind === "event" ? `/product/${r.item._id}?isEvent=true` : `/product/${r.item._id}`}
                target="_blank"
                className="mt-2 inline-flex max-w-full items-center gap-2 rounded-DEFAULT border border-border bg-surface-alt py-1 pl-1 pr-2.5 text-xs text-muted hover:text-brand"
              >
                <span className="relative size-6 shrink-0 overflow-hidden rounded bg-surface">
                  {r.item.image && <Image src={r.item.image} alt="" fill sizes="24px" className="object-cover" />}
                </span>
                <span className="truncate">{r.item.name}</span>
                {r.item.kind === "event" && (
                  <Badge variant="info" className="px-1.5 py-0">
                    Event
                  </Badge>
                )}
              </Link>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
