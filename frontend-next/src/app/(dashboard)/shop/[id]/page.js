import { redirect } from "next/navigation";

// Old admin URL for the store's own profile — now lives in the dashboard.
// (The public shop page is /shop/preview/[id].)
export default function LegacyShopPage() {
  redirect("/dashboard-store");
}
