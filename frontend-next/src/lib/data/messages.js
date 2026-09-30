import connectDB from "@/lib/db/connect";
import Messages from "@/lib/db/models/Message";

export async function createMessage({ conversationId, text, sender, images }) {
  await connectDB();
  const message = new Messages({
    conversationId,
    text,
    sender,
    images: images || undefined,
  });
  await message.save();
  return message;
}

export async function listMessagesForConversation(conversationId) {
  await connectDB();
  return Messages.find({ conversationId });
}
