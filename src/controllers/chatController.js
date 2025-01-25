// src/controllers/chatController.js
const connectUser = (req, res) => {
    res.send({ message: "User will be connected through WebSocket" });
  };
  
  const roomStatus = (req, res) => {
    const { roomId } = req.params;
    const roomExists = Boolean(activeRooms[roomId]);
    res.send({ status: roomExists ? "active" : "inactive" });
  };
  
  module.exports = { connectUser, roomStatus };
  