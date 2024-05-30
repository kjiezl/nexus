const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

const socket = io();

const devicePixelRatio = window.devicePixelRatio || 1;

canvas.width = innerWidth * devicePixelRatio;
canvas.height = innerHeight * devicePixelRatio;

const x = canvas.width / 2;
const y = canvas.height / 2;

const fPlayers = {};

socket.on("update-players", (bPlayers) => {
    for(const id in bPlayers){
        const bPlayer = bPlayers[id];

        if(!fPlayers[id]){
            fPlayers[id] = new Player({
                x: bPlayer.x, 
                y: bPlayer.y, 
                radius: bPlayer.radius, 
                color: bPlayer.color,
                username: bPlayer.username
            });
        } else{
            if(id === socket.id){
                fPlayers[id].x = bPlayer.x;
                fPlayers[id].y = bPlayer.y;
    
                const lastBIndex = playerInputs.findIndex(input => {
                    return bPlayer.sequenceNum === input.sequenceNum
                })
    
                if(lastBIndex > -1){
                    playerInputs.splice(0, lastBIndex + 1);
                }

                playerInputs.forEach((input) => {
                    fPlayers[id].x += input.dx;
                    fPlayers[id].y += input.dy;
                })
            } else{
                gsap.to(fPlayers[id], {
                    x: bPlayer.x,
                    y: bPlayer.y,
                    duration: 0.015,
                    ease: "linear"
                })
            }
        }
    }

    for(const id in fPlayers){
        if(!bPlayers[id]){
            delete fPlayers[id];
        }
    }
//   console.log(fPlayers)
})

const keys = {
    w: {
        pressed: false
    },
    s: {
        pressed: false
    },
    a: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

const speed = 10;
const playerInputs = [];
let sequenceNum = 0;

setInterval(() => {
    if(keys.w.pressed){
        sequenceNum++;
        playerInputs.push({sequenceNum, dx: 0, dy: -speed});
        fPlayers[socket.id].y -= speed;
        socket.emit("keydown", {key: 'w', sequenceNum});
    }

    if(keys.s.pressed){
        sequenceNum++;
        playerInputs.push({sequenceNum, dx: 0, dy: speed});
        fPlayers[socket.id].y += speed;
        socket.emit("keydown", {key: 's', sequenceNum});
    }

    if(keys.a.pressed){
        sequenceNum++;
        playerInputs.push({sequenceNum, dx: -speed, dy: 0});
        fPlayers[socket.id].x -= speed;
        socket.emit("keydown", {key: 'a', sequenceNum});
    }

    if(keys.d.pressed){
        sequenceNum++;
        playerInputs.push({sequenceNum, dx: speed, dy: 0});
        fPlayers[socket.id].x += speed;
        socket.emit("keydown", {key: 'd', sequenceNum});
    }
}, 15)

document.querySelector("#usernameForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.querySelector("#usernameInput").value;
    const color = document.querySelector("#colorInput").value;
    if(!username){
        alert("Please enter username")
        return;
    }
    document.querySelector("#usernameForm").style.display = "none";
    document.querySelector("#formDiv").style.display = "none";
    socket.emit("init", {username, color});
})

let animationId;

function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = "rgba(0, 0, 0, 0.3)";
    c.fillRect(0, 0, canvas.width, canvas.height);

    for(const id in fPlayers){
        const fPlayer = fPlayers[id];
        fPlayer.draw();
    }
}

animate();