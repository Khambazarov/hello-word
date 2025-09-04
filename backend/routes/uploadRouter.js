import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../cloudinary.js";
import Chatroom from "../models/chatroomSchema.js";
import Message from "../models/messageSchema.js";

const router = express.Router();

// Cloudinary Storage
const storageImage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "image",
    public_id: (req, file) => file.originalname,
    transformation: [
      { quality: "auto", fetch_format: "auto" },
      { width: 300, height: 300, crop: "pad" },
    ],
  },
});

const uploadImage = multer({ storage: storageImage });

router.post("/image", uploadImage.single("image"), async (req, res) => {
  try {
    res.json({ url: req.file.path });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// Cloudinary Storage für Gruppenbilder
const storageGroupImage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "group-images",
    public_id: (req, file) => `group-${Date.now()}`,
    transformation: [
      { quality: "auto", fetch_format: "auto" },
      { width: 200, height: 200, crop: "fill", gravity: "center" },
    ],
  },
});

const uploadGroupImage = multer({ storage: storageGroupImage });

router.post(
  "/group-image/:groupId",
  uploadGroupImage.single("groupImage"),
  async (req, res) => {
    try {
      const { groupId } = req.params;
      const currentUserId = req.session.user?.id;

      if (!currentUserId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const groupChat = await Chatroom.findById(groupId);
      if (!groupChat || !groupChat.isGroupChat) {
        return res.status(404).json({ error: "Group chat not found" });
      }

      // Prüfen ob User Admin ist
      const isAdmin = groupChat.admins.some(
        (adminId) => adminId.toString() === currentUserId
      );
      if (!isAdmin) {
        return res
          .status(403)
          .json({ error: "Only admins can change group image" });
      }

      // Gruppenbild aktualisieren
      groupChat.groupImage = req.file.path;
      groupChat.lastActivity = new Date();
      await groupChat.save();

      // System-Nachricht
      const systemMessage = await Message.create({
        content: `${req.session.user.username} updated the group image`,
        chatroom: groupChat._id,
        sender: currentUserId,
        isSystemMessage: true,
      });

      res.json({
        url: req.file.path,
        message: "Group image updated successfully",
      });
    } catch (error) {
      console.error("Error uploading group image:", error);
      res.status(500).json({ error: "Failed to upload group image" });
    }
  }
);

// Cloudinary Storage für Audio
const storageAudio = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "audio",
    resource_type: "video",
    public_id: (req, file) => `${Date.now()}`,
  },
});

const uploadAudio = multer({
  storage: storageAudio,
  limits: { fileSize: 10 * 1024 * 1024 }, // Maximal 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Nur Audio-Dateien sind erlaubt!"), false);
    }
  },
});

router.post("/audio", uploadAudio.single("audio"), async (req, res) => {
  try {
    res.json({ url: req.file.path });
  } catch (error) {
    console.error("Error uploading audio:", error);
    res.status(500).json({ error: "Failed to upload audio" });
  }
});

export default router;
