const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const chat = require("./chat.models.js");
const { Server } = require("socket.io");

const chatwriteController = async (roomid, senderid, receiverid, message) => {
  try {
    const chatresult = await chat.create({
      roomId: roomid,
      senderId: senderid,
      receiverId: receiverid,
      message: message,
    });
    console.log(chatresult);

    // Emit event to notify clients about the new message
    await io.to(roomid).emit("newMessage", chatresult);

    return "Message sent successfully";
  } catch (err) {
    console.log(err);
    return "An error occurred in chat write";
  }
};

const chatreadController = async (roomid, senderid, receiverid, index, offset) => {
  try {
    const messages = await chat
      .find({
        roomId: roomid,
        //senderId: senderid,
        //receiverId: receiverid
      })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(index)
      .exec();

    return messages;
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while fetching the latest messages");
  }
};

const app = express();
app.use(express.json());

const port = 3000;

// Create HTTP server
const server = http.createServer(app);

// Set up socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this as needed for your setup
  },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Write chat with specific roomid
app.post("/chat/:senderId/:receiverId/:roomId", async (req, res) => {
  console.log(req.params);
  console.log(req.body);

  try {
    const chatResponse = await chatwriteController(
      req.params.roomId,
      req.params.senderId,
      req.params.receiverId,
      req.body.message
    );
    res.json({ response: chatResponse });
  } catch (error) {
    res.status(500).json({ response: "An error occurred in response" });
  }
});

// Read chat messages with pagination
app.get("/chat/:index/:offset/:senderId/:receiverId/:roomId", async (req, res) => {
  console.log(req.params);
  try {
    const chatResponse = await chatreadController(
      req.params.roomId,
      req.params.senderId,
      req.params.receiverId,
      parseInt(req.params.index),
      parseInt(req.params.offset)
    );
    res.json({ response: chatResponse });
  } catch (error) {
    res.status(500).json({ response: "An error occurred in response" });
  }
});

// Handle socket connections
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

mongoose
  .connect(
    "your mongo link"
  )
  .then(() => {
    server.listen(port, () => {
      console.log(`http://localhost:${port}`);
    });
  });
