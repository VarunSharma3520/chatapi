const mongoose = require('mongoose');


const ChatSchema = new mongoose.Schema(
  {
    roomId:{
      type: String,
      require: true,
    },
    senderId: {
      type: String,
      require: true,
    },
    receiverId: {
      type: String,
      require: true,
    },
    message: {
      type: String,
      require : true,
    },
    timestamp: { type: Date, default: Date.now }
  }
);


module.exports = mongoose.model('chat', ChatSchema);
