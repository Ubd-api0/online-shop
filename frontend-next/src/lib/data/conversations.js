import { ApiError } from "@/lib/api/errors";
import connectDB from "@/lib/db/connect";
import Conversation from "@/lib/db/models/Conversation";

export async function createOrGetConversation({ groupTitle, userId, sellerId }) {
  await connectDB();
  const existing = await Conversation.findOne({ groupTitle });
  if (existing) return existing;
  return Conversation.create({ members: [userId, sellerId], groupTitle });
}

export async function listConversationsForMember(memberId) {
  await connectDB();
  return Conversation.find({ members: { $in: [memberId] } }).sort({
    updatedAt: -1,
    createdAt: -1,
  });
}

export async function findConversation(id) {
  await connectDB();
  return Conversation.findById(id).catch(() => null);
}

export async function assertConversationMember(conversationId, memberId) {
  const conversation = await findConversation(conversationId);
  if (!conversation || !conversation.members.map(String).includes(String(memberId))) {
    throw new ApiError("Conversation not found", 404);
  }
  return conversation;
}

export async function updateLastMessage(id, { lastMessage, lastMessageId }) {
  await connectDB();
  return Conversation.findByIdAndUpdate(id, { lastMessage, lastMessageId });
}
