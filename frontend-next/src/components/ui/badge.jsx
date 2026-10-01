import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        brand: "bg-brand/15 text-brand",
        muted: "bg-surface-alt text-muted border border-border",
        success: "bg-emerald-500/15 text-success",
        info: "bg-sky-500/15 text-info",
        warning: "bg-amber-500/15 text-warning",
        destructive: "bg-red-500/15 text-danger",
        glass: "glass-surface text-content",
      },
    },
    defaultVariants: { variant: "brand" },
  }
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
