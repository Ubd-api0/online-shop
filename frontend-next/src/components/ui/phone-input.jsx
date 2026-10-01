"use client";

import { Phone } from "lucide-react";
import { formatPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

/**
 * Masked Pakistani phone field: digits only, auto-formatted as 0300-1234567,
 * max 11 digits. Pasting "+92 300 1234567" works too. It's a text/tel input
 * (not type="number"), so there are no spinner arrows and the mouse wheel
 * can't change it. `onChange` receives the formatted string.
 */
export function PhoneInput({ value, onChange, className, placeholder = "03XX-XXXXXXX", ...props }) {
  return (
    <div className="relative">
      <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        value={formatPhone(value)}
        onChange={(e) => onChange(formatPhone(e.target.value))}
        onKeyDown={(e) => {
          // allow editing/navigation keys and shortcuts; block other non-digits
          if (e.key.length === 1 && !/\d/.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault();
        }}
        placeholder={placeholder}
        className={cn(
          "flex h-11 w-full rounded-DEFAULT border border-border bg-surface pl-9 pr-4 text-sm tabular-nums tracking-wide text-content",
          "placeholder:text-muted transition-colors duration-200",
          "focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
}
