import mongoose from "mongoose";

const messagesSchema = new mongoose.Schema(
  {
    conversationId: { type: String },
    text: { type: String },
    sender: { type: String },
    images: { type: String },
  },
  { timestamps: true }
);

// Collection name stays "messages" (Mongoose model name "Messages"), matching
// the original backend/model/messages.js exactly.
export default mongoose.models.Messages || mongoose.model("Messages", messagesSchema);
