import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Page width shared by the dashboard's form/settings pages (matches Shipping).
export const DASHBOARD_FORM_WIDTH = "mx-auto w-full max-w-5xl space-y-5";

export const selectClass =
  "h-11 w-full rounded-DEFAULT border border-border bg-surface px-3 text-content outline-none focus:border-brand";

// One titled section of a dashboard form: icon + heading, optional hint and
// right-aligned action, then the fields.
export function SectionCard({ icon: Icon, title, description, action, className, children }) {
  return (
    <Card variant="solid" className={cn("p-4 sm:p-5", className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-content">
            {Icon && <Icon className="size-5 shrink-0 text-brand" />} {title}
          </h2>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}
