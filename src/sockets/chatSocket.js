const { connectUser, disconnectUser } = require('../services/chatService');

function setupChatSocket(io) {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Connect user and set up the initial state
        connectUser(socket);

        // Listen for messages and emit to the other user in the room
        socket.on('message', ({ roomId, message }) => {
            socket.to(roomId).emit('message', { userId: socket.id, message });
        });

        // Manual disconnection from the user
        socket.on('leaveRoom', () => {
            const roomId = socket.roomId;
            if (roomId) {
                socket.leave(roomId);
                console.log(`User ${socket.id} manually left room ${roomId}`);

                // Notify the other user in the room about disconnection
                io.to(roomId).emit('strangerDisconnected');
            }
            disconnectUser(socket); // Clean up the user's data
        });

        // Handle automatic disconnection (e.g., closing browser)
        socket.on('disconnect', () => {
            const roomId = socket.roomId;
            if (roomId) {
                console.log(`User ${socket.id} automatically disconnected from room ${roomId}`);
                io.to(roomId).emit('strangerDisconnected'); // Notify other user if in a room
                socket.leave(roomId);
            }
            disconnectUser(socket); // Clean up user data
        });
    });
}

module.exports = setupChatSocket;