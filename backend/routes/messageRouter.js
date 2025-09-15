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

      // Reset edit seen flags when message is edited
      message.editSeenBy = []; // Clear group chat seen list
      message.editSeenByOwner = false; // Reset owner seen flag for 1-to-1 chats
      message.editSeenByPartner = false; // Reset partner seen flag for 1-to-1 chats

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
      const currentUserId = req.session.user.id;

      const message = await Message.findById(messageId).populate("chatroom");

      if (!message) {
        return res.status(404).json({ errorMessage: "Message not found" });
      }

      const chatroom = message.chatroom;

      // Für normale 1-zu-1 Chats: nur eigene Nachrichten löschen
      if (!chatroom.isGroupChat) {
        if (message.sender.toString() !== currentUserId) {
          return res
            .status(403)
            .json({ errorMessage: "You can only delete your own messages" });
        }
      } else {
        // Für Gruppenchats: erweiterte Berechtigungen prüfen
        const isOwnMessage = message.sender.toString() === currentUserId;
        const isOwner =
          chatroom.owner && chatroom.owner.toString() === currentUserId;
        const isAdmin =
          chatroom.admins && chatroom.admins.includes(currentUserId);

        // owner kann alle Nachrichten löschen
        // Admin kann Nachrichten von normalen Members löschen (nicht von anderen Admins oder owner)
        // Members können nur ihre eigenen Nachrichten löschen
        if (!isOwnMessage) {
          if (isOwner) {
            // owner kann alle Nachrichten löschen
          } else if (isAdmin) {
            // Admin kann nur Nachrichten von normalen Members löschen
            const messageAuthorIsAdmin = chatroom.admins.includes(
              message.sender.toString()
            );
            const messageAuthorisOwner =
              chatroom.owner &&
              chatroom.owner.toString() === message.sender.toString();

            if (messageAuthorIsAdmin || messageAuthorisOwner) {
              return res.status(403).json({
                errorMessage:
                  "Admins cannot delete messages from other admins or the owner",
              });
            }
          } else {
            // Normale Members können nur ihre eigenen Nachrichten löschen
            return res
              .status(403)
              .json({ errorMessage: "You can only delete your own messages" });
          }
        }
      }

      await Message.findByIdAndDelete(messageId);

      io.to(message.chatroom.toString()).emit("message-delete", {
        deletedMessage: message,
      });

      res.status(200).json({
        message: "Message deleted successfully",
        deletedMessage: message,
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  /** MARK EDITED MESSAGE AS SEEN */
  router.patch("/mark-edit-seen", async (req, res) => {
    try {
      const { messageId } = req.body;
      const userId = req.session.user.id;

      const message = await Message.findById(messageId).populate("chatroom");
      if (!message) {
        return res.status(404).json({ errorMessage: "Message not found" });
      }

      const chatroom = message.chatroom;

      // Check if user is part of the chatroom
      if (chatroom.isGroupChat) {
        if (!chatroom.users.some((user) => user._id.toString() === userId)) {
          return res
            .status(403)
            .json({ errorMessage: "Not authorized to access this chatroom" });
        }

        // For group chats: add user to editSeenBy array if not already present
        if (!message.editSeenBy) {
          message.editSeenBy = [];
        }
        if (!message.editSeenBy.includes(userId)) {
          message.editSeenBy.push(userId);
        }
      } else {
        // For 1-to-1 chats: check if user is part of the chat
        if (!chatroom.users.some((user) => user._id.toString() === userId)) {
          return res
            .status(403)
            .json({ errorMessage: "Not authorized to access this chatroom" });
        }

        // Determine if user is the message owner or partner
        const isOwner = message.sender.toString() === userId;
        if (isOwner) {
          message.editSeenByOwner = true;
        } else {
          message.editSeenByPartner = true;
        }
      }

      await message.save();

      // Emit update to all users in the chatroom
      const updatedMessage =
        await Message.findById(messageId).populate("sender");
      io.to(chatroom._id.toString()).emit("message-update", {
        updatedMessage,
      });

      res.status(200).json({
        message: "Edit marked as seen",
        updatedMessage,
      });
    } catch (error) {
      console.error("Error marking edit as seen:", error);
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  return router;
};
