"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSideBar } from "@/components/dashboard/dashboard-sidebar";
import { cn } from "@/lib/utils";

// Shared shell for every dashboard page. Header fixed at top, sidebar fixed
// on the left (>=lg) and scrolls independently — only <main> scrolls.
export function DashboardLayout({ active, title, children, contentClassName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-alt text-content">
      <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
      <DashboardSideBar active={active} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className={cn("min-h-screen pt-[64px] lg:pl-[260px]", contentClassName)}>
        <div className="p-3 sm:p-5 lg:p-6">
          {title && <h1 className="mb-4 text-xl font-semibold text-content sm:mb-6 sm:text-2xl">{title}</h1>}
          {children}
        </div>
      </main>
    </div>
  );
}
