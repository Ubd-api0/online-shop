import { Suspense } from "react";
import { UserInbox } from "@/components/chat/user-inbox";

export const metadata = { title: "Messages" };

export default function ProfileInboxPage() {
  return (
    <Suspense fallback={null}>
      <UserInbox />
    </Suspense>
  );
}
