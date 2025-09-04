import { Schema, model } from "mongoose";

const chatroomSchema = new Schema(
  {
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lastSeen: {
      type: Map,
      of: Date,
    },
    // Gruppenchat-spezifische Felder
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      maxlength: 50,
      trim: true,
    },
    groupDescription: {
      type: String,
      maxlength: 200,
      trim: true,
    },
    groupImage: {
      type: String, // Cloudinary URL
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Chatroom = model("Chatroom", chatroomSchema);
export default Chatroom;
