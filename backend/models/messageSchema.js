import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    chatroom: { type: Schema.Types.ObjectId, ref: "Chatroom" },
    content: { type: String, required: true },
    image: String,
  },
  { timestamps: true }
);

const Message = model("Message", messageSchema);
export default Message;
