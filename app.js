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

const players = {}

io.on("connection", (socket) => {
    console.log("a player connected");
    players[socket.id] = {
        x: 500 * Math.random(),
        y: 500 * Math.random()
    }

    io.emit("update-players", players)
    console.log(players);

    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("update-players", players);
    })
})

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
})