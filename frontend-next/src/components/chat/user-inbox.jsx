"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { ChatShell } from "@/components/chat/chat-shell";

// Rendered at /profile/inbox, inside the profile layout (sidebar on desktop,
// back bar on mobile) — the shell supplies the page title.
export function UserInbox() {
  const { user } = useSelector((state) => state.user);
  // The user record lives in the client store only — render the same loader
  // on the server and on first client paint, then the chat (no hydration mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !user?._id) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-7 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <ChatShell
      meId={user._id}
      listConversationsUrl={`/conversation/get-all-conversation-user/${user._id}`}
      resolveOtherParty={(id) => api.get(`/shop/get-shop-info/${id}`).then((r) => r.data.shop)}
    />
  );
}
