import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../cloudinary.js";

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
