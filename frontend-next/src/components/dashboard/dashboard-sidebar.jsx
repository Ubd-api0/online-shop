"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { NAV } from "@/components/dashboard/nav";
import { cn } from "@/lib/utils";

function NavRow({ item, active, onClose }) {
  const Icon = item.icon;
  const isActive = active === item.key;
  return (
    <Link
      href={item.to}
      onClick={onClose}
      className={cn(
        "flex items-center gap-3 border-l-[3px] px-4 py-3 text-[15px] transition",
        isActive
          ? "border-brand bg-surface-alt font-semibold text-brand"
          : "border-transparent text-muted hover:bg-surface-alt hover:text-content"
      )}
    >
      <Icon className="size-[22px] shrink-0" />
      <span className="whitespace-nowrap">{item.label}</span>
    </Link>
  );
}

function NavList({ active, onClose }) {
  return (
    <nav className="py-3">
      {NAV.map((i) => (
        <NavRow key={i.key} item={i} active={active} onClose={onClose} />
      ))}
    </nav>
  );
}

export function DashboardSideBar({ active, open, onClose }) {
  return (
    <>
      <aside className="glass-surface fixed bottom-0 left-0 top-[64px] z-[80] hidden w-[260px] overflow-y-auto border-y-0 border-l-0 lg:block">
        <NavList active={active} onClose={() => {}} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden" onClick={onClose} role="presentation">
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="glass-surface absolute left-0 top-0 h-full w-[78%] max-w-[300px] overflow-y-auto border-y-0 border-l-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-semibold text-content">Menu</span>
              <button onClick={onClose} aria-label="Close menu">
                <X className="size-5 text-muted" />
              </button>
            </div>
            <NavList active={active} onClose={onClose} />
          </div>
        </div>
      )}
    </>
  );
}
