"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { format } from "timeago.js";
import { Send, Image as ImageIcon, ArrowLeft, User, MessageCircle } from "lucide-react";
import api from "@/lib/axios";
import { getSocket } from "@/lib/socket";
import Cloudinary from "@/lib/cloudinary";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Shared shell for both the customer Inbox and the seller Dashboard
// Messages page — the two were ~250 lines of near-identical code in the
// original app (conversation list, socket wiring, message thread), so this
// takes the handful of things that actually differ as props.
export function ChatShell({
  meId,
  listConversationsUrl,
  resolveOtherParty,
}) {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !meId) return;

    socket.emit("addUser", meId);
    const onGetUsers = (data) => setOnlineUsers(data);
    const onGetMessage = (data) => {
      setArrivalMessage({ sender: data.senderId, text: data.text, createdAt: Date.now() });
    };
    socket.on("getUsers", onGetUsers);
    socket.on("getMessage", onGetMessage);

    return () => {
      socket.off("getUsers", onGetUsers);
      socket.off("getMessage", onGetMessage);
    };
  }, [meId]);

  useEffect(() => {
    if (arrivalMessage && currentChat?.members.includes(arrivalMessage.sender)) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    if (!meId) return;
    api
      .get(listConversationsUrl)
      .then((res) => setConversations(res.data.conversations || []))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meId, messages]);

  // Auto-open a conversation started elsewhere (e.g. "Chat" on a product page).
  useEffect(() => {
    const conversationId = searchParams.get("conversation");
    if (conversationId && conversations.length) {
      const match = conversations.find((c) => c._id === conversationId);
      if (match) selectChat(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations]);

  useEffect(() => {
    if (!currentChat?._id) return;
    api.get(`/message/get-all-messages/${currentChat._id}`).then((res) => setMessages(res.data.messages));
  }, [currentChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onlineCheck = (chat) => {
    const otherId = chat.members.find((m) => m !== meId);
    return onlineUsers.some((u) => u.userId === otherId);
  };

  const selectChat = async (chat) => {
    setCurrentChat(chat);
    setOpen(true);
    setActiveStatus(onlineCheck(chat));
    const otherId = chat.members.find((m) => m !== meId);
    try {
      const other = await resolveOtherParty(otherId);
      setUserData(other);
    } catch {
      setUserData(null);
    }
  };

  const updateLastMessage = async (lastMessage) => {
    const socket = getSocket();
    socket?.emit("updateLastMessage", { lastMessage, lastMessageId: meId });
    await api.put(`/conversation/update-last-message/${currentChat._id}`, {
      lastMessage,
      lastMessageId: meId,
    });
  };

  const sendMessageHandler = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const receiverId = currentChat.members.find((m) => m !== meId);
    const socket = getSocket();
    socket?.emit("sendMessage", { senderId: meId, receiverId, text: newMessage });

    try {
      const { data } = await api.post("/message/create-new-message", {
        sender: meId,
        text: newMessage,
        conversationId: currentChat._id,
      });
      setMessages((prev) => [...prev, data.message]);
      await updateLastMessage(newMessage);
      setNewMessage("");
    } catch {
      // best-effort — chat is not critical-path
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentChat) return;
    try {
      const imageUrl = await Cloudinary.upload(file, "chat");
      const receiverId = currentChat.members.find((m) => m !== meId);
      const socket = getSocket();
      socket?.emit("sendMessage", { senderId: meId, receiverId, images: imageUrl, text: "" });

      const { data } = await api.post("/message/create-new-message", {
        images: imageUrl,
        sender: meId,
        text: "",
        conversationId: currentChat._id,
      });
      setMessages((prev) => [...prev, data.message]);
      await updateLastMessage("Photo");
    } catch {
      // best-effort
    }
  };

  return (
    <div
      className={cn(
        "grid h-[calc(100dvh-230px)] min-h-[480px] w-full overflow-hidden rounded-lg border border-border bg-surface",
        "lg:grid-cols-[320px_minmax(0,1fr)]"
      )}
    >
      {/* conversation list — always visible on large screens */}
      <aside className={cn("min-h-0 flex-col border-border lg:flex lg:border-r", open ? "hidden" : "flex")}>
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-semibold text-content">Conversations</h2>
          <p className="text-xs text-muted">{conversations.length} chat{conversations.length === 1 ? "" : "s"}</p>
        </div>
        <div className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
          {conversations.map((item) => (
            <ConversationRow
              key={item._id}
              data={item}
              meId={meId}
              online={onlineCheck(item)}
              active={currentChat?._id === item._id}
              resolveOtherParty={resolveOtherParty}
              onSelect={() => selectChat(item)}
            />
          ))}
          {conversations.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
              <MessageCircle className="size-10 text-muted" strokeWidth={1.5} />
              <p className="text-sm text-muted">No conversations yet. Tap &ldquo;Chat&rdquo; on any product to ask us a question.</p>
            </div>
          )}
        </div>
      </aside>

      {/* thread */}
      <section className={cn("min-h-0 flex-col lg:flex", open ? "flex" : "hidden")}>
        {open && currentChat ? (
          <ChatThread
            setOpen={setOpen}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sendMessageHandler={sendMessageHandler}
            messages={messages}
            meId={meId}
            userData={userData}
            activeStatus={activeStatus}
            scrollRef={scrollRef}
            handleImageUpload={handleImageUpload}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-brand/10">
              <MessageCircle className="size-8 text-brand" strokeWidth={1.5} />
            </span>
            <p className="font-medium text-content">Select a conversation</p>
            <p className="max-w-xs text-sm text-muted">Pick a chat on the left to read and reply to messages.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function Avatar({ src, size = 44 }) {
  return (
    <div className="relative shrink-0 overflow-hidden rounded-full bg-surface-alt" style={{ width: size, height: size }}>
      {src ? (
        <Image src={src} alt="" fill className="object-cover" />
      ) : (
        <User className="absolute inset-0 m-auto size-1/2 text-muted" />
      )}
    </div>
  );
}

function ConversationRow({ data, meId, online, active, resolveOtherParty, onSelect }) {
  const [other, setOther] = useState(null);

  useEffect(() => {
    const otherId = data.members.find((m) => m !== meId);
    resolveOtherParty(otherId)
      .then(setOther)
      .catch(() => setOther(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const mine = data.lastMessageId === meId;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
        active ? "bg-brand/10" : "hover:bg-surface-alt"
      )}
    >
      <div className="relative">
        <Avatar src={other?.avatar} />
        <span
          className={cn(
            "absolute bottom-0 right-0 size-3 rounded-full border-2 border-surface",
            online ? "bg-success" : "bg-border"
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className={cn("truncate text-sm font-medium", active ? "text-brand-hover" : "text-content")}>{other?.name || "…"}</h4>
          {data.updatedAt && <span className="shrink-0 text-[11px] text-muted">{format(data.updatedAt)}</span>}
        </div>
        <p className="truncate text-xs text-muted">
          {data.lastMessage ? `${mine ? "You: " : ""}${data.lastMessage}` : "No messages yet"}
        </p>
      </div>
    </button>
  );
}

function ChatThread({ setOpen, newMessage, setNewMessage, sendMessageHandler, messages, meId, userData, activeStatus, scrollRef, handleImageUpload }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-border px-3 py-2.5">
        <button
          onClick={() => setOpen(false)}
          className="flex size-9 items-center justify-center rounded-full text-content hover:bg-surface-alt lg:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="size-5" />
        </button>
        <Avatar src={userData?.avatar} size={40} />
        <div className="min-w-0">
          <h4 className="truncate font-semibold text-content">{userData?.name || "…"}</h4>
          <span className={cn("text-xs", activeStatus ? "text-success" : "text-muted")}>
            {activeStatus ? "Active now" : "Offline — we'll reply soon"}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-surface-alt/50 px-3 py-4">
        {messages.length === 0 && <p className="py-10 text-center text-sm text-muted">Say hello 👋</p>}
        {messages.map((item, index) => {
          const mine = item.sender === meId;
          return (
            <div key={index} ref={scrollRef} className={cn("flex w-full flex-col", mine ? "items-end" : "items-start")}>
              {item.images && (
                <div className="relative mb-1 size-[200px] overflow-hidden rounded-lg border border-border">
                  <Image src={item.images} alt="" fill className="object-cover" />
                </div>
              )}
              {item.text ? (
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed sm:max-w-[65%]",
                    mine ? "rounded-br-md bg-brand text-white" : "rounded-bl-md border border-border bg-surface text-content"
                  )}
                >
                  {item.text}
                </div>
              ) : null}
              {item.createdAt && <p className="px-1 pt-0.5 text-[11px] text-muted">{format(item.createdAt)}</p>}
            </div>
          );
        })}
      </div>

      <form onSubmit={sendMessageHandler} className="flex items-center gap-2 border-t border-border p-3">
        <input type="file" id="chat-image" className="hidden" onChange={handleImageUpload} accept="image/*" />
        <label
          htmlFor="chat-image"
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-surface-alt hover:text-brand"
          title="Send a photo"
        >
          <ImageIcon className="size-5" />
        </label>
        <Input
          required
          placeholder="Type a message…"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 rounded-full"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-opacity disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
