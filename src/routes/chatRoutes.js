// src/routes/chatRoutes.js
const express = require('express');
const { connectUser, roomStatus } = require('../controllers/chatController');

const router = express.Router();

router.post('/connect', connectUser);
router.get('/rooms/:roomId/status', roomStatus);

module.exports = router;
