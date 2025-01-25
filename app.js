// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const chatRoutes = require('./src/routes/chatRoutes');
const setupChatSocket = require('./src/sockets/chatSocket');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);


// Add this in server.js
const path = require('path');


app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.json());

// API Routes
app.use('/api', chatRoutes);

// WebSocket Setup
setupChatSocket(io);

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
