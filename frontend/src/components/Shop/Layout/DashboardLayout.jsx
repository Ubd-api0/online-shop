import React, { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSideBar from "./DashboardSideBar";

// Shared shell for every store / admin dashboard page.
// `active` is the nav key of the current page (see NAV in DashboardSideBar).
const DashboardLayout = ({ active, children, contentClassName = "" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-alt text-content">
      <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex w-full">
        <DashboardSideBar
          active={active}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main
          className={`flex-1 min-w-0 p-3 sm:p-5 lg:p-6 ${contentClassName}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
