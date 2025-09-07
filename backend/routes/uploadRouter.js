import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../cloudinary.js";
import Chatroom from "../models/chatroomSchema.js";
import Message from "../models/messageSchema.js";
import User from "../models/userSchema.js";

const router = express.Router();

// Debug endpoint to check Cloudinary configuration
router.get("/debug/config", (req, res) => {
  try {
    const config = {
      hasCloudName: !!process.env.CLOUD_NAME,
      hasApiKey: !!process.env.CLOUD_API_KEY,
      hasApiSecret: !!process.env.CLOUD_API_SECRET,
      nodeEnv: process.env.NODE_ENV,
      sessionExists: !!req.session,
      userLoggedIn: !!req.session?.user,
      cloudinaryConfig: {
        cloud_name: cloudinary.config().cloud_name,
        api_key: cloudinary.config().api_key ? "SET" : "MISSING"
      }
    };
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint for Cloudinary connectivity
router.get("/debug/test-cloudinary", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json({ success: true, message: "Cloudinary connection successful", result });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Cloudinary connection failed", 
      error: error.message,
      details: error
    });
  }
});

// Debug endpoint for audio format testing
router.get("/debug/audio-formats", (req, res) => {
  try {
    const supportedFormats = {
      mimeTypes: [
        "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", 
        "audio/m4a", "audio/aac", "audio/webm", "audio/mp4"
      ],
      cloudinaryFormats: ["mp3", "wav", "ogg", "m4a", "aac", "webm"],
      maxFileSize: "10MB",
      resourceType: "auto"
    };
    
    res.json({
      message: "Supported audio formats",
      formats: supportedFormats,
      multerConfig: {
        limits: { fileSize: 10 * 1024 * 1024 },
        storageType: "CloudinaryStorage"
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware to check Cloudinary configuration
const checkCloudinaryConfig = (req, res, next) => {
  if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
    console.error("Missing Cloudinary configuration:", {
      CLOUD_NAME: !!process.env.CLOUD_NAME,
      CLOUD_API_KEY: !!process.env.CLOUD_API_KEY,
      CLOUD_API_SECRET: !!process.env.CLOUD_API_SECRET,
    });
    return res.status(500).json({ error: "Server configuration error: Cloudinary not configured" });
  }
  next();
};

// Apply middleware to all upload routes
router.use(checkCloudinaryConfig);

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
    console.log("Image upload request received:", {
      fileReceived: !!req.file,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      sessionUser: req.session.user?.id
    });

    if (!req.file) {
      console.error("No image file provided in request");
      return res.status(400).json({ error: "No image file provided" });
    }
    
    console.log("Image upload successful:", req.file.path);
    res.json({ url: req.file.path });
  } catch (error) {
    console.error("Error uploading image:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      file: req.file,
    });
    res.status(500).json({ error: "Failed to upload image", details: error.message });
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
  limits: { fileSize: 10 * 1024 * 1024 }, // Maximal 10 MB
  fileFilter: (req, file, cb) => {
    console.log("Audio file filter check:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    // More comprehensive audio MIME type checking
    const allowedMimeTypes = [
      "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", 
      "audio/m4a", "audio/aac", "audio/webm", "audio/mp4"
    ];
    
    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      console.error("Rejected audio file:", file.mimetype);
      cb(new Error(`Unsupported audio format: ${file.mimetype}. Allowed formats: mp3, wav, ogg, m4a, aac, webm`), false);
    }
  },
});

router.post("/audio", uploadAudio.single("audio"), async (req, res) => {
  try {
    console.log("Audio upload request received:", {
      fileReceived: !!req.file,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      mimeType: req.file?.mimetype,
      sessionUser: req.session.user?.id,
      headers: {
        contentType: req.headers['content-type'],
        contentLength: req.headers['content-length']
      }
    });

    if (!req.file) {
      console.error("No audio file provided in request");
      return res.status(400).json({ 
        error: "No audio file provided",
        supportedFormats: ["mp3", "wav", "ogg", "m4a", "aac", "webm"],
        maxSize: "10MB"
      });
    }

    // Additional validation for audio files
    if (!req.file.path) {
      console.error("File uploaded but no Cloudinary path returned");
      return res.status(500).json({ error: "Upload successful but no file URL generated" });
    }
    
    console.log("Audio upload successful:", {
      url: req.file.path,
      size: req.file.size,
      format: req.file.format,
      resourceType: req.file.resource_type
    });
    
    res.json({ 
      url: req.file.path,
      success: true,
      fileInfo: {
        size: req.file.size,
        format: req.file.format || 'unknown',
        originalName: req.file.originalname
      }
    });
  } catch (error) {
    console.error("Error uploading audio:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null,
      multerError: error.field || error.storageErrors
    });
    
    // Handle specific error types
    if (error.message && error.message.includes("Unsupported audio format")) {
      return res.status(400).json({ 
        error: "Unsupported audio format", 
        details: error.message,
        supportedFormats: ["mp3", "wav", "ogg", "m4a", "aac", "webm"]
      });
    }
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: "File too large", 
        details: "Maximum file size is 10MB",
        maxSize: "10MB"
      });
    }
    
    res.status(500).json({ 
      error: "Failed to upload audio", 
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
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
        console.error("User not authenticated for avatar upload");
        return res.status(401).json({ error: "Not authenticated" });
      }

      if (!req.file) {
        console.error("No avatar file provided in request");
        return res.status(400).json({ error: "No avatar file provided" });
      }

      console.log("Avatar upload successful for user:", currentUserId);

      // Update user's avatar in database
      const updatedUser = await User.findByIdAndUpdate(
        currentUserId,
        { avatar: req.file.path },
        { new: true }
      );

      if (!updatedUser) {
        console.error("User not found in database:", currentUserId);
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        message: "Avatar updated successfully",
        avatarUrl: req.file.path,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error uploading user avatar:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        userId: req.session.user?.id,
        file: req.file,
      });
      res.status(500).json({ error: "Failed to upload avatar", details: error.message });
    }
  }
);

export default router;
