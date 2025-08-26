import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, required: true, default: false },
    verificationKey: {
      type: String,
      default: () =>
        Math.floor(Math.random() * 1_000_000 + 1)
          .toString()
          .padStart(6, "0"),
    },
    key: { type: String },
    volume: { type: String, default: "middle" },
    language: {
      type: String,
      enum: ["en", "de"],
      default: "en",
    },
    // status: {
    //   type: String,
    //   required: true,
    //   enum: ["Online", "Offline"],
    //   default: "Offline",
    // },
  },
  { timestamps: true }
);

// Method for whitelisting fields in the JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  const allowedFields = ["_id", "email", "username", "createdAt", "updatedAt"];
  const filteredUser = {};

  allowedFields.forEach((field) => {
    if (user[field] !== undefined) {
      filteredUser[field] = user[field];
    }
  });

  return filteredUser;
};

const User = model("User", userSchema);
export default User;
