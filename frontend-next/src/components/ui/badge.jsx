import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        brand: "bg-brand/15 text-brand",
        muted: "bg-surface-alt text-muted border border-border",
        success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        info: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
        warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
        destructive: "bg-red-500/15 text-red-600 dark:text-red-400",
        glass: "glass-surface text-content",
      },
    },
    defaultVariants: { variant: "brand" },
  }
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
