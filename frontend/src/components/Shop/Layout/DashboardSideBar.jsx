import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { AiOutlineFolderAdd, AiOutlineGift } from "react-icons/ai";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { RxDashboard, RxCross1 } from "react-icons/rx";
import { VscNewFile } from "react-icons/vsc";
import { CiMoneyBill, CiSettings } from "react-icons/ci";
import { BiMessageSquareDetail, BiCategory } from "react-icons/bi";
import { HiOutlineReceiptRefund, HiOutlineUserGroup } from "react-icons/hi";
import { MdOutlineStorefront } from "react-icons/md";

export const NAV = [
  { key: "dashboard", label: "Dashboard", to: "/dashboard", icon: RxDashboard, group: "store" },
  { key: "orders", label: "All Orders", to: "/dashboard-orders", icon: FiShoppingBag, group: "store" },
  { key: "products", label: "All Products", to: "/dashboard-products", icon: FiPackage, group: "store" },
  { key: "create-product", label: "Create Product", to: "/dashboard-create-product", icon: AiOutlineFolderAdd, group: "store" },
  { key: "events", label: "All Events", to: "/dashboard-events", icon: MdOutlineLocalOffer, group: "store" },
  { key: "create-event", label: "Create Event", to: "/dashboard-create-event", icon: VscNewFile, group: "store" },
  { key: "withdraw", label: "Withdraw Money", to: "/dashboard-withdraw-money", icon: CiMoneyBill, group: "store" },
  { key: "inbox", label: "Shop Inbox", to: "/dashboard-messages", icon: BiMessageSquareDetail, group: "store" },
  { key: "coupons", label: "Discount Codes", to: "/dashboard-coupouns", icon: AiOutlineGift, group: "store" },
  { key: "refunds", label: "Refunds", to: "/dashboard-refunds", icon: HiOutlineReceiptRefund, group: "store" },
  { key: "categories", label: "Categories", to: "/dashboard-categories", icon: BiCategory, group: "store" },
  { key: "storefront", label: "Storefront", to: "/dashboard-storefront", icon: MdOutlineStorefront, group: "store" },
  { key: "settings", label: "Settings", to: "/settings", icon: CiSettings, group: "store" },

  { key: "admin-dashboard", label: "Admin Overview", to: "/admin/dashboard", icon: RxDashboard, group: "admin" },
  { key: "admin-orders", label: "All Orders (admin)", to: "/admin-orders", icon: FiShoppingBag, group: "admin" },
  { key: "admin-users", label: "All Customers", to: "/admin-users", icon: HiOutlineUserGroup, group: "admin" },
  { key: "admin-products", label: "All Products (admin)", to: "/admin-products", icon: FiPackage, group: "admin" },
  { key: "admin-events", label: "All Events (admin)", to: "/admin-events", icon: MdOutlineLocalOffer, group: "admin" },
  { key: "admin-withdraw", label: "Withdraw Requests", to: "/admin-withdraw-request", icon: CiMoneyBill, group: "admin" },
];

const NavRow = ({ item, active, onClose }) => {
  const Icon = item.icon;
  const isActive = active === item.key;
  return (
    <Link
      to={item.to}
      onClick={onClose}
      className={`flex items-center gap-3 px-4 py-3 text-[15px] transition border-l-[3px] ${
        isActive
          ? "border-brand text-brand font-semibold bg-surface-alt"
          : "border-transparent text-muted hover:bg-surface-alt hover:text-content"
      }`}
    >
      <Icon size={22} className="shrink-0" />
      <span className="whitespace-nowrap">{item.label}</span>
    </Link>
  );
};

const SidebarContent = ({ active, onClose, showAdmin }) => (
  <nav className="py-3">
    {NAV.filter((i) => i.group === "store").map((i) => (
      <NavRow key={i.key} item={i} active={active} onClose={onClose} />
    ))}
    {showAdmin && (
      <>
        <div className="px-4 pt-4 pb-1 text-xs uppercase tracking-wide text-muted">
          Admin
        </div>
        {NAV.filter((i) => i.group === "admin").map((i) => (
          <NavRow key={i.key} item={i} active={active} onClose={onClose} />
        ))}
      </>
    )}
  </nav>
);

const DashboardSideBar = ({ active, open, onClose }) => {
  const { user } = useSelector((state) => state.user);
  const showAdmin = user?.role === "business_owner";

  return (
    <>
      {/* desktop rail */}
      <aside className="hidden lg:block w-[260px] shrink-0 border-r border-border bg-surface min-h-[calc(100vh-64px)] sticky top-[64px] self-start overflow-y-auto">
        <SidebarContent active={active} onClose={() => {}} showAdmin={showAdmin} />
      </aside>

      {/* mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-[100] lg:hidden"
          onClick={onClose}
          role="presentation"
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute left-0 top-0 h-full w-[78%] max-w-[300px] bg-surface shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-semibold text-content">Menu</span>
              <button onClick={onClose} aria-label="Close menu">
                <RxCross1 size={20} className="text-muted" />
              </button>
            </div>
            <SidebarContent active={active} onClose={onClose} showAdmin={showAdmin} />
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardSideBar;
