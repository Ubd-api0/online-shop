import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-DEFAULT text-sm font-medium " +
    "transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 " +
    "focus-visible:ring-offset-surface [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        solid:
          "bg-brand text-white shadow-lg shadow-brand/25 hover:bg-brand-hover hover:shadow-brand/35 hover:-translate-y-0.5 active:translate-y-0",
        glass:
          "glass-surface text-content hover:bg-[var(--glass-bg-hover)] hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border border-border bg-transparent text-content hover:bg-surface-alt",
        ghost: "bg-transparent text-content hover:bg-surface-alt",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        link: "text-brand underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-9 px-3.5 text-xs",
        md: "h-11 px-5",
        lg: "h-13 px-7 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  }
);

export function Button({ className, variant, size, asChild, ...props }) {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
