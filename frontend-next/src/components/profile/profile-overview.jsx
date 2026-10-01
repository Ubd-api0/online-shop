"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { ChevronRight, Package, Truck, PackageCheck, RotateCcw, LogOut, ShieldCheck, Palette, Pencil } from "lucide-react";
import { getAllOrdersOfUser } from "@/redux/slices/order";
import { PROFILE_NAV } from "@/components/profile/profile-nav";
import { groupOf } from "@/components/profile/profile-orders";
import { OrderTable } from "@/components/profile/order-table";
import { UserAvatar, logout } from "@/components/profile/profile-shell";
import { ThemeSwitch } from "@/components/layout/theme-toggle";
import { Card } from "@/components/ui/card";

const SHORTCUTS = [
  { group: "to_ship", label: "To ship", icon: Package },
  { group: "shipped", label: "Shipped", icon: Truck },
  { group: "delivered", label: "Delivered", icon: PackageCheck },
  { group: "returns", label: "Returns", icon: RotateCcw },
];

export function ProfileOverview() {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch, user]);

  const counts = {};
  for (const o of orders || []) {
    const g = groupOf(o.status);
    counts[g] = (counts[g] || 0) + 1;
  }

  return (
    <div className="space-y-4 px-3 pt-4 800px:px-0 800px:pt-0">
      {/* User card */}
      <Card variant="solid" className="flex items-center gap-4 p-4 800px:p-5">
        <UserAvatar user={user} size={64} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-content">{user?.name || "…"}</p>
          <p className="truncate text-sm text-muted">{user?.email}</p>
        </div>
        <Link
          href="/profile/info"
          className="flex size-10 items-center justify-center rounded-full text-muted hover:bg-surface-alt hover:text-brand"
          aria-label="Edit profile"
        >
          <Pencil className="size-[18px]" />
        </Link>
      </Card>

      {/* Order shortcuts */}
      <Card variant="solid" className="p-4 800px:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-content">My Orders</h2>
          <Link href="/profile/orders" className="flex items-center text-sm text-muted hover:text-brand">
            View all <ChevronRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {SHORTCUTS.map(({ group, label, icon: Icon }) => (
            <Link
              key={group}
              href={`/profile/orders?status=${group}`}
              className="relative flex flex-col items-center gap-1.5 rounded-DEFAULT py-2 text-xs text-content hover:bg-surface-alt"
            >
              <span className="relative">
                <Icon className="size-6 text-brand" strokeWidth={1.6} />
                {counts[group] > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 min-w-[18px] rounded-full bg-brand px-1 text-center text-[10px] font-medium leading-[18px] text-white">
                    {counts[group]}
                  </span>
                )}
              </span>
              {label}
            </Link>
          ))}
        </div>
      </Card>

      {/* Mobile: menu list (desktop has the sidebar) */}
      <Card variant="solid" className="divide-y divide-border overflow-hidden 800px:hidden">
        {PROFILE_NAV.filter((i) => !i.desktopOnly && i.href !== "/profile/orders").map(({ href, label, icon: Icon }) => (
          <MenuRow key={href} href={href} icon={Icon} label={label} />
        ))}
        {user?.role === "business_owner" && <MenuRow href="/dashboard" icon={ShieldCheck} label="Store Dashboard" />}
      </Card>

      <Card variant="solid" className="flex items-center justify-between gap-3 p-4 800px:hidden">
        <span className="flex items-center gap-3 text-sm text-content">
          <Palette className="size-5 text-muted" /> Appearance
        </span>
        <ThemeSwitch />
      </Card>

      <button
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface py-3 text-sm font-medium text-red-500 800px:hidden"
      >
        <LogOut className="size-4" /> Log out
      </button>

      {/* Desktop: recent orders */}
      <div className="hidden 800px:block">
        <h2 className="mb-3 font-semibold text-content">Recent orders</h2>
        <OrderTable orders={orders && orders.slice(0, 3)} />
      </div>
    </div>
  );
}

function MenuRow({ href, icon: Icon, label }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3.5 text-sm text-content active:bg-surface-alt">
      <Icon className="size-5 text-muted" />
      <span className="flex-1">{label}</span>
      <ChevronRight className="size-4 text-muted" />
    </Link>
  );
}
