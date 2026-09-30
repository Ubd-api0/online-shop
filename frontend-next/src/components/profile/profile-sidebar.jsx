"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  User,
  ShoppingBag,
  RotateCcw,
  MessageCircle,
  Locate,
  KeyRound,
  BookUser,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import api from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ITEMS = [
  { id: 1, label: "Profile", icon: User },
  { id: 2, label: "Orders", icon: ShoppingBag },
  { id: 3, label: "Refunds", icon: RotateCcw },
  { id: 4, label: "Inbox", icon: MessageCircle, href: "/inbox" },
  { id: 5, label: "Track Order", icon: Locate },
  { id: 6, label: "Change password", icon: KeyRound },
  { id: 7, label: "Address", icon: BookUser },
];

export function ProfileSidebar({ active, setActive }) {
  const router = useRouter();
  const { user } = useSelector((state) => state.user);

  const logoutHandler = async () => {
    try {
      const { data } = await api.get("/user/logout");
      toast.success(data.message);
      window.location.assign("/login");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <Card variant="solid" className="w-full p-4 pt-8">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        const content = (
          <div
            className={cn(
              "mb-6 flex w-full cursor-pointer items-center",
              isActive ? "text-brand" : "text-content"
            )}
            onClick={() => {
              if (item.href) router.push(item.href);
              else setActive(item.id);
            }}
          >
            <Icon className="size-5 shrink-0" />
            <span className="hidden pl-3 800px:block">{item.label}</span>
          </div>
        );
        return <div key={item.id}>{content}</div>;
      })}

      {user?.role === "business_owner" && (
        <Link href="/dashboard">
          <div className="mb-6 flex w-full cursor-pointer items-center text-content">
            <ShieldCheck className="size-5 shrink-0" />
            <span className="hidden pl-3 800px:block">Store Dashboard</span>
          </div>
        </Link>
      )}

      <div className="flex w-full cursor-pointer items-center text-content" onClick={logoutHandler}>
        <LogOut className="size-5 shrink-0" />
        <span className="hidden pl-3 800px:block">Logout</span>
      </div>
    </Card>
  );
}
