import express from "express";
import Message from "../models/messageSchema.js";
import Chatroom from "../models/chatroomSchema.js";

const router = express.Router();

/** SEND A MESSAGE */
export default (io) => {
  router.post("/send", async (req, res) => {
    try {
      const { chatroom, content } = req.body;
      const sender = req.session.user.id;

      const chatroomData = await Chatroom.findById(chatroom);
      if (!chatroomData) {
        return res.status(404).json({ errorMessage: "Chatroom not found" });
      }

      const newMessage = new Message({ chatroom, content, sender });
      await newMessage.save();

      const messageWithUser = await Message.populate(newMessage, {
        path: "sender",
      });

      io.to(chatroom).emit("message", messageWithUser);

      res
        .status(201)
        .json({ message: "Message sent successfully", messageWithUser });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  router.patch("/edit", async (req, res) => {
    try {
      const { messageId, content } = req.body;
      const sender = req.session.user.id;

      const message = await Message.findById(messageId);

      if (!message) {
        return res.status(404).json({ errorMessage: "Message not found" });
      }

      if (message.sender.toString() !== sender) {
        return res
          .status(403)
          .json({ errorMessage: "You can only edit your own messages" });
      }

      message.content = content;
      await message.save();

      await Message.populate(message, {
        path: "sender",
      });

      io.to(message.chatroom.toString()).emit("message-update", {
        updatedMessage: message,
      });

      res.status(200).json({
        message: "Message edited successfully",
        updatedMessage: message,
      });
    } catch (error) {
      console.error("Error editing messages:", error);
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

    router.delete("/delete", async (req, res) => {
      try {
        const { messageId, content } = req.body;
        const sender = req.session.user.id;

        const message = await Message.findById(messageId);

        if (!message) {
          return res.status(404).json({ errorMessage: "Message not found" });
        }

        if (message.sender.toString() !== sender) {
          return res
            .status(403)
            .json({ errorMessage: "You can only delete your own messages" });
        }

        await Message.findByIdAndDelete(messageId)

        io.to(message.chatroom.toString()).emit("message-delete", {
          deletedMessage: message,
        });

        res.status(200).json({
          message: "Message delete successfully",
          deletedMessage: message,
        });
      } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ errorMessage: "Internal server error" });
      }
    });

  return router;
};
