const express = require("express");
const http = require("http");
const cors = require9("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
    cors: {
        origin: "*",  //allow frontend url
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("send_message", (data) => {
        io.emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(3001, () => {
    console.log("Server is running on port 3001");
});

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/chatapp", {useNewUrlParser: true});

const Message = mongoose.model("Message", {
    text: String,
    timestamp: { type: Date, default: Date.now }
});

socket.on("send_message", async (data) => {
    const message = new Message({text: data.text });
    await message.save();
    io.emit("receive_message", data);
});