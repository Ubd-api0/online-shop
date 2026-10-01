"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, MapPin, Search } from "lucide-react";
import { citiesOf, POPULAR_CITIES } from "@/lib/shipping/pakistan";
import { cn } from "@/lib/utils";

const norm = (s) => String(s || "").trim().toLowerCase();

/**
 * Searchable city picker for a province: type to filter, ↑/↓ + Enter or
 * click to choose. The value is always a city from the list — or, for a
 * small town that isn't listed, the explicit "Use “…”" option.
 */
export function CityCombobox({ province, value, onChange, disabled, placeholder, id: idProp, className }) {
  const autoId = useId();
  const id = idProp || autoId;
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const cities = useMemo(() => citiesOf(province), [province]);

  const options = useMemo(() => {
    const q = norm(query);
    if (!q) {
      const popular = (POPULAR_CITIES[province] || []).filter((c) => cities.includes(c));
      const rest = cities.filter((c) => !popular.includes(c));
      return [...popular.map((c) => ({ city: c, popular: true })), ...rest.map((c) => ({ city: c }))];
    }
    const starts = cities.filter((c) => norm(c).startsWith(q));
    const contains = cities.filter((c) => !norm(c).startsWith(q) && norm(c).includes(q));
    const list = [...starts, ...contains].map((c) => ({ city: c }));
    // Free text only when nothing in the list matches (a small, unlisted town).
    if (list.length === 0 && q.length >= 2) list.push({ city: query.trim(), custom: true });
    return list;
  }, [cities, query, province]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !boxRef.current?.contains(e.target) && close();
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the highlighted option in view.
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function openList() {
    if (disabled) return;
    setQuery("");
    setActive(0);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setQuery("");
  }

  function choose(opt) {
    if (!opt) return;
    onChange(opt.city);
    close();
    inputRef.current?.blur();
  }

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      openList();
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(options[active]);
    } else if (e.key === "Escape") {
      close();
    } else if (e.key === "Tab") {
      // Tabbing away with an exact match typed picks it; otherwise keep the old value.
      const exact = cities.find((c) => norm(c) === norm(query));
      if (exact) onChange(exact);
      close();
    }
  };

  const q = norm(query);
  const firstRest = options.findIndex((o) => !o.popular && !o.custom);

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && options[active] ? `${listId}-${active}` : undefined}
          autoComplete="off"
          disabled={disabled}
          value={open ? query : value || ""}
          placeholder={open ? value || "Search city" : placeholder}
          onFocus={openList}
          onClick={() => !open && openList()}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className={cn(
            "flex h-11 w-full rounded-DEFAULT border border-border bg-surface pl-9 pr-9 text-sm text-content",
            "placeholder:text-muted transition-colors focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted transition-transform",
            open && "rotate-180"
          )}
        />
      </div>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-popover max-h-64 overflow-y-auto rounded-DEFAULT border border-border bg-surface py-1 shadow-2xl"
        >
          {options.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-muted">{q ? "Keep typing your town's name…" : "No cities for this province"}</li>
          )}
          {options.map((opt, i) => {
            const selected = norm(opt.city) === norm(value);
            const label = opt.city;
            const at = q && !opt.custom ? norm(label).indexOf(q) : -1;
            return (
              <li key={`${opt.custom ? "custom-" : ""}${label}`}>
                {!q && i === 0 && opt.popular && (
                  <p className="px-3 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Popular</p>
                )}
                {!q && i === firstRest && firstRest > 0 && (
                  <p className="mt-1 border-t border-border px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    All cities
                  </p>
                )}
                <div
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={selected}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => choose(opt)}
                  onMouseMove={() => active !== i && setActive(i)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm",
                    i === active ? "bg-surface-alt text-content" : "text-content",
                    opt.custom && "border-t border-border text-muted"
                  )}
                >
                  {opt.custom ? (
                    <span className="flex items-center gap-2">
                      <Search className="size-3.5" /> Use &ldquo;<span className="text-content">{label}</span>&rdquo;
                    </span>
                  ) : at >= 0 ? (
                    <span>
                      {label.slice(0, at)}
                      <strong className="font-semibold text-brand-hover">{label.slice(at, at + q.length)}</strong>
                      {label.slice(at + q.length)}
                    </span>
                  ) : (
                    <span>{label}</span>
                  )}
                  {selected && <Check className="size-4 text-brand" />}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
