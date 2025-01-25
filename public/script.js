// import { io } from "socket.io-client";

const connectBtn = document.getElementById('startChatBtn');
const chatRoom = document.getElementById('chatRoom');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const exitBtn = document.getElementById('exitBtn');
const emojiBtn = document.getElementById('emojiBtn');
const gifBtn = document.getElementById('gifBtn');
{/* <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script> */}

let socket, roomId;
let connectionStatusMessage;

connectBtn.addEventListener('click', startNewChat);

// Display or update connection status message
function displayConnectionStatusMessage(text) {
    if (!connectionStatusMessage) {
        connectionStatusMessage = document.createElement('p');
        connectionStatusMessage.classList.add('feedback-message');
        messages.appendChild(connectionStatusMessage);
    }
    connectionStatusMessage.textContent = text;
    messages.scrollTop = messages.scrollHeight;
}

function addFeedbackMessage(text) {
    const feedback = document.createElement('p');
    feedback.textContent = text;
    feedback.classList.add('feedback-message');
    messages.appendChild(feedback);
    messages.scrollTop = messages.scrollHeight;
}

function startNewChat() {
    if (socket) socket.disconnect(); // Close any existing connection

    // Initialize new socket connection
    // socket = io('http://localhost:3000');
    socket=io('https://chat-app-black-psi.vercel.app/') 
    // Replace with port-forwarded URL as needed

    chatRoom.classList.remove('hidden');
    connectBtn.style.display = 'none';
    exitBtn.textContent = 'Exit Chat';
    exitBtn.style.display = 'block';
    messageInput.style.display = 'block';
    sendBtn.style.display = 'block';
    messages.innerHTML = ''; // Clear chat messages
    connectionStatusMessage = null;
      // Show the emoji and gif buttons again when starting a new chat
    emojiBtn.style.display = 'inline-block';  // Show emoji button
    gifBtn.style.display = 'inline-block';    // Show GIF button

    displayConnectionStatusMessage('Connecting you to a random user...');

    const welcomeSection = document.getElementById('welcome');
    welcomeSection.style.display = 'none';

    socket.on('connect', () => {
        console.log('Connected to server:', socket.id);

        // Join a room and update UI on pairing
        socket.once('paired', (data) => {
            roomId = data.roomId;
            displayConnectionStatusMessage('You are connected with a random user.');
        });

        // Listen for incoming messages
        socket.on('message', (data) => {
            const newMessage = document.createElement('p');
            const sender = data.userId === socket.id ? 'self' : 'stranger';
            newMessage.textContent = `${sender === 'self' ? 'You' : 'Stranger'}: ${data.message}`;
            newMessage.classList.add('message', sender);
            messages.appendChild(newMessage);
            messages.scrollTop = messages.scrollHeight;
        });

        // Handle disconnection from either end
        socket.on('strangerDisconnected', () => {
            addFeedbackMessage('Stranger disconnected. Click "New Chat" to start again.');
            endChat();
        });
    });
}

// Function to send a message
function sendMessage() {
    const message = messageInput.value;
    if (message && roomId && socket && socket.connected) {
        socket.emit('message', { roomId, message });
        const newMessage = document.createElement('p');
        newMessage.textContent = `You: ${message}`;
        newMessage.classList.add('message', 'self'); // Add 'self' class
        messages.appendChild(newMessage); // Append to #messages
        messageInput.value = ''; // Clear the input
        messages.scrollTop = messages.scrollHeight; // Scroll to the bottom
    }
}

// Event listener for the "Send" button
sendBtn.addEventListener('click', sendMessage);

// Emoji button functionality
let emojiPicker; // Keep a reference to the emoji picker

emojiBtn.addEventListener('click', () => {
    // Check if the picker is already open
    if (!emojiPicker) {
        emojiPicker = document.createElement('emoji-picker');
        emojiPicker.style.position = 'absolute';
        emojiPicker.style.bottom = '60px'; // Adjust based on your UI
        emojiPicker.style.left = '20px'; // Adjust based on your UI
        document.body.appendChild(emojiPicker);

        // Add emoji to input without closing the picker
        emojiPicker.addEventListener('emoji-click', (event) => {
            messageInput.value += event.detail.unicode;
        });
    }
});
document.addEventListener('click', (event) => {
    if (emojiPicker && !emojiBtn.contains(event.target) && !emojiPicker.contains(event.target)) {
        emojiPicker.remove();
        emojiPicker = null; // Reset the picker reference
    }
});

// GIF button functionality
gifBtn.addEventListener('click', () => {
    const searchQuery = prompt('Search GIF:');
    if (!searchQuery) return;

    fetch(`https://api.giphy.com/v1/gifs/search?api_key=YOUR_API_KEY&q=${searchQuery}&limit=5`)
        .then((response) => response.json())
        .then((data) => {
            const gifModal = document.createElement('div');
            gifModal.style.position = 'fixed';
            gifModal.style.top = '0';
            gifModal.style.left = '0';
            gifModal.style.width = '100vw';
            gifModal.style.height = '100vh';
            gifModal.style.backgroundColor = 'rgba(0,0,0,0.7)';
            gifModal.style.zIndex = '1000';
            gifModal.style.display = 'flex';
            gifModal.style.flexWrap = 'wrap';
            gifModal.style.justifyContent = 'center';

            // Display GIFs
            data.data.forEach((gif) => {
                const img = document.createElement('img');
                img.src = gif.images.fixed_height.url;
                img.style.width = '150px';
                img.style.margin = '10px';
                img.style.cursor = 'pointer';

                img.addEventListener('click', () => {
                    const gifMessage = document.createElement('p');
                    gifMessage.innerHTML = `<img src="${gif.images.fixed_height.url}" alt="GIF" style="width: 100px;">`;
                    gifMessage.classList.add('message', 'self');
                    messages.appendChild(gifMessage);
                    messages.scrollTop = messages.scrollHeight; // Scroll to the bottom
                    gifModal.remove(); // Close modal
                });

                gifModal.appendChild(img);
            });

            document.body.appendChild(gifModal);

            // Close modal on click outside
            gifModal.addEventListener('click', (e) => {
                if (e.target === gifModal) gifModal.remove();
            });
        });
});


// Detect 'Enter' key press to send message
messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { // Prevent line break on Enter + Shift
        event.preventDefault(); // Stop default behavior (new line)
        sendMessage(); // Call the send message function
    }
});

// Handle exit button click
exitBtn.addEventListener('click', () => {
    if (exitBtn.textContent === 'Exit Chat') {
        socket.emit('leaveRoom'); // Notify server for disconnection
        addFeedbackMessage('You disconnected. Click "New Chat" to start again.');
        endChat();
    } else {
        startNewChat();
    }
});

// End chat and reset UI
function endChat() {
    roomId = null;
    if (socket) socket.disconnect();
    emojiBtn.style.display = 'none';  // Hide emoji button
    gifBtn.style.display = 'none';    // Hide GIF button
    exitBtn.textContent = 'New Chat';
    exitBtn.style.display = 'block';
    messageInput.style.display = 'none';
    sendBtn.style.display = 'none';
    messageInput.value = '';
    connectionStatusMessage = null;
}

// Clean up socket connection before page unload
window.addEventListener('beforeunload', () => {
    if (socket) socket.emit('leaveRoom');
    socket.disconnect();
});
