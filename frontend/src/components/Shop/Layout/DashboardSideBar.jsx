import React from "react";
import { Link } from "react-router-dom";
import { AiOutlineFolderAdd, AiOutlineGift } from "react-icons/ai";
import { FiPackage, FiShoppingBag, FiUsers } from "react-icons/fi";
import { MdOutlineLocalOffer, MdOutlineStorefront } from "react-icons/md";
import { RxDashboard, RxCross1 } from "react-icons/rx";
import { VscNewFile } from "react-icons/vsc";
import { CiSettings } from "react-icons/ci";
import { BiMessageSquareDetail, BiCategory } from "react-icons/bi";
import { HiOutlineReceiptRefund } from "react-icons/hi";

export const NAV = [
  { key: "dashboard", label: "Dashboard", to: "/dashboard", icon: RxDashboard },
  { key: "orders", label: "All Orders", to: "/dashboard-orders", icon: FiShoppingBag },
  { key: "products", label: "All Products", to: "/dashboard-products", icon: FiPackage },
  { key: "create-product", label: "Create Product", to: "/dashboard-create-product", icon: AiOutlineFolderAdd },
  { key: "events", label: "All Events", to: "/dashboard-events", icon: MdOutlineLocalOffer },
  { key: "create-event", label: "Create Event", to: "/dashboard-create-event", icon: VscNewFile },
  { key: "inbox", label: "Shop Inbox", to: "/dashboard-messages", icon: BiMessageSquareDetail },
  { key: "coupons", label: "Discount Codes", to: "/dashboard-coupouns", icon: AiOutlineGift },
  { key: "refunds", label: "Refunds", to: "/dashboard-refunds", icon: HiOutlineReceiptRefund },
  { key: "customers", label: "Customers", to: "/dashboard-customers", icon: FiUsers },
  { key: "categories", label: "Categories", to: "/dashboard-categories", icon: BiCategory },
  { key: "storefront", label: "Storefront", to: "/dashboard-storefront", icon: MdOutlineStorefront },
  { key: "settings", label: "Settings", to: "/settings", icon: CiSettings },
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

const NavList = ({ active, onClose }) => (
  <nav className="py-3">
    {NAV.map((i) => (
      <NavRow key={i.key} item={i} active={active} onClose={onClose} />
    ))}
  </nav>
);

const DashboardSideBar = ({ active, open, onClose }) => (
  <>
    {/* desktop — fixed rail, scrolls independently of the page */}
    <aside className="hidden lg:block fixed left-0 top-[64px] bottom-0 w-[260px] border-r border-border bg-surface overflow-y-auto z-[80]">
      <NavList active={active} onClose={() => {}} />
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
          <NavList active={active} onClose={onClose} />
        </div>
      </div>
    )}
  </>
);

export default DashboardSideBar;
