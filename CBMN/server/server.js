const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for POC
        methods: ["GET", "POST"]
    }
});

// Storage (In-memory for POC)
const users = {}; // username -> socketId
const friendRequests = {}; // username -> [from_username]
const friends = {}; // username -> [friend_username]

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // 1. Login (Register Name)
    socket.on('login', (username) => {
        if (users[username]) {
            socket.emit('error', 'Username taken');
        } else {
            users[username] = socket.id;
            socket.username = username;

            if (!friends[username]) friends[username] = [];
            if (!friendRequests[username]) friendRequests[username] = [];

            socket.emit('login_success', {
                username,
                friends: friends[username],
                requests: friendRequests[username]
            });
            console.log(`User registered: ${username}`);
        }
    });

    // 2. Send Friend Request
    socket.on('send_request', (targetUsername) => {
        const sender = socket.username;
        if (!sender) return;

        if (users[targetUsername]) {
            if (!friendRequests[targetUsername].includes(sender) && !friends[targetUsername]?.includes(sender)) {
                friendRequests[targetUsername].push(sender);

                // Notify target if online
                io.to(users[targetUsername]).emit('new_request', sender);
                socket.emit('request_sent', targetUsername);
            } else {
                socket.emit('error', 'Request already sent or already friends');
            }
        } else {
            // In a real app we'd look up DB, here we only know online users or returning users if persistent
            // For this simple POC, we can only request online users or we need a persistent store. 
            // Let's assume for POC both must be online or known. 
            // Simple fallback:
            socket.emit('error', 'User not found or offline');
        }
    });

    // 3. Accept Friend Request
    socket.on('accept_request', (requesterName) => {
        const receiver = socket.username;
        if (!receiver) return;

        // Verify request exists
        const reqIndex = friendRequests[receiver].indexOf(requesterName);
        if (reqIndex > -1) {
            friendRequests[receiver].splice(reqIndex, 1);

            // Add to friend lists
            friends[receiver].push(requesterName);
            if (!friends[requesterName]) friends[requesterName] = [];
            friends[requesterName].push(receiver);

            socket.emit('friend_added', requesterName);

            if (users[requesterName]) {
                io.to(users[requesterName]).emit('friend_added', receiver);
            }
        }
    });

    // 4. Delete Friend
    socket.on('delete_friend', (friendName) => {
        const username = socket.username;
        if (!username) return;

        // Remove from current user's list
        if (friends[username]) {
            friends[username] = friends[username].filter(f => f !== friendName);
        }

        // Remove from friend's list
        if (friends[friendName]) {
            friends[friendName] = friends[friendName].filter(f => f !== username);
        }

        socket.emit('friend_removed', friendName);

        if (users[friendName]) {
            io.to(users[friendName]).emit('friend_removed', username);
        }
    });

    // 5. Call User
    socket.on('call_user', ({ userToCall, signalData, from }) => {
        // Check if friends
        if (friends[from]?.includes(userToCall)) {
            if (users[userToCall]) {
                io.to(users[userToCall]).emit("call_incoming", { signal: signalData, from });
            } else {
                socket.emit("call_failed", "User offline");
            }
        } else {
            socket.emit("call_failed", "Not friends");
        }
    });

    // 5. Answer Call
    socket.on("answer_call", (data) => {
        io.to(users[data.to]).emit("call_accepted", data.signal);
    });

    // 6. ICE Candidates
    socket.on("ice_candidate", (data) => {
        // data: { to, candidate }
        if (users[data.to]) {
            io.to(users[data.to]).emit("ice_candidate", data.candidate);
        }
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            delete users[socket.username];
            console.log(`User disconnected: ${socket.username}`);
        }
    });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
