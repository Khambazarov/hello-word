import mongoose, { Types } from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/userSchema.js";
import Chatroom from "./models/chatroomSchema.js";
import Message from "./models/messageSchema.js";
import { connectDB } from "./db.js";

dotenv.config();

connectDB();

const seedDatabase = async () => {
  await mongoose.connection.dropDatabase();

  const hashedPassword = await bcrypt.hash("123456", 12);

  const users = [];
  for (let i = 1; i <= 5; i++) {
    const user = new User({
      email: `user${i}@mail.com`,
      username: `user${i}`,
      password: hashedPassword,
      isVerified: true,
    });
    users.push(user);
  }

  await User.insertMany(users);

  console.log("users: ", users);
  console.log("users: ", users.length);

  const chatrooms = [];
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length && j < i + 5; j++) {
      const chatroom = new Chatroom({
        users: [users[i]._id, users[j]._id],
        lastSeen: new Map([
          [users[i]._id.toString(), new Date(0)],
          [users[j]._id.toString(), new Date(0)],
        ]),
      });
      chatrooms.push(chatroom);
    }
  }

  await Chatroom.insertMany(chatrooms);

  console.log("chatrooms: ", chatrooms.length);

  const messages = [];
  for (let i = 0; i < users.length; i++) {
    const userChatrooms = chatrooms.filter((room) =>
      room.users.includes(users[i]._id)
    );

    for (let j = 0; j < 20; j++) {
      const chatroom =
        userChatrooms[Math.floor(Math.random() * userChatrooms.length)];
      const receiver = chatroom.users.find(
        (userId) => !userId.equals(users[i]._id)
      );

      const message = new Message({
        sender: users[i]._id,
        content: `Message ${j + 1} from user${i + 1} to user${
          users.findIndex((user) => user._id.equals(receiver)) + 1
        }!`,
        chatroom: chatroom._id,
      });
      messages.push(message);
    }
  }

  await Message.insertMany(messages);

  console.log("messages: ", messages.length);

  console.log("Database seeded!");
  mongoose.connection.close();
};

seedDatabase().catch((err) => {
  console.error(err);
  mongoose.connection.close();
});
