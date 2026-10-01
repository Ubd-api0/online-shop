import {
  LayoutDashboard,
  UserPen,
  ShoppingBag,
  Truck,
  RotateCcw,
  MessageCircle,
  BookUser,
  KeyRound,
} from "lucide-react";

// Every profile section has its own URL (all rendered inside profile/layout.js).
export const PROFILE_NAV = [
  { href: "/profile", label: "My Account", icon: LayoutDashboard, desktopOnly: true },
  { href: "/profile/orders", label: "My Orders", icon: ShoppingBag },
  { href: "/profile/track", label: "Track Order", icon: Truck },
  { href: "/profile/refunds", label: "Returns & Refunds", icon: RotateCcw },
  { href: "/profile/inbox", label: "Messages", icon: MessageCircle },
  { href: "/profile/addresses", label: "Address Book", icon: BookUser },
  { href: "/profile/info", label: "Edit Profile", icon: UserPen },
  { href: "/profile/password", label: "Change Password", icon: KeyRound },
];

export const titleFor = (pathname) => PROFILE_NAV.find((i) => i.href === pathname)?.label || "My Account";
