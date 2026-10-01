"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { format } from "timeago.js";
import { Send, Image as ImageIcon, ArrowRight, User } from "lucide-react";
import api from "@/lib/axios";
import { getSocket } from "@/lib/socket";
import Cloudinary from "@/lib/cloudinary";
import { Input } from "@/components/ui/input";

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
    <div className="w-full">
      {!open && (
        <div className="divide-y divide-border">
          {conversations.map((item) => (
            <ConversationRow
              key={item._id}
              data={item}
              meId={meId}
              online={onlineCheck(item)}
              resolveOtherParty={resolveOtherParty}
              onSelect={() => selectChat(item)}
            />
          ))}
          {conversations.length === 0 && <p className="py-10 text-center text-muted">No conversations yet.</p>}
        </div>
      )}

      {open && currentChat && (
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
      )}
    </div>
  );
}

function ConversationRow({ data, meId, online, resolveOtherParty, onSelect }) {
  const [other, setOther] = useState(null);

  useEffect(() => {
    const otherId = data.members.find((m) => m !== meId);
    resolveOtherParty(otherId)
      .then(setOther)
      .catch(() => setOther(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <button onClick={onSelect} className="flex w-full items-center gap-3 p-3 text-left hover:bg-surface-alt">
      <div className="relative">
        <div className="relative size-[50px] overflow-hidden rounded-full bg-surface-alt">
          {other?.avatar ? (
            <Image src={other.avatar} alt="" fill className="object-cover" />
          ) : (
            <User className="absolute inset-0 m-auto size-6 text-muted" />
          )}
        </div>
        <div className={`absolute right-0 top-0 size-3 rounded-full ${online ? "bg-green-400" : "bg-muted"}`} />
      </div>
      <div className="min-w-0">
        <h4 className="truncate text-content">{other?.name || "…"}</h4>
        <p className="truncate text-sm text-muted">
          {data.lastMessageId !== other?._id ? "You: " : `${other?.name?.split(" ")[0] || ""}: `}
          {data.lastMessage}
        </p>
      </div>
    </button>
  );
}

function ChatThread({ setOpen, newMessage, setNewMessage, sendMessageHandler, messages, meId, userData, activeStatus, scrollRef, handleImageUpload }) {
  return (
    <div className="flex h-[75vh] w-full flex-col justify-between">
      <div className="glass-surface flex items-center justify-between border-x-0 border-t-0 p-3">
        <div className="flex items-center gap-3">
          <div className="relative size-[50px] overflow-hidden rounded-full bg-surface-alt">
            {userData?.avatar ? (
              <Image src={userData.avatar} alt="" fill className="object-cover" />
            ) : (
              <User className="absolute inset-0 m-auto size-6 text-muted" />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-content">{userData?.name}</h4>
            {activeStatus && <span className="text-sm text-success">Active Now</span>}
          </div>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Back">
          <ArrowRight className="size-5 text-content" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {messages.map((item, index) => (
          <div key={index} ref={scrollRef} className={`my-2 flex w-full ${item.sender === meId ? "justify-end" : "justify-start"}`}>
            {item.images && (
              <div className="relative mb-2 mr-2 size-[220px] overflow-hidden rounded-DEFAULT">
                <Image src={item.images} alt="" fill className="object-cover" />
              </div>
            )}
            {item.text ? (
              <div>
                <div className={`w-max max-w-[70vw] rounded-DEFAULT p-2 text-white ${item.sender === meId ? "bg-brand" : "bg-neutral-600"}`}>
                  <p>{item.text}</p>
                </div>
                {item.createdAt && <p className="pt-1 text-xs text-muted">{format(item.createdAt)}</p>}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessageHandler} className="flex items-center gap-3 p-3">
        <input type="file" id="chat-image" className="hidden" onChange={handleImageUpload} accept="image/*" />
        <label htmlFor="chat-image" className="cursor-pointer text-muted hover:text-brand">
          <ImageIcon className="size-5" />
        </label>
        <div className="relative flex-1">
          <Input
            required
            placeholder="Enter your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="pr-10"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-brand">
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
