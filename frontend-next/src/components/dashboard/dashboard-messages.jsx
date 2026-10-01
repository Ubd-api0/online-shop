"use client";

import { useSelector } from "react-redux";
import api from "@/lib/axios";
import { ChatShell } from "@/components/chat/chat-shell";

export function DashboardMessages() {
  const { seller } = useSelector((state) => state.seller);

  return (
    <div className="mt-2">
      {seller?._id && (
        <ChatShell
          meId={seller._id}
          listConversationsUrl={`/conversation/get-all-conversation-seller/${seller._id}`}
          resolveOtherParty={(id) => api.get(`/user/user-info/${id}`).then((r) => r.data.user)}
        />
      )}
    </div>
  );
}
