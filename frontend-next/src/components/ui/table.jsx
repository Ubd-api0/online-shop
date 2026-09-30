import { cn } from "@/lib/utils";

export function Table({ className, ...props }) {
  return (
    <div className="glass-surface w-full overflow-x-auto rounded-lg">
      <table className={cn("w-full min-w-max text-left text-sm text-content", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn("border-b border-border", className)} {...props} />;
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn("divide-y divide-border", className)} {...props} />;
}

export function TableRow({ className, ...props }) {
  return <tr className={cn("transition-colors hover:bg-surface-alt/60", className)} {...props} />;
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={cn("px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }) {
  return <td className={cn("px-4 py-3 align-middle", className)} {...props} />;
}
