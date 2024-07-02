const express = require("express");
const mongoose = require("mongoose");
const chat = require("./chat.models.js");

const chatwriteController = async (roomid, senderid, receiverid, message) => {
  try {
    const chatresult = await chat.create({
      roomId: roomid,
      senderId: senderid,
      receiverId: receiverid,
      message: message,
    });
    console.log(chatresult);
    return "Message sent successfully";
  } catch (err) {
    console.log(err);
    return "An error occurred in chat write";
  }
};

const chatreadController = async (
  roomid,
  senderid,
  receiverid,
  index,
  offset
) => {
  try {
    const message = await chat
      .find({
        roomId: roomid,
        //senderId: senderid,
        //receiverId: receiverid
      })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(index)
      .exec();

    return message;
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while fetching the latest message");
  }
};

const app = express();
app.use(express.json());

const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// it only write chat with specific roomid
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

// it only reads the sender to reciver date
app.get(
  "/chat/:index/:offset/:senderId/:receiverId/:roomId",
  async (req, res) => {
    console.log(req.params);
    try {
      const chatResponse = await chatreadController(
        req.params.roomId,
        req.params.senderId,
        req.params.receiverId,
        req.params.index,
        req.params.offset
      );
      res.json({ response: chatResponse });
    } catch (error) {
      res.status(500).json({ response: "An error occurred in response" });
    }
  }
);

mongoose
  .connect(
    "your mongo link"
  )
  .then(() => {
    app.listen(port, () => {
      console.log(`http://localhost:${port}`);
    });
  });
