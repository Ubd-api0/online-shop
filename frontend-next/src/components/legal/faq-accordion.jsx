"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Full-width FAQ: search + category chips (sticky category list on desktop)
// + grouped accordion. `groups` = [{ key, title, items: [{ q, a }] }].
export function FaqAccordion({ groups }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [open, setOpen] = useState(() => new Set([`${groups[0]?.key}-0`]));

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      groups
        .filter((g) => category === "all" || g.key === category)
        .map((g) => ({
          ...g,
          items: g.items
            .map((item, i) => ({ ...item, id: `${g.key}-${i}` }))
            .filter((item) => !q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)),
        }))
        .filter((g) => g.items.length),
    [groups, category, q]
  );

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const chips = [{ key: "all", title: "All", count: total }, ...groups.map((g) => ({ ...g, count: g.items.length }))];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* categories: chips on mobile, sticky list on desktop */}
      <aside className="min-w-0">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:sticky lg:top-28 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
          {chips.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={cn(
                "flex shrink-0 items-center justify-between gap-3 rounded-full border px-3.5 py-1.5 text-sm transition-colors lg:rounded-DEFAULT lg:border-transparent lg:px-3 lg:py-2.5",
                category === c.key
                  ? "border-brand bg-brand text-white lg:bg-brand/10 lg:font-medium lg:text-brand-hover"
                  : "border-border bg-surface text-content hover:border-brand/50 lg:bg-transparent lg:hover:bg-surface"
              )}
            >
              {c.title}
              <span className={cn("text-xs", category === c.key ? "opacity-80" : "text-muted")}>{c.count}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions — e.g. refund, delivery, voucher"
            className="h-12 pl-12 pr-10 text-base"
            aria-label="Search FAQ"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-content"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {visible.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-12 text-center text-muted">
            No questions match &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <div className="space-y-10">
            {visible.map((g) => (
              <section key={g.key}>
                <h2 className="mb-3 text-lg font-semibold text-content">{g.title}</h2>
                <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
                  {g.items.map((item) => {
                    const isOpen = open.has(item.id) || !!q;
                    return (
                      <div key={item.id}>
                        <button
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-alt/60"
                          onClick={() => toggle(item.id)}
                          aria-expanded={isOpen}
                        >
                          <span className="font-medium text-content">{item.q}</span>
                          <ChevronDown
                            className={cn("size-5 shrink-0 text-muted transition-transform", isOpen && "rotate-180 text-brand")}
                          />
                        </button>
                        {isOpen && <p className="px-5 pb-5 leading-7 text-muted">{item.a}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
