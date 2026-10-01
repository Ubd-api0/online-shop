"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, PackageSearch, RotateCw } from "lucide-react";
import api from "@/lib/axios";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { GRID_CLASS } from "@/components/product/grid-class";


/**
 * Daraz-style endless feed: the first page comes server-rendered (SEO), the
 * rest is fetched and appended as the user nears the bottom. Remount it (via
 * `key`) when the query changes — it doesn't diff queries itself.
 *
 * @param initial  first page from queryProducts(): { products, hasMore }
 * @param query    { category?, q?, sort? } passed to /product/list
 */
export function InfiniteProductGrid({ initial, query = {}, pageSize = 20, emptyText = "No products found." }) {
  const [items, setItems] = useState(initial?.products || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(!!initial?.hasMore);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const sentinel = useRef(null);
  const busy = useRef(false);
  // Latest query in a ref: the grid is remounted (key) when it changes, so it
  // never needs to re-create loadMore for it.
  const queryRef = useRef(query);

  const loadMore = useCallback(async () => {
    if (busy.current || !hasMore) return;
    busy.current = true;
    setLoading(true);
    setFailed(false);
    try {
      const { data } = await api.get("/product/list", {
        params: { ...queryRef.current, page: page + 1, limit: pageSize },
      });
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p._id));
        return [...prev, ...data.products.filter((p) => !seen.has(p._id))];
      });
      setPage(data.page);
      setHasMore(data.hasMore);
    } catch {
      setFailed(true);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, [hasMore, page, pageSize]);

  // Start fetching well before the user actually hits the bottom.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || failed) return;
    const io = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMore(), {
      rootMargin: "800px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, hasMore, failed]);

  if (items.length === 0 && !hasMore) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <PackageSearch className="size-12 text-muted" strokeWidth={1.5} />
        <p className="text-muted">{emptyText}</p>
      </div>
    );
  }

  return (
    <>
      <div className={GRID_CLASS}>
        {items.map((p) => (
          <ProductCard key={p._id} data={p} />
        ))}
        {loading && Array.from({ length: 5 }, (_, i) => <CardSkeleton key={`s${i}`} />)}
      </div>

      <div ref={sentinel} className="flex justify-center py-8">
        {failed ? (
          <Button variant="outline" size="sm" onClick={loadMore}>
            <RotateCw /> Couldn&apos;t load more — retry
          </Button>
        ) : loading ? (
          <Loader2 className="size-6 animate-spin text-brand" />
        ) : !hasMore && items.length > pageSize ? (
          <p className="text-sm text-muted">You&apos;ve seen it all ✨</p>
        ) : null}
      </div>
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-2.5">
      <div className="aspect-square w-full animate-pulse rounded-DEFAULT bg-surface-alt" />
      <div className="mt-3 h-3 w-4/5 animate-pulse rounded bg-surface-alt" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-surface-alt" />
      <div className="mt-3 h-8 w-full animate-pulse rounded-DEFAULT bg-surface-alt" />
    </div>
  );
}
