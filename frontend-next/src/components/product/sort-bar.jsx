import Link from "next/link";
import { cn } from "@/lib/utils";

const SORTS = [
  { key: "newest", label: "Newest" },
  { key: "best_selling", label: "Best selling" },
  { key: "price_asc", label: "Price: low to high" },
  { key: "price_desc", label: "Price: high to low" },
];

// Plain links (no client JS) so every sort is a crawlable, shareable URL.
export function SortBar({ basePath = "/products", params = {}, active = "newest" }) {
  const href = (sort) => {
    const sp = new URLSearchParams(Object.entries({ ...params, sort }).filter(([, v]) => v));
    if (sort === "newest") sp.delete("sort");
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] 800px:mx-0 800px:px-0">
      {SORTS.map((s) => (
        <Link
          key={s.key}
          href={href(s.key)}
          scroll={false}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
            active === s.key ? "border-brand bg-brand text-white" : "border-border bg-surface text-content hover:border-brand/50"
          )}
        >
          {s.label}
        </Link>
      ))}
    </div>
  );
}
