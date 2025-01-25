const waitingUsers = []; // Queue of users waiting to be paired
const activeRooms = {};  // Track rooms with paired users

// Add a user to the waiting list or pair them with another user
function connectUser(socket) {
    if (waitingUsers.length > 0) {
        const pairedUser = waitingUsers.shift();
        const roomId = `room-${socket.id}-${pairedUser.id}`;
        activeRooms[roomId] = [socket, pairedUser];

        // Join both users to the same room
        socket.join(roomId);
        pairedUser.join(roomId);

        // Set roomId in socket for later reference
        socket.roomId = roomId;
        pairedUser.roomId = roomId;

        // Notify users they’re paired
        socket.emit('paired', { roomId, message: "You are connected with a random user." });
        pairedUser.emit('paired', { roomId, message: "You are connected with a random user." });
    } else {
        waitingUsers.push(socket);
    }
}

// Disconnect a user and remove from activeRooms or waiting list
function disconnectUser(socket) {
    const room = Object.keys(activeRooms).find(roomId =>
        activeRooms[roomId].includes(socket)
    );
    if (room) {
        const [user1, user2] = activeRooms[room];
        const otherUser = user1.id === socket.id ? user2 : user1;

        // Notify the other user
        otherUser.emit('disconnected', { message: "The other user has left the chat." });
        otherUser.leave(room); // Ensure the other user leaves the room

        // Remove room from activeRooms
        delete activeRooms[room];
    } else {
        // Remove from waiting queue if they’re still waiting
        const index = waitingUsers.indexOf(socket);
        if (index !== -1) waitingUsers.splice(index, 1);
    }
}

module.exports = { connectUser, disconnectUser }; 