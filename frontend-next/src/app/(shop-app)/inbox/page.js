import { redirect } from "next/navigation";

// The inbox now lives inside the profile layout.
export default async function InboxRedirect({ searchParams }) {
  const qs = new URLSearchParams(await searchParams).toString();
  redirect(`/profile/inbox${qs ? `?${qs}` : ""}`);
}
