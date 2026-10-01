import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Shared shell for the informational pages linked from the footer
// (About, Contact, FAQ, Shipping & Returns, Privacy, Terms): a full-width
// header band + a full-width content area.

export function PageHero({ title, subtitle, eyebrow, updated, children }) {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 800px:px-6 800px:py-14">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-xs text-muted">
          <Link href="/" className="hover:text-brand">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-content">{title}</span>
        </nav>
        {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-bold text-content sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-3xl text-base leading-7 text-muted sm:text-lg">{subtitle}</p>}
        {updated && (
          <p className="mt-4 text-xs text-muted">
            Last updated{" "}
            {new Date(updated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

export function PageBody({ className, children }) {
  return <div className={cn("mx-auto max-w-7xl px-4 py-10 800px:px-6 800px:py-12", className)}>{children}</div>;
}

/**
 * Long-form document (policies): sticky table of contents on the left on
 * desktop, sections on the right. `sections` = [{ id, title, content }].
 */
export function DocLayout({ sections }) {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <nav className="sticky top-28 space-y-1 border-l border-border">
          <p className="mb-2 pl-4 text-xs font-semibold uppercase tracking-wider text-muted">On this page</p>
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-muted transition-colors hover:border-brand hover:text-content"
            >
              {s.title}
            </a>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 space-y-10">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-28">
            <h2 className="mb-3 flex items-baseline gap-3 text-xl font-semibold text-content sm:text-2xl">
              <span className="text-sm font-medium text-brand">{String(i + 1).padStart(2, "0")}</span>
              {s.title}
            </h2>
            <div className="space-y-3 leading-7 text-muted [&_a]:text-brand [&_a:hover]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-content">
              {s.content}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function HelpBanner({ title = "Still need help?", text, children }) {
  return (
    <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-lg border border-border bg-surface p-6 sm:flex-row sm:items-center sm:p-8">
      <div>
        <h2 className="text-lg font-semibold text-content">{title}</h2>
        {text && <p className="mt-1 text-sm text-muted">{text}</p>}
      </div>
      <div className="flex shrink-0 flex-wrap gap-3">{children}</div>
    </div>
  );
}
