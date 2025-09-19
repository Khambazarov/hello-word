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

export default (io) => {
  /** GRUPPENCHAT ERSTELLEN */
  router.post("/create", async (req, res) => {
    try {
      const { groupName, groupDescription, initialMessage } = req.body;
      const currentUserId = req.session.user.id;

      if (!groupName || groupName.trim() === "") {
        return res.status(400).json({ errorMessage: "Group name is required" });
      }

      if (groupName.length > 50) {
        return res
          .status(400)
          .json({ errorMessage: "Group name too long (max 50 characters)" });
      }

      const existingGroup = await Chatroom.findOne({
        isGroupChat: true,
        groupName: groupName.trim(),
      });
      if (existingGroup) {
        return res.status(400).json({
          errorCode: "GROUP_EXISTS",
          errorMessage: "A group with this name already exists",
        });
      }

      if (groupDescription && groupDescription.length > 200) {
        return res.status(400).json({
          errorMessage: "Group description too long (max 200 characters)",
        });
      }

      const newGroupChat = await Chatroom.create({
        isGroupChat: true,
        groupName: groupName.trim(),
        groupDescription: groupDescription?.trim() || "",
        owner: currentUserId,
        admins: [currentUserId],
        users: [currentUserId],
        lastSeen: new Map([[currentUserId.toString(), new Date()]]),
        lastActivity: new Date(),
      });

      // Erste Willkommensnachricht senden
      if (initialMessage && initialMessage.trim() !== "") {
        const welcomeMessage = await Message.create({
          content: initialMessage.trim(),
          chatroom: newGroupChat._id,
          sender: currentUserId,
        });

        // Socket-Event für neue Nachricht
        io.emit("message", welcomeMessage);
      }

      res.status(201).json({
        message: "Group chat created successfully",
        groupChatId: newGroupChat._id,
        groupChat: newGroupChat,
      });
    } catch (error) {
      console.error("Error creating group chat:", error);
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  /** BENUTZER ZUM GRUPPENCHAT EINLADEN */
  router.post("/:groupId/invite", async (req, res) => {
    try {
      const { groupId } = req.params;
      const { usernames } = req.body; // Array von Benutzernamen
      const currentUserId = req.session.user.id;

      const groupChat = await Chatroom.findById(groupId);
      if (!groupChat || !groupChat.isGroupChat) {
        return res.status(404).json({ errorMessage: "Group chat not found" });
      }

      // Prüfen ob User Admin ist
      const isAdmin = groupChat.admins.some(
        (adminId) => adminId.toString() === currentUserId
      );
      if (!isAdmin) {
        return res
          .status(403)
          .json({ errorMessage: "Only admins can invite users" });
      }

      if (!Array.isArray(usernames) || usernames.length === 0) {
        return res
          .status(400)
          .json({ errorMessage: "Please provide usernames to invite" });
      }

      const usersToInvite = await User.find({ username: { $in: usernames } });

      if (usersToInvite.length === 0) {
        return res.status(404).json({ errorMessage: "No valid users found" });
      }

      const newUserIds = usersToInvite
        .map((user) => user._id)
        .filter((userId) => !groupChat.users.includes(userId));

      if (newUserIds.length === 0) {
        return res
          .status(400)
          .json({ errorMessage: "All users are already in the group" });
      }

      // User zur Gruppe hinzufügen
      groupChat.users.push(...newUserIds);

      // LastSeen für neue User setzen
      newUserIds.forEach((userId) => {
        groupChat.lastSeen.set(userId.toString(), new Date());
      });

      groupChat.lastActivity = new Date();
      await groupChat.save();

      // System-Nachricht über neue Mitglieder
      const invitedUsernames = usersToInvite.map((user) => user.username);
      const systemMessage = await Message.create({
        content: `${req.session.user.username} has invited ${invitedUsernames.join(", ")} to the group`,
        chatroom: groupChat._id,
        sender: currentUserId,
        isSystemMessage: true,
      });

      // Socket-Events
      io.to(groupId).emit("message", systemMessage);
      io.emit("group-member-added", {
        groupId,
        newMembers: usersToInvite,
        invitedBy: req.session.user.username,
      });

      res.json({
        message: "Users invited successfully",
        invitedUsers: invitedUsernames,
        groupChat,
      });
    } catch (error) {
      console.error("Error inviting users to group:", error);
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  /** GRUPPENCHAT-MITGLIEDER ABRUFEN */
  router.get("/:groupId/members", async (req, res) => {
    try {
      const { groupId } = req.params;
      const currentUserId = req.session.user.id;

      const groupChat = await Chatroom.findById(groupId)
        .populate("users", "username email avatar createdAt")
        .populate("admins", "username avatar")
        .populate("owner", "username avatar");

      if (!groupChat || !groupChat.isGroupChat) {
        return res.status(404).json({ errorMessage: "Group chat not found" });
      }

      // Prüfen ob User Mitglied der Gruppe ist
      const isMember = groupChat.users.some(
        (user) => user._id.toString() === currentUserId
      );
      if (!isMember) {
        return res.status(403).json({ errorMessage: "Access denied" });
      }

      res.json({
        groupInfo: {
          id: groupChat._id,
          name: groupChat.groupName,
          description: groupChat.groupDescription,
          image: groupChat.groupImage,
          owner: groupChat.owner,
          createdAt: groupChat.createdAt,
          lastActivity: groupChat.lastActivity,
        },
        members: groupChat.users,
        admins: groupChat.admins,
        memberCount: groupChat.users.length,
      });
    } catch (error) {
      console.error("Error fetching group members:", error);
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  /** ADMIN-RECHTE VERGEBEN */
  router.patch("/:groupId/promote", async (req, res) => {
    try {
      const { groupId } = req.params;
      const { username } = req.body;
      const currentUserId = req.session.user.id;

      const groupChat = await Chatroom.findById(groupId);
      if (!groupChat || !groupChat.isGroupChat) {
        return res.status(404).json({ errorMessage: "Group chat not found" });
      }

      // Nur owner kann Admins ernennen
      if (groupChat.owner.toString() !== currentUserId) {
        return res.status(403).json({
          errorMessage: "Only the owner can promote members to admin",
        });
      }

      const userToPromote = await User.findOne({ username });
      if (!userToPromote) {
        return res.status(404).json({ errorMessage: "User not found" });
      }

      // Prüfen ob User Mitglied ist
      const isMember = groupChat.users.includes(userToPromote._id);
      if (!isMember) {
        return res
          .status(400)
          .json({ errorMessage: "User is not a member of this group" });
      }

      // Prüfen ob User bereits Admin ist
      const isAlreadyAdmin = groupChat.admins.includes(userToPromote._id);
      if (isAlreadyAdmin) {
        return res
          .status(400)
          .json({ errorMessage: "User is already an admin" });
      }

      groupChat.admins.push(userToPromote._id);
      groupChat.lastActivity = new Date();
      await groupChat.save();

      const systemMessage = await Message.create({
        content: `${userToPromote.username} has been promoted to admin by ${req.session.user.username}`,
        chatroom: groupChat._id,
        sender: currentUserId,
        isSystemMessage: true,
      });

      io.to(groupId).emit("message", systemMessage);
      io.to(groupId).emit("admin-promoted", {
        groupId,
        promotedUser: userToPromote.username,
        promotedBy: req.session.user.username,
      });

      res.json({
        message: "User promoted to admin successfully",
        newAdmin: userToPromote.username,
      });
    } catch (error) {
      console.error("Error promoting user to admin:", error);
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  /** ADMIN ZU MITGLIED DEGRADIEREN */
  router.patch("/:groupId/demote", async (req, res) => {
    try {
      const { groupId } = req.params;
      const { username } = req.body;
      const currentUserId = req.session.user.id;

      if (!username) {
        return res.status(400).json({ errorMessage: "Username is required" });
      }

      const groupChat = await Chatroom.findById(groupId);
      if (!groupChat || !groupChat.isGroupChat) {
        return res.status(404).json({ errorMessage: "Group chat not found" });
      }

      // Nur owner kann Admins degradieren
      const isOwner = groupChat.owner.toString() === currentUserId;
      if (!isOwner) {
        return res.status(403).json({
          errorMessage: "Only the group owner can demote admins",
        });
      }

      const userToDemote = await User.findOne({ username });
      if (!userToDemote) {
        return res.status(404).json({ errorMessage: "User not found" });
      }

      // Prüfen ob User ein Admin ist
      const isAdmin = groupChat.admins.some(
        (adminId) => adminId.toString() === userToDemote._id.toString()
      );
      if (!isAdmin) {
        return res.status(400).json({
          errorMessage: "User is not an admin",
        });
      }

      // Owner kann sich nicht selbst degradieren
      if (userToDemote._id.toString() === groupChat.owner.toString()) {
        return res.status(400).json({
          errorMessage: "Cannot demote the group owner",
        });
      }

      // User aus Admins entfernen
      groupChat.admins = groupChat.admins.filter(
        (adminId) => adminId.toString() !== userToDemote._id.toString()
      );
      await groupChat.save();

      // System-Nachricht erstellen
      const systemMessage = await Message.create({
        content: `${userToDemote.username} has been demoted to member by ${req.session.user.username}`,
        sender: null,
        chatroom: groupId,
        isSystemMessage: true,
        timestamp: new Date(),
      });

      io.to(groupId).emit("message", systemMessage);
      io.to(groupId).emit("admin-demoted", {
        groupId,
        demotedUser: userToDemote.username,
        demotedBy: req.session.user.username,
      });

      res.json({
        message: "Admin demoted to member successfully",
        demotedAdmin: userToDemote.username,
      });
    } catch (error) {
      console.error("Error demoting admin:", error);
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  /** MITGLIED ENTFERNEN */
  router.delete("/:groupId/members/:username", async (req, res) => {
    try {
      const { groupId, username } = req.params;
      const currentUserId = req.session.user.id;

      const groupChat = await Chatroom.findById(groupId);
      if (!groupChat || !groupChat.isGroupChat) {
        return res.status(404).json({ errorMessage: "Group chat not found" });
      }

      const userToRemove = await User.findOne({ username });
      if (!userToRemove) {
        return res.status(404).json({ errorMessage: "User not found" });
      }

      // Prüfen ob aktueller User Admin ist
      const isAdmin = groupChat.admins.some(
        (adminId) => adminId.toString() === currentUserId
      );
      if (!isAdmin) {
        return res
          .status(403)
          .json({ errorMessage: "Only admins can remove members" });
      }

      // Owner kann nicht entfernt werden
      if (userToRemove._id.toString() === groupChat.owner.toString()) {
        return res
          .status(400)
          .json({ errorMessage: "Cannot remove the group owner" });
      }

      // User aus Gruppe entfernen
      groupChat.users = groupChat.users.filter(
        (userId) => userId.toString() !== userToRemove._id.toString()
      );
      groupChat.admins = groupChat.admins.filter(
        (adminId) => adminId.toString() !== userToRemove._id.toString()
      );

      // LastSeen entfernen
      groupChat.lastSeen.delete(userToRemove._id.toString());

      groupChat.lastActivity = new Date();
      await groupChat.save();

      const systemMessage = await Message.create({
        content: `${userToRemove.username} has been removed from the group by ${req.session.user.username}`,
        chatroom: groupChat._id,
        sender: currentUserId,
        isSystemMessage: true,
      });

      io.to(groupId).emit("message", systemMessage);
      io.to(groupId).emit("member-removed", {
        groupId,
        removedUser: userToRemove.username,
        removedBy: req.session.user.username,
      });

      res.json({
        message: "User removed from group successfully",
        removedUser: userToRemove.username,
      });
    } catch (error) {
      console.error("Error removing user from group:", error);
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  /** GRUPPENCHAT VERLASSEN */
  router.post("/:groupId/leave", async (req, res) => {
    try {
      const { groupId } = req.params;
      const currentUserId = req.session.user.id;

      const groupChat = await Chatroom.findById(groupId);
      if (!groupChat || !groupChat.isGroupChat) {
        return res.status(404).json({ errorMessage: "Group chat not found" });
      }

      // Prüfen ob User Mitglied ist
      const isMember = groupChat.users.some(
        (userId) => userId.toString() === currentUserId
      );
      if (!isMember) {
        return res
          .status(400)
          .json({ errorMessage: "You are not a member of this group" });
      }

      // Owner kann nicht verlassen (muss Gruppe löschen)
      if (groupChat.owner.toString() === currentUserId) {
        return res.status(400).json({
          errorMessage:
            "Group owner cannot leave. Transfer ownership or delete the group instead.",
        });
      }

      // User aus Gruppe entfernen
      groupChat.users = groupChat.users.filter(
        (userId) => userId.toString() !== currentUserId
      );
      groupChat.admins = groupChat.admins.filter(
        (adminId) => adminId.toString() !== currentUserId
      );
      groupChat.lastSeen.delete(currentUserId);
      groupChat.lastActivity = new Date();
      await groupChat.save();

      const systemMessage = await Message.create({
        content: `${req.session.user.username} has left the group`,
        chatroom: groupChat._id,
        sender: currentUserId,
        isSystemMessage: true,
      });

      io.to(groupId).emit("message", systemMessage);
      io.to(groupId).emit("member-left", {
        groupId,
        leftUser: req.session.user.username,
      });

      res.json({
        message: "Successfully left the group",
      });
    } catch (error) {
      console.error("Error leaving group:", error);
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  /** GRUPPENCHAT BEARBEITEN */
  router.patch("/:groupId/edit", async (req, res) => {
    try {
      const { groupId } = req.params;
      const { groupName, groupDescription } = req.body;
      const currentUserId = req.session.user.id;

      const groupChat = await Chatroom.findById(groupId);
      if (!groupChat || !groupChat.isGroupChat) {
        return res.status(404).json({ errorMessage: "Group chat not found" });
      }

      // Nur Admins können Gruppe bearbeiten
      const isAdmin = groupChat.admins.some(
        (adminId) => adminId.toString() === currentUserId
      );
      if (!isAdmin) {
        return res
          .status(403)
          .json({ errorMessage: "Only admins can edit group details" });
      }

      const updates = {};
      let changeMessage = "";

      if (groupName && groupName.trim() !== groupChat.groupName) {
        if (groupName.length > 50) {
          return res
            .status(400)
            .json({ errorMessage: "Group name too long (max 50 characters)" });
        }
        updates.groupName = groupName.trim();
        changeMessage += `Group name changed to "${groupName.trim()}"`;
      }

      if (
        groupDescription !== undefined &&
        groupDescription.trim() !== groupChat.groupDescription
      ) {
        if (groupDescription.length > 200) {
          return res.status(400).json({
            errorMessage: "Group description too long (max 200 characters)",
          });
        }
        updates.groupDescription = groupDescription.trim();
        if (changeMessage) changeMessage += ", ";
        changeMessage += "Group description updated";
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ errorMessage: "No changes to update" });
      }

      updates.lastActivity = new Date();
      await Chatroom.findByIdAndUpdate(groupId, updates);

      const systemMessage = await Message.create({
        content: `${req.session.user.username} updated group: ${changeMessage}`,
        chatroom: groupChat._id,
        sender: currentUserId,
        isSystemMessage: true,
      });

      io.to(groupId).emit("message", systemMessage);
      io.to(groupId).emit("group-updated", {
        groupId,
        updates,
        updatedBy: req.session.user.username,
      });

      res.json({
        message: "Group updated successfully",
        updates,
      });
    } catch (error) {
      console.error("Error updating group:", error);
      res.status(500).json({ errorMessage: "Internal server error" });
    }
  });

  return router;
};
