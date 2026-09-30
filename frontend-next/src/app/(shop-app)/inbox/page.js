import { Suspense } from "react";
import { UserInbox } from "@/components/chat/user-inbox";

export const metadata = { title: "Inbox" };

export default function InboxPage() {
  return (
    <Suspense fallback={null}>
      <UserInbox />
    </Suspense>
  );
}
