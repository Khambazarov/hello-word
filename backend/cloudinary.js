import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

console.log("Cloudinary Environment Check:", {
  CLOUD_NAME: process.env.CLOUD_NAME ? "✓ Set" : "✗ Missing",
  CLOUD_API_KEY: process.env.CLOUD_API_KEY ? "✓ Set" : "✗ Missing",
  CLOUD_API_SECRET: process.env.CLOUD_API_SECRET ? "✓ Set" : "✗ Missing",
  NODE_ENV: process.env.NODE_ENV
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Test Cloudinary connection
cloudinary.api.ping()
  .then(() => console.log("✓ Cloudinary connection successful"))
  .catch((error) => console.error("✗ Cloudinary connection failed:", error.message));

export default cloudinary;
