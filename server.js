const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {pingInterval: 2000, pingTimeout: 3000});
const port = 3000;

app.use(express.static("public"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

const bPlayers = {}

const speed = 10;

io.on("connection", (socket) => {
    console.log("a player connected");

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
        bPlayers[socket.id] = {
            x: 500 * Math.random(),
            y: 500 * Math.random(),
            radius: 20,
            color,
            // color: `hsl(${360 * Math.random()}, 100%, 50%)`,
            sequenceNum: 0,
            username
        }
    })

    socket.on("public-message", (message) => {
        const userMessage = {
            username: bPlayers[socket.id].username,
            text: message
        }
        io.emit("public-message", userMessage);
    })

    socket.on("disconnect", () => {
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