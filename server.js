const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

// 🔌 Express and HTTP setup
const app = express();
const server = http.createServer(app);

app.use(cors());

// 🌐 MongoDB Connection
mongoose.connect(
  "mongodb+srv://inspirationtech4:fIrPdWccXchyUPfC@cluster1234.usjdqo3.mongodb.net/chatdb?retryWrites=true&w=majority&appName=Cluster1234",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// 🧠 Mongoose Schema
const MessageSchema = new mongoose.Schema({
  text: String,
  sender: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", MessageSchema);

// 🎯 Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*", // Allow frontend
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  console.log("✅ User connected:", socket.id);

  // 🔄 Send last 50 messages to new user
  try {
    const messages = await Message.find().sort({ timestamp: 1 }).limit(50);
    messages.forEach((msg) => {
      socket.emit("receive_message", {
        text: msg.text,
        sender: msg.sender,
        timestamp: msg.timestamp,
      });
    });
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
  }

  // 📩 When new message received
  socket.on("send_message", async (data) => {
    try {
      const newMsg = new Message({
        text: data.text,
        sender: data.sender || "Anonymous",
      });
      await newMsg.save();

      io.emit("receive_message", {
        text: newMsg.text,
        sender: newMsg.sender,
        timestamp: newMsg.timestamp,
      });
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
  });
});

// 🚀 Start Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
