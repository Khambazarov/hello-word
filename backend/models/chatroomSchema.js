import { Schema, model } from "mongoose";

const chatroomSchema = new Schema(
  {
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lastSeen: {
      type: Map,
      of: Date,
    },
  },

  { timestamps: true }
);

const Chatroom = model("Chatroom", chatroomSchema);
export default Chatroom;
