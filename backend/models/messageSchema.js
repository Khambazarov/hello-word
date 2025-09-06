import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: false },
    chatroom: { type: Schema.Types.ObjectId, ref: "Chatroom" },
    content: { type: String, required: true },
    image: String,
    isSystemMessage: {
      type: Boolean,
      default: false,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "audio", "system"],
      default: "text",
    },
    // Fields to track who has seen edited messages
    editSeenBy: [{ type: Schema.Types.ObjectId, ref: "User" }], // For group chats
    editSeenByOwner: { type: Boolean, default: false }, // For 1-to-1 chats (owner of message)
    editSeenByPartner: { type: Boolean, default: false }, // For 1-to-1 chats (other person)
  },
  { timestamps: true }
);

const Message = model("Message", messageSchema);
export default Message;
