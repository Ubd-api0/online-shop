"use client";

import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Menu, LogOut } from "lucide-react";
import api from "@/lib/axios";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function DashboardHeader({ onMenuClick }) {
  const { seller } = useSelector((state) => state.seller);
  const { user } = useSelector((state) => state.user);

  const logout = async () => {
    try {
      await api.get("/user/logout");
      toast.success("Logged out");
      window.location.assign("/login");
    } catch {
      toast.error("Could not log out");
    }
  };

  const avatar = seller?.avatar || user?.avatar;

  return (
    <header className="glass-surface fixed left-0 right-0 top-0 z-[90] flex h-[64px] items-center justify-between border-x-0 border-t-0 px-3 sm:px-5">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="text-content lg:hidden" aria-label="Open menu">
          <Menu className="size-6" />
        </button>
        <Link href="/dashboard" className="text-lg font-bold text-brand">
          Store Admin
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Link href="/" className="hidden text-sm text-muted hover:text-brand sm:block">
          View store
        </Link>
        {avatar && (
          <Link href={seller?._id ? `/shop/${seller._id}` : "/profile"}>
            <div className="relative size-9 overflow-hidden rounded-full border border-border">
              <Image src={avatar} alt="" fill className="object-cover" />
            </div>
          </Link>
        )}
        <button onClick={logout} className="text-muted hover:text-brand" aria-label="Log out">
          <LogOut className="size-5" />
        </button>
      </div>
    </header>
  );
}
