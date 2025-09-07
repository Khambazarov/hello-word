import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../cloudinary.js";
import Chatroom from "../models/chatroomSchema.js";
import Message from "../models/messageSchema.js";
import User from "../models/userSchema.js";

const router = express.Router();

// Cloudinary Storage
const storageImage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "image",
    public_id: (req, file) => `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    transformation: [
      { quality: "auto", fetch_format: "auto" },
      { width: 300, height: 300, crop: "pad" },
    ],
  },
});

const uploadImage = multer({ storage: storageImage });

router.post("/image", uploadImage.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }
    
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
    resource_type: "auto", // Changed from "video" to "auto" for better compatibility
    public_id: (req, file) => `audio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    allowed_formats: ["mp3", "wav", "ogg", "m4a", "aac", "webm"], // Specify allowed audio formats
  },
});

const uploadAudio = multer({
  storage: storageAudio,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", 
      "audio/m4a", "audio/aac", "audio/webm", "audio/mp4"
    ];
    
    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported audio format: ${file.mimetype}`), false);
    }
  },
});

router.post("/audio", uploadAudio.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    if (!req.file.path) {
      return res.status(500).json({ error: "Upload failed - no file URL generated" });
    }
    
    res.json({ url: req.file.path });
  } catch (error) {
    console.error("Error uploading audio:", error);
    
    if (error.message && error.message.includes("Unsupported audio format")) {
      return res.status(400).json({ error: "Unsupported audio format" });
    }
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: "File too large - maximum 10MB" });
    }
    
    res.status(500).json({ error: "Failed to upload audio" });
  }
});

// Cloudinary Storage für User-Avatare
const storageUserAvatar = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user-avatars",
    public_id: (req, file) => `user-${req.session.user?.id}-${Date.now()}`,
    transformation: [
      { quality: "auto", fetch_format: "auto" },
      { width: 200, height: 200, crop: "fill", gravity: "center" },
    ],
  },
});

const uploadUserAvatar = multer({ storage: storageUserAvatar });

router.post(
  "/user-avatar",
  uploadUserAvatar.single("avatar"),
  async (req, res) => {
    try {
      const currentUserId = req.session.user?.id;

      if (!currentUserId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No avatar file provided" });
      }

      // Update user's avatar in database
      const updatedUser = await User.findByIdAndUpdate(
        currentUserId,
        { avatar: req.file.path },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        message: "Avatar updated successfully",
        avatarUrl: req.file.path,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error uploading user avatar:", error);
      res.status(500).json({ error: "Failed to upload avatar" });
    }
  }
);

export default router;
