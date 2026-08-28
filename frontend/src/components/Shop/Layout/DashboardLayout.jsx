import React, { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSideBar from "./DashboardSideBar";

// Shared shell for every dashboard page.
// Header is fixed at the top, the sidebar is fixed on the left (>=lg) and
// scrolls on its own — only <main> scrolls with the page.
// Pass `title` for the page heading shown at the top of the content area.
const DashboardLayout = ({ active, title, children, contentClassName = "" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-alt text-content">
      <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
      <DashboardSideBar
        active={active}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main
        className={`pt-[64px] lg:pl-[260px] min-h-screen ${contentClassName}`}
      >
        <div className="p-3 sm:p-5 lg:p-6">
          {title && (
            <h1 className="text-xl sm:text-2xl font-semibold text-content mb-4 sm:mb-6">
              {title}
            </h1>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
