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

      // Suche nur nach direkten 1-zu-1 Chats (nicht nach Gruppenchats)
      const chatroomExists = await Chatroom.findOne({
        users: { $all: [user._id, currentUserId] },
        $expr: { $eq: [{ $size: "$users" }, 2] }, // Nur Chats mit genau 2 Benutzern
        isGroupChat: { $ne: true }, // Explizit ausschließen von Gruppenchats
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
      const currentUserAvatar = currentUser.avatar;

      // ✅ VERBESSERUNG: Frische Daten ohne Cache laden
      const allChats = await Chatroom.find({ users: currentUserId })
        .populate({
          path: "users",
          select: "username email avatar",
          options: { lean: false }, // Verhindert Mongoose-Caching
        })
        .populate("creator", "username avatar")
        .populate("admins", "username avatar")
        .lean(false); // Verhindert Lean-Modus für frische Daten

      if (!allChats || allChats.length === 0) {
        return res.json({
          chatrooms: [],
          currentUsername,
          currentUserAvatar,
          volume,
        });
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

          // Partner-Avatar für 1-zu-1 Chats - KOMPLETT NEU: Immer frisch laden
          const partner = chat.users.find(
            (user) =>
              user.username !== currentUsername &&
              user._id.toString() !== currentUserId.toString()
          );

          // ✅ LÖSUNG: Avatar IMMER frisch aus DB laden, nie auf populate vertrauen
          let partnerAvatar = null;
          if (partner && partner._id) {
            const freshPartner = await User.findById(partner._id).select(
              "avatar"
            );
            partnerAvatar = freshPartner?.avatar || null;
          }

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
            partnerAvatar,
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

      res.json({
        chatrooms: sortedChatrooms,
        currentUsername,
        currentUserAvatar,
        volume,
      });
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
        .populate("users", "username email avatar")
        .populate("creator", "username avatar")
        .populate("admins", "username avatar");

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

      const chatroomMessages = await Message.find({ chatroom: id })
        .populate("sender")
        .populate("editSeenBy", "username avatar"); // Populate users who have seen edits

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
          currentUserId,
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
          partnerAvatar: null,
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
          currentUserId,
          partnerName,
          partnerAvatar: null,
          unreadMessagesCount,
          volume,
          isGroupChat: false,
        });
      }

      const partnerName = partner.username;
      const partnerAvatar = partner.avatar;

      res.json({
        chatroomMessages,
        currentUsername,
        currentUserId,
        partnerName,
        partnerAvatar,
        unreadMessagesCount,
        volume,
        isGroupChat: false,
      });
    } catch (error) {
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  // INVITE USERS TO GROUP
  router.post("/groupchats/:id/invite", async (req, res) => {
    try {
      const { id } = req.params;
      const { usernames } = req.body;
      const currentUserId = req.session.user.id;

      if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
        return res
          .status(400)
          .json({ errorMessage: "Invalid usernames provided" });
      }

      const chatroom = await Chatroom.findById(id)
        .populate("users", "username avatar")
        .populate("admins", "username avatar");

      if (!chatroom) {
        return res.status(404).json({ errorMessage: "Chatroom not found" });
      }

      if (!chatroom.isGroupChat) {
        return res.status(400).json({ errorMessage: "Not a group chat" });
      }

      // Check if user has permission to invite (is admin or creator)
      const isCreator = chatroom.creator.toString() === currentUserId;
      const isAdmin = chatroom.admins.some(
        (admin) => admin._id.toString() === currentUserId
      );

      if (!isCreator && !isAdmin) {
        return res.status(403).json({
          errorMessage: "No permission to invite users",
        });
      }

      const usersToInvite = await User.find({
        username: { $in: usernames },
      });

      if (usersToInvite.length === 0) {
        return res.status(404).json({ errorMessage: "No valid users found" });
      }

      const existingMemberIds = chatroom.users.map((user) =>
        user._id.toString()
      );
      const newMembers = usersToInvite.filter(
        (user) => !existingMemberIds.includes(user._id.toString())
      );

      if (newMembers.length === 0) {
        return res.status(400).json({
          errorMessage: "All users are already members of this group",
        });
      }

      // Add new members to the group
      chatroom.users.push(...newMembers.map((user) => user._id));
      await chatroom.save();

      const invitedUsers = newMembers.map((user) => user.username);

      res.json({
        success: true,
        message: `Successfully invited ${invitedUsers.length} user(s)`,
        invitedUsers,
        newMemberCount: chatroom.users.length,
      });
    } catch (error) {
      console.error("Error inviting users to group:", error);
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  // GET GROUP MEMBERS
  router.get("/groupchats/:id/members", async (req, res) => {
    try {
      const { id } = req.params;
      const currentUserId = req.session.user.id;

      const chatroom = await Chatroom.findById(id)
        .populate("users", "username email avatar")
        .populate("creator", "username avatar")
        .populate("admins", "username avatar");

      if (!chatroom) {
        return res.status(404).json({ errorMessage: "Chatroom not found" });
      }

      if (!chatroom.isGroupChat) {
        return res.status(400).json({ errorMessage: "Not a group chat" });
      }

      // Check if user is a member
      const isMember = chatroom.users.some(
        (user) => user._id.toString() === currentUserId
      );
      if (!isMember) {
        return res.status(403).json({ errorMessage: "Access denied" });
      }

      const isCreator = chatroom.creator._id.toString() === currentUserId;
      const isAdmin = chatroom.admins.some(
        (admin) => admin._id.toString() === currentUserId
      );

      res.json({
        groupInfo: {
          id: chatroom._id,
          name: chatroom.groupName,
          description: chatroom.groupDescription,
          image: chatroom.groupImage,
          creator: chatroom.creator,
          memberCount: chatroom.users.length,
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
    } catch (error) {
      console.error("Error fetching group members:", error);
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  // UPDATE GROUP DESCRIPTION
  router.patch("/groups/:id/description", async (req, res) => {
    try {
      const { id } = req.params;
      const { description } = req.body;
      const currentUserId = req.session.user.id;

      // Find the chatroom and check if it's a group chat
      const chatroom = await Chatroom.findById(id);
      if (!chatroom) {
        return res.status(404).json({ errorMessage: "Chatroom not found" });
      }

      if (!chatroom.isGroupChat) {
        return res.status(400).json({ errorMessage: "Not a group chat" });
      }

      // Check if user has permission to edit (is admin or creator)
      const isCreator =
        chatroom.creator && chatroom.creator.toString() === currentUserId;
      const isAdmin =
        chatroom.admins && chatroom.admins.includes(currentUserId);

      if (!isCreator && !isAdmin) {
        return res.status(403).json({
          errorMessage: "No permission to edit group description",
        });
      }

      // Update the group description
      chatroom.groupDescription = description.trim();
      await chatroom.save();

      res.json({
        success: true,
        message: "Group description updated successfully",
        description: chatroom.groupDescription,
      });
    } catch (error) {
      console.error("Error updating group description:", error);
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  // PROMOTE USER TO ADMIN
  router.patch("/groupchats/:id/promote", async (req, res) => {
    try {
      const { id } = req.params;
      const { username } = req.body;
      const currentUserId = req.session.user.id;

      if (!username) {
        return res.status(400).json({ errorMessage: "Username is required" });
      }

      const chatroom = await Chatroom.findById(id)
        .populate("users", "username avatar")
        .populate("admins", "username avatar");

      if (!chatroom) {
        return res.status(404).json({ errorMessage: "Chatroom not found" });
      }

      if (!chatroom.isGroupChat) {
        return res.status(400).json({ errorMessage: "Not a group chat" });
      }

      // Only creator can promote users
      const isCreator = chatroom.creator.toString() === currentUserId;
      if (!isCreator) {
        return res.status(403).json({
          errorMessage: "Only the group creator can promote users",
        });
      }

      // Find the user to promote
      const userToPromote = await User.findOne({ username });
      if (!userToPromote) {
        return res.status(404).json({ errorMessage: "User not found" });
      }

      // Check if user is a member of the group
      const isMember = chatroom.users.some(
        (user) => user._id.toString() === userToPromote._id.toString()
      );
      if (!isMember) {
        return res.status(400).json({
          errorMessage: "User is not a member of this group",
        });
      }

      // Check if user is already an admin
      const isAlreadyAdmin = chatroom.admins.some(
        (admin) => admin._id.toString() === userToPromote._id.toString()
      );
      if (isAlreadyAdmin) {
        return res.status(400).json({
          errorMessage: "User is already an admin",
        });
      }

      // Check if trying to promote the creator
      if (userToPromote._id.toString() === chatroom.creator.toString()) {
        return res.status(400).json({
          errorMessage: "Cannot promote the group creator",
        });
      }

      // Promote the user
      chatroom.admins.push(userToPromote._id);
      await chatroom.save();

      res.json({
        success: true,
        message: "User promoted to admin successfully",
        newAdmin: username,
      });
    } catch (error) {
      console.error("Error promoting user:", error);
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  // DELETE GROUP CHAT
  router.delete("/groupchats/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const currentUserId = req.session.user.id;

      const chatroom = await Chatroom.findById(id);
      if (!chatroom) {
        return res.status(404).json({ errorMessage: "Chatroom not found" });
      }

      if (!chatroom.isGroupChat) {
        return res.status(400).json({ errorMessage: "Not a group chat" });
      }

      // Only creator can delete the group
      const isCreator = chatroom.creator.toString() === currentUserId;
      if (!isCreator) {
        return res.status(403).json({
          errorMessage: "Only the group creator can delete this group",
        });
      }

      // Delete all messages in the group
      await Message.deleteMany({ chatroom: id });

      // Delete the group
      await Chatroom.findByIdAndDelete(id);

      res.json({
        success: true,
        message: "Group chat deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting group chat:", error);
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  // DELETE DIRECT CHAT
  router.delete("/chats/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const currentUserId = req.session.user.id;

      const chatroom = await Chatroom.findById(id);
      if (!chatroom) {
        return res.status(404).json({ errorMessage: "Chatroom not found" });
      }

      if (chatroom.isGroupChat) {
        return res
          .status(400)
          .json({
            errorMessage: "Use group chat deletion endpoint for group chats",
          });
      }

      // Check if user is a participant in this chat
      const isParticipant = chatroom.users.some(
        (userId) => userId.toString() === currentUserId
      );
      if (!isParticipant) {
        return res.status(403).json({ errorMessage: "Access denied" });
      }

      // Delete all messages in the chat
      await Message.deleteMany({ chatroom: id });

      // Delete the chat
      await Chatroom.findByIdAndDelete(id);

      res.json({
        success: true,
        message: "Chat deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  return router;
};
