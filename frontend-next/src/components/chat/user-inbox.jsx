"use client";

import { useSelector } from "react-redux";
import api from "@/lib/axios";
import { ChatShell } from "@/components/chat/chat-shell";

export function UserInbox() {
  const { user } = useSelector((state) => state.user);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 800px:px-6">
      <h1 className="py-3 text-center font-display text-2xl text-content">All Messages</h1>
      {user?._id && (
        <ChatShell
          meId={user._id}
          listConversationsUrl={`/conversation/get-all-conversation-user/${user._id}`}
          resolveOtherParty={(id) => api.get(`/shop/get-shop-info/${id}`).then((r) => r.data.shop)}
        />
      )}
    </div>
  );
}
