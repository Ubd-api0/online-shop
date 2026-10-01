"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { ArrowLeft, LogOut, ShieldCheck, User } from "lucide-react";
import api from "@/lib/axios";
import { PROFILE_NAV, titleFor } from "@/components/profile/profile-nav";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export async function logout() {
  try {
    const { data } = await api.get("/user/logout");
    toast.success(data.message || "Logged out");
    window.location.assign("/login");
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not log out");
  }
}

export function UserAvatar({ user, size = 48 }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full bg-brand/15 text-brand"
      style={{ width: size, height: size }}
    >
      {user?.avatar ? (
        <Image src={user.avatar} alt="" fill className="object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center font-semibold">
          {user?.name?.[0]?.toUpperCase() || <User className="size-1/2" />}
        </span>
      )}
    </div>
  );
}

// Desktop: sticky sidebar + content. Mobile: the /profile hub is its own
// menu page, every sub-page gets an app-style back bar instead of a sidebar.
export function ProfileShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSelector((state) => state.user);
  const isHub = pathname === "/profile";

  return (
    <div className="mx-auto max-w-7xl px-0 pb-6 800px:flex 800px:gap-6 800px:px-6 800px:py-8">
      <aside className="hidden w-[270px] shrink-0 self-start 800px:sticky 800px:top-[100px] 800px:block">
        <Card variant="solid" className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <UserAvatar user={user} size={44} />
            <div className="min-w-0">
              <p className="text-xs text-muted">Hello,</p>
              <p className="truncate font-semibold text-content">{user?.name || "…"}</p>
            </div>
          </div>
          <nav className="p-2">
            {PROFILE_NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-DEFAULT px-3 py-2.5 text-sm transition-colors",
                    active ? "bg-brand/10 font-medium text-brand" : "text-content hover:bg-surface-alt"
                  )}
                >
                  <Icon className="size-[18px] shrink-0" />
                  {label}
                </Link>
              );
            })}
            {user?.role === "business_owner" && (
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-DEFAULT px-3 py-2.5 text-sm text-content hover:bg-surface-alt"
              >
                <ShieldCheck className="size-[18px]" /> Store Dashboard
              </Link>
            )}
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-DEFAULT px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10"
            >
              <LogOut className="size-[18px]" /> Logout
            </button>
          </nav>
        </Card>
      </aside>

      <section className="min-w-0 flex-1">
        {!isHub && (
          <div className="mb-4 flex items-center gap-2 border-b border-border bg-surface px-2 py-2 800px:hidden">
            <button
              onClick={() => router.push("/profile")}
              className="flex size-10 items-center justify-center rounded-full text-content hover:bg-surface-alt"
              aria-label="Back to my account"
            >
              <ArrowLeft className="size-5" />
            </button>
            <h1 className="text-base font-semibold text-content">{titleFor(pathname)}</h1>
          </div>
        )}
        <div className={cn(!isHub && "px-3 800px:px-0")}>
          {!isHub && <h1 className="mb-5 hidden text-2xl font-semibold text-content 800px:block">{titleFor(pathname)}</h1>}
          {children}
        </div>
      </section>
    </div>
  );
}
