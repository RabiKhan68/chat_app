const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors());

// 🔌 Connect to MongoDB
mongoose.connect("mongodb+srv://inspirationtech4:fIrPdWccXchyUPfC@cluster1234.usjdqo3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1234", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 🧠 Define Schema
const MessageSchema = new mongoose.Schema({
  text: String,
  sender: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", MessageSchema);

// 🎯 Handle Socket Connections
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  console.log("✅ User connected:", socket.id);

  const messages = await Message.find().sort({ timestamp: 1 }).limit(50);
messages.forEach((msg) => {
  socket.emit("receive_message", {
    text: msg.text,
    sender: msg.sender,
  });
});

  // 🔽 2. Handle new messages from this user
  socket.on("send_message", async (data) => {
    const newMsg = new Message({ text: data.text, sender: data.sender });
    await newMsg.save();
    console.log("✅ Message saved:", newMsg);

    io.emit("receive_message", data); // Broadcast to everyone
  });

  // 🔽 3. Optional: handle disconnect
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
