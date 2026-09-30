"use client";

import { useSelector } from "react-redux";
import api from "@/lib/axios";
import { ChatShell } from "@/components/chat/chat-shell";
import { Card } from "@/components/ui/card";

export function DashboardMessages() {
  const { seller } = useSelector((state) => state.seller);

  return (
    <Card variant="solid" className="mt-4 h-[80vh] overflow-y-auto">
      {seller?._id && (
        <ChatShell
          meId={seller._id}
          listConversationsUrl={`/conversation/get-all-conversation-seller/${seller._id}`}
          resolveOtherParty={(id) => api.get(`/user/user-info/${id}`).then((r) => r.data.user)}
        />
      )}
    </Card>
  );
}
