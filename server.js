const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {pingInterval: 2000, pingTimeout: 3000});
const mongoose = require("mongoose");
const port = process.env.PORT || 3000;

const connectionString = process.env.DATABASE_URL;

app.use(express.static("public"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

const bPlayers = {}

const speed = 6;

// mongoose.connect("mongodb://localhost:27017/nexus")
mongoose.connect(connectionString)
    .then(() => {
        console.log("MongoDB Connected")
    })
    .catch(err => {
        console.error("MongoDB connection error", err);
    });

const publicMessageSchema = new mongoose.Schema({
    username: String,
    text: String,
    timestamp: { type: Date, default: Date.now },
    room: String
})

const privateMessageSchema = new mongoose.Schema({
    sender: String,
    receiver: String,
    text: String,
    timestamp: { type: Date, default: Date.now },
    room: String
})

const PublicMessage = mongoose.model("Public-Message", publicMessageSchema);
const PrivateMessage = mongoose.model("Private-Message", privateMessageSchema);

const usernameToSocketId = {};
const socketIdToUsername = {};

const gameWidth = 2000;
var gameHeight = 1400;

const rooms = ["main"]

io.on("connection", (socket) => {
    console.log("a player connected");

    socket.on("join-room", (room) => {
        socket.join(room);
        socket.room = room;

        io.emit("init-rooms", rooms);

        PublicMessage.find({ room }).sort({ timestamp: 1 }).then(messages => {
            socket.emit("load-public-messages", messages);
        }).catch(err => {
            console.error("Error fetching messages", err);
        });

        const roomPlayers = Object.keys(bPlayers)
            .filter(playerID => bPlayers[playerID].room === room)
            .reduce((acc, playerID) => {
                acc[playerID] = bPlayers[playerID];
                return acc;
            }, {})

        io.to(room).emit("update-players", roomPlayers);
        io.to(room).emit("update-playerlist", roomPlayers);
        console.log(bPlayers);
    })

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
                bPlayers[socket.id].direction = "left";
                break;
            case 'd':
                bPlayers[socket.id].x += speed;
                bPlayers[socket.id].direction = "right";
                break;
        }

        bPlayers[socket.id].x = Math.max(70, Math.min(bPlayers[socket.id].x, gameWidth + 30));
        bPlayers[socket.id].y = Math.max(70, Math.min(bPlayers[socket.id].y, gameHeight + 30));

        setInterval(() => {
            const room = socket.room;
            if(!room) return;
    
            const roomPlayers = Object.keys(bPlayers)
                .filter(playerID => bPlayers[playerID].room === room)
                .reduce((acc, playerID) => {
                    acc[playerID] = bPlayers[playerID];
                    return acc;
                }, {})
    
            io.to(room).emit("update-players", roomPlayers);
        }, 5)
    })

    socket.on("check-username", (username, callback) => {
        const exists = Object.values(bPlayers).some(player => player.username === username);
        callback({ exists });
    });

    socket.on("init", ({username, color, room, width, height, accessory}) => {
        usernameToSocketId[username] = socket.id;
        socketIdToUsername[socket.id] = username;

        bPlayers[socket.id] = {
            x: width * Math.random(),
            y: height * Math.random(),
            radius: 20, 
            color,
            // color: `hsl(${360 * Math.random()}, 100%, 50%)`,
            sequenceNum: 0,
            username,
            room,
            accessory,
            direction: "right"
        }

        const roomPlayers = Object.keys(bPlayers)
            .filter(playerID => bPlayers[playerID].room === room)
            .reduce((acc, playerID) => {
                acc[playerID] = bPlayers[playerID];
                return acc;
            }, {})

        io.to(room).emit("update-playerlist", roomPlayers);
        io.to(room).emit("update-players", roomPlayers);
    })

    socket.on("public-message", (message) => {
        const userMessage = {
            username: bPlayers[socket.id].username,
            text: message,
            // room: socket.room
        }
        io.to(socket.room).emit("public-message", userMessage);

        const publicMessage = new PublicMessage({
            username: userMessage.username,
            text: userMessage.text,
            room: socket.room
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
        const privateMessage = new PrivateMessage({ sender, receiver, text, room: socket.room });
    
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
                { sender, receiver, room: socket.room },
                { sender: receiver, receiver: sender, room: socket.room }
            ]
        }).sort({ timestamp: 1 })
            .then(messages => {
                socket.emit("load-private-messages", messages);
            })
            .catch(err => {
                console.error("Error fetching private messages", err);
            });
    });    

    socket.on("shoutout-message", (message) => {
        const userMessage = {
            username: bPlayers[socket.id].username,
            text: message
        }
        io.to(socket.room).emit("shoutout-message", userMessage);
    });    

    socket.on("enable-shoutout", () => {
        io.to(socket.room).emit("enable-shoutout");
    });

    socket.on("change-room", (newRoom) => {
        const prevRoom = socket.room;
        socket.leave(prevRoom);
        socket.join(newRoom);
        socket.room = newRoom;
        bPlayers[socket.id].room = newRoom;

        PublicMessage.find({ room: newRoom }).sort({ timestamp: 1 }).then(messages => {
            socket.emit("load-public-messages", messages);
        }).catch(err => {
            console.error("Error fetching messages", err);
        });

        let roomSize = io.sockets.adapter.rooms.get(prevRoom);

        if(!roomSize && prevRoom !== "main"){
            // console.log(`${prevRoom} has no players`)
            io.emit("remove-rooms", prevRoom);
        }

        const prevRoomPlayers = Object.keys(bPlayers)
            .filter(playerID => bPlayers[playerID].room === prevRoom)
            .reduce((acc, playerID) => {
                acc[playerID] = bPlayers[playerID];
                return acc;
            }, {})
        
        const newRoomPlayers = Object.keys(bPlayers)
            .filter(playerID => bPlayers[playerID].room === newRoom)
            .reduce((acc, playerID) => {
                acc[playerID] = bPlayers[playerID];
                return acc;
            }, {})
        
            io.to(prevRoom).emit("update-players", prevRoomPlayers);
            io.to(prevRoom).emit("update-playerlist", prevRoomPlayers);

            io.to(newRoom).emit("update-players", newRoomPlayers);
            io.to(newRoom).emit("update-playerlist", newRoomPlayers);
    })

    socket.on("new-room", (room) => {
        rooms.push(room);
        io.emit("update-rooms", room);
    })

    socket.on("remove-room", (room) => {
        const i = rooms.indexOf(room);
        if (i !== -1) {
            rooms.splice(i, 1);
            io.emit("init-rooms", rooms);
        }
    });

    socket.on("disconnect", () => {
        const room = bPlayers[socket.id]?.room;
        const username = socketIdToUsername[socket.id];

        delete usernameToSocketId[username];
        delete socketIdToUsername[socket.id];
        delete bPlayers[socket.id];
        // io.emit("update-players", bPlayers);
        // io.emit("update-playerlist", bPlayers);

        if(room){
            const roomPlayers = Object.keys(bPlayers)
            .filter(playerID => bPlayers[playerID].room === room)
            .reduce((acc, playerID) => {
                acc[playerID] = bPlayers[playerID];
                return acc;
            }, {})

            io.to(room).emit("update-playerlist", roomPlayers);
            io.to(room).emit("update-players", roomPlayers);
        }
    })
})

// setInterval(() => {
//     io.emit("update-players", bPlayers);
// }, 15)

server.listen(port, "0.0.0.0", () => {
    console.log(`Listening on port ${port}`);
})