const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {pingInterval: 2000, pingTimeout: 3000});
const mongoose = require("mongoose");
const port = 3000;

app.use(express.static("public"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

const bPlayers = {}

const speed = 10;

mongoose.connect("mongodb://localhost:27017/nexus")
    .then(() => {
        console.log("MongoDB Connected")
    })
    .catch(err => {
        console.error("MongoDB connection error", err);
    });

const publicMessageSchema = new mongoose.Schema({
    username: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
})

const privateMessageSchema = new mongoose.Schema({
    sender: String,
    receiver: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
})

const PublicMessage = mongoose.model("Public-Message", publicMessageSchema);
const PrivateMessage = mongoose.model("Private-Message", privateMessageSchema);

const usernameToSocketId = {};
const socketIdToUsername = {};

io.on("connection", (socket) => {
    console.log("a player connected");

    PublicMessage.find().sort({ timestamp: 1 }).then(messages => {
        socket.emit("load-public-messages", messages);
    }).catch(err => {
        console.error("Error fetching messages", err);
    });

    io.emit("update-players", bPlayers)
    console.log(bPlayers);

    socket.on("keydown", ({key, sequenceNum}) => {
        bPlayers[socket.id].sequenceNum = sequenceNum;
        switch(key){
            case 'w':
                bPlayers[socket.id].y -= speed;
                break;
            case 's':
                bPlayers[socket.id].y += speed;
                break;
            case 'a':
                bPlayers[socket.id].x -= speed;
                break;
            case 'd':
                bPlayers[socket.id].x += speed;
                break;
        }
    })

    socket.on("init", ({username, color}) => {
        usernameToSocketId[username] = socket.id;
        socketIdToUsername[socket.id] = username;

        bPlayers[socket.id] = {
            x: 500 * Math.random(),
            y: 500 * Math.random(),
            radius: 20,
            color,
            // color: `hsl(${360 * Math.random()}, 100%, 50%)`,
            sequenceNum: 0,
            username
        }
        io.emit("update-playerlist", bPlayers);
    })

    socket.on("public-message", (message) => {
        const userMessage = {
            username: bPlayers[socket.id].username,
            text: message
        }
        io.emit("public-message", userMessage);

        const publicMessage = new PublicMessage({
            username: userMessage.username,
            text: userMessage.text
        })

        publicMessage.save()
            .then(() => {
                console.log("Public message saved")
            })
            .catch(err => {
                console.error("Error saving public message", err);
            })
    })

    socket.on("private-message", ({ sender, receiver, text }) => {
        const privateMessage = new PrivateMessage({ sender, receiver, text });
    
        privateMessage.save()
            .then(() => {
                console.log("Private message saved");
                const receiverSocketId = usernameToSocketId[receiver];
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("private-message", { sender, text, receiver: socket.id });
                }
                // io.to(receiver).emit("private-message", { sender, text, receiver: socket.id });
                socket.emit("private-message", { sender, text, receiver });
            })
            .catch(err => {
                console.error("Error saving private message", err);
            });
    });    

    socket.on("get-private-messages", ({ sender, receiver }) => {
        PrivateMessage.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        }).sort({ timestamp: 1 })
            .then(messages => {
                socket.emit("load-private-messages", messages);
            })
            .catch(err => {
                console.error("Error fetching private messages", err);
            });
    });    

    socket.on("disconnect", () => {
        const username = socketIdToUsername[socket.id];
        delete usernameToSocketId[username];
        delete socketIdToUsername[socket.id];
        delete bPlayers[socket.id];
        io.emit("update-players", bPlayers);
    })
})

setInterval(() => {
    io.emit("update-players", bPlayers);
}, 15)

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
})