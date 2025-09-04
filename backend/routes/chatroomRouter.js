import express from "express";
import Chatroom from "../models/chatroomSchema.js";
import Message from "../models/messageSchema.js";
import User from "../models/userSchema.js";

const router = express.Router();

function isAuth(req, res, next) {
  const currentUsername = req.session.user?.username;
  const currentUserId = req.session.user?.id;

  if (currentUsername === undefined || currentUserId === undefined) {
    return res.status(401).json({ errorMessage: "User is not Authenticated" });
  }
  next();
}

router.use(isAuth);

/** CREATE NEW CHATROOM */
export default (io) => {
  router.post("/exist", async (req, res) => {
    try {
      const currentUserId = req.session.user.id;
      const currentUsername = req.session.user.username;
      const { username } = req.body;

      const user = await User.findOne({ username });

      if (!user) {
        return res.status(404).json({ errorMessage: "User not found" });
      }

      if (currentUsername === username) {
        return res.status(401).json({ errorMessage: "Not allowed" });
      }

      const chatroomExists = await Chatroom.findOne({
        users: { $all: [user._id, currentUserId] },
      });

      if (chatroomExists) {
        return res.json({ chatroom: chatroomExists._id });
      }

      res.json({
        chatroom: "new-chatroom",
        partnerName: user.username,
        partnerId: user._id,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  router.post("/create", async (req, res) => {
    try {
      const { partnerName, content } = req.body;
      const currentUserId = req.session.user.id;
      const partner = await User.findOne({ username: partnerName });
      const newChatroom = await Chatroom.create({
        users: [partner._id, currentUserId],
        lastSeen: new Map([
          [partner._id.toString(), new Date(0)],
          [currentUserId.toString(), new Date(0)],
        ]),
      });

      const newMessage = await Message.create({
        content,
        chatroom: newChatroom._id,
        sender: currentUserId,
      });

      newChatroom.lastSeen.set(currentUserId.toString(), newMessage.createdAt);
      await newChatroom.save();
      // io.emit("chatroom", { chatroom: newChatroom, message: newMessage });
      io.emit("message", newMessage);

      res.status(201).json({ chatroomId: newChatroom._id });
    } catch (error) {
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  router.get("/chats", async (req, res) => {
    try {
      const currentUsername = req.session.user?.username;
      const currentUserId = req.session.user?.id;

      if (!currentUsername || !currentUserId) {
        return res.status(401).json({ errorMessage: "User not authenticated" });
      }

      const currentUser = await User.findById(currentUserId);
      if (!currentUser) {
        return res.status(404).json({ errorMessage: "User not found" });
      }

      const volume = currentUser.volume || "middle";
      const allChats = await Chatroom.find({ users: currentUserId })
        .populate("users")
        .populate("creator", "username")
        .populate("admins", "username");

      if (!allChats || allChats.length === 0) {
        return res.json({ chatrooms: [], currentUsername, volume });
      }

      // TODO: IMPLEMENT AS MONGODB QUERY
      const outputChats = await Promise.all(
        allChats.map(async (chat) => {
          const chatId = chat._id;

          // Für Gruppenchats
          if (chat.isGroupChat) {
            const lastMessage = await Message.findOne({
              chatroom: chatId,
            }).sort({
              createdAt: -1,
            });

            const unreadMessagesCount = await Message.countDocuments({
              chatroom: chatId,
              createdAt: { $gt: chat.lastSeen.get(currentUserId) },
              sender: { $ne: currentUserId },
            });

            const timestamps = await Message.find({ chatroom: chatId })
              .sort({ createdAt: -1 })
              .select("createdAt");

            const formattedTimestamps = timestamps.map((msg) => msg.createdAt);

            return {
              chatId,
              isGroupChat: true,
              groupName: chat.groupName,
              groupDescription: chat.groupDescription,
              groupImage: chat.groupImage,
              creator: chat.creator,
              admins: chat.admins,
              memberCount: chat.users.length,
              lastMessage,
              timestamps: formattedTimestamps,
              unreadMessagesCount,
              currentUserId,
              lastActivity: chat.lastActivity,
            };
          }

          // Für normale Chats (bestehende Logik)
          const usernames = chat.users
            .map((user) => user.username)
            .filter((username) => username !== currentUsername);

          const lastMessage = await Message.findOne({ chatroom: chatId }).sort({
            createdAt: -1,
          });

          const unreadMessagesCount = await Message.countDocuments({
            chatroom: chatId,
            createdAt: { $gt: chat.lastSeen.get(currentUserId) },
            sender: { $ne: currentUserId },
          });

          const timestamps = await Message.find({ chatroom: chatId })
            .sort({ createdAt: -1 })
            .select("createdAt");

          const formattedTimestamps = timestamps.map((msg) => msg.createdAt);

          const isDeletedAccount =
            Array.isArray(usernames) && usernames.length === 0;

          if (isDeletedAccount && !lastMessage) {
            await Chatroom.findByIdAndDelete(chatId);
          }

          return {
            chatId,
            isGroupChat: false,
            usernames,
            lastMessage,
            timestamps: formattedTimestamps,
            unreadMessagesCount,
            currentUserId,
            isDeletedAccount,
          };
        })
      );

      const sortedChatrooms = outputChats.sort((a, b) => {
        // 1. Sortiere gelöschte Konten nach unten
        if (a.isDeletedAccount && !b.isDeletedAccount) return 1;
        if (!a.isDeletedAccount && b.isDeletedAccount) return -1;

        // 2. Sortiere Chatrooms ohne lastMessage zwischen denen mit lastMessage und gelöschten Konten
        if (!a.lastMessage && b.lastMessage) return 1;
        if (a.lastMessage && !b.lastMessage) return -1;

        // 3. Für Gruppenchats: nach lastActivity sortieren
        if (a.isGroupChat && b.isGroupChat) {
          return new Date(b.lastActivity) - new Date(a.lastActivity);
        }

        // 4. Sortiere nach lastMessage.createdAt, wenn beide eine lastMessage haben
        if (a.lastMessage && b.lastMessage) {
          return b.lastMessage.createdAt - a.lastMessage.createdAt;
        }

        // 5. Wenn beide keine lastMessage haben, bleibt die Reihenfolge gleich
        return 0;
      });

      res.json({ chatrooms: sortedChatrooms, currentUsername, volume });
    } catch (error) {
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  router.post("/chats/:id/mark-as-read", async (req, res) => {
    const currentUserId = req.session.user.id;
    const { id } = req.params;

    const chatroom = await Chatroom.findById(id);

    const now = new Date();

    chatroom.lastSeen.set(currentUserId, now);
    await chatroom.save();

    res.status(200).json({ message: "Successfully updated", now });
  });

  /** GET CHATROOM MESSAGES */
  router.get("/chats/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const currentUsername = req.session.user.username;
      const currentUserId = req.session.user.id;

      const currentUser = await User.findById(currentUserId);
      const volume = currentUser.volume;

      const chatroom = await Chatroom.findOne({ _id: id })
        .populate("users", "username email")
        .populate("creator", "username")
        .populate("admins", "username");

      if (!chatroom) {
        return res.status(404).json({ errorMessage: "Chatroom not found" });
      }

      // Prüfen ob User Mitglied ist
      const isMember = chatroom.users.some(
        (user) => user._id.toString() === currentUserId
      );
      if (!isMember) {
        return res.status(403).json({ errorMessage: "Access denied" });
      }

      const chatroomMessages = await Message.find({ chatroom: id }).populate(
        "sender"
      );

      const timestamps = await Message.find({ chatroom: id })
        .sort({ createdAt: -1 })
        .select("createdAt");

      const formattedTimestamps = timestamps.map((msg) => msg.createdAt);

      const lastSeen = chatroom.lastSeen.get(currentUserId);

      const unreadMessagesCount = await Message.countDocuments({
        chatroom: id,
        createdAt: { $gt: lastSeen },
        sender: { $ne: currentUserId },
      });

      // Für Gruppenchats
      if (chatroom.isGroupChat) {
        const isAdmin = chatroom.admins.some(
          (admin) => admin._id.toString() === currentUserId
        );
        const isCreator = chatroom.creator._id.toString() === currentUserId;

        return res.json({
          chatroomMessages,
          currentUsername,
          unreadMessagesCount,
          volume,
          isGroupChat: true,
          groupInfo: {
            id: chatroom._id,
            name: chatroom.groupName,
            description: chatroom.groupDescription,
            image: chatroom.groupImage,
            creator: chatroom.creator,
            memberCount: chatroom.users.length,
            lastActivity: chatroom.lastActivity,
          },
          members: chatroom.users,
          admins: chatroom.admins,
          userPermissions: {
            isAdmin,
            isCreator,
            canInvite: isAdmin,
            canRemoveMembers: isAdmin,
            canEditGroup: isAdmin,
            canPromoteMembers: isCreator,
          },
        });
      }

      // Für normale Chats (bestehende Logik)
      const partnerId = chatroom.users.find(
        (user) => user._id.toString() !== currentUserId.toString()
      );

      if (!partnerId) {
        const partnerName = "deletedUser";
        return res.json({
          chatroomMessages,
          currentUsername,
          partnerName,
          unreadMessagesCount,
          volume,
          isGroupChat: false,
        });
      }

      const partner = await User.findById(partnerId._id);
      if (!partner) {
        const partnerName = "deletedUser";
        return res.json({
          chatroomMessages,
          currentUsername,
          partnerName,
          unreadMessagesCount,
          volume,
          isGroupChat: false,
        });
      }

      const partnerName = partner.username;

      res.json({
        chatroomMessages,
        currentUsername,
        partnerName,
        unreadMessagesCount,
        volume,
        isGroupChat: false,
      });
    } catch (error) {
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  return router;
};
