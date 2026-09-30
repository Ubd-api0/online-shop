import { cn } from "@/lib/utils";

export function Textarea({ className, rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(
        "flex w-full rounded-DEFAULT border border-border bg-surface px-4 py-3 text-sm text-content",
        "placeholder:text-muted transition-colors duration-200 resize-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:border-brand",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
