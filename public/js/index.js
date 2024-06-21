"use strict";

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

const socket = io();

const devicePixelRatio = window.devicePixelRatio || 1;

canvas.width = innerWidth;
canvas.height = innerHeight;

const fPlayers = {};
const rooms = ["main"];

var privateChatRecipient = null;

const publicChat = document.querySelector(".public-chat-container");
const privateChat = document.querySelector(".private-chat-container");

const publicMessageInput = $(".publicMessageInput");
const publicMessageContainer = $(".public-message-container");
const publicSendButton = $(".public-send-button");
const publicInputClose = $(".public-input-close");
const publicChatButton = $(".public-chat-button");
const publicChatContainer = $(".public-chat-container");

const shoutoutButton = $(".shoutout-button");
const shoutoutInputContainer = $(".shoutout-input-container");
const shoutoutInput = $(".shoutout-input");
const shoutoutContainer = $(".shoutout-container");
var shoutoutStartTime = 0;

const privateMessageContainer = $(".private-message-container");
const privateChatContainer = $(".private-chat-container");
const privateMessageInput = $(".privateMessageInput");
const privateSendButton = $(".private-send-button");
const privateInputClose = $(".private-input-close");

const accessories = {
    baseball: new Image(),
    captain: new Image(),
    paperhat: new Image(),
    viking: new Image(),
    russia: new Image(),
    cowboy: new Image(),
    hardhat: new Image(),
    sombrero: new Image(),
    flower: new Image(),
    police: new Image(),
    leaf: new Image(),
    party: new Image(),
    pirate: new Image(),
    duck: new Image(),
    cherry: new Image(),
    egg: new Image(),
    icecream: new Image(),
    banana: new Image(),
    tophat: new Image(),
    pepper: new Image(),
    chef: new Image(),
    crown: new Image(),
    dum: new Image(),
    knight: new Image(),
    egg2: new Image(),
    toiletpaper: new Image(),
    spanish: new Image(),
    mask: new Image(),
};

accessories.baseball.src = "sprites/accessories/baseball.png";
accessories.captain.src = "sprites/accessories/captain.png";
accessories.paperhat.src = "sprites/accessories/paperhat.png";
accessories.viking.src = "sprites/accessories/viking.png";
accessories.russia.src = "sprites/accessories/russia.png";
accessories.cowboy.src = "sprites/accessories/cowboy.png";
accessories.hardhat.src = "sprites/accessories/hardhat.png";
accessories.sombrero.src = "sprites/accessories/sombrero.png";
accessories.flower.src = "sprites/accessories/flower.png";
accessories.police.src = "sprites/accessories/police.png";
accessories.leaf.src = "sprites/accessories/leaf.png";
accessories.party.src = "sprites/accessories/party.png";
accessories.pirate.src = "sprites/accessories/pirate.png";
accessories.duck.src = "sprites/accessories/duck.png";
accessories.cherry.src = "sprites/accessories/cherry.png";
accessories.egg.src = "sprites/accessories/egg.png";
accessories.icecream.src = "sprites/accessories/icecream.png";
accessories.banana.src = "sprites/accessories/banana.png";
accessories.tophat.src = "sprites/accessories/tophat.png";
accessories.pepper.src = "sprites/accessories/pepper.png";
accessories.chef.src = "sprites/accessories/chef.png";
accessories.crown.src = "sprites/accessories/crown.png";
accessories.dum.src = "sprites/accessories/dum.png";
accessories.knight.src = "sprites/accessories/knight.png";
accessories.egg2.src = "sprites/accessories/egg2.png";
accessories.toiletpaper.src = "sprites/accessories/toiletpaper.png";
accessories.spanish.src = "sprites/accessories/spanish.png";
accessories.mask.src = "sprites/accessories/mask.png";


socket.on("update-players", (bPlayers) => {
    for(const id in bPlayers){
        const bPlayer = bPlayers[id];

        $("#room-text").text(bPlayer.room);

        if(!fPlayers[id]){
            fPlayers[id] = new Player({
                x: bPlayer.x, 
                y: bPlayer.y, 
                radius: bPlayer.radius, 
                color: bPlayer.color,
                username: bPlayer.username,
                room: bPlayer.room,
                accessory: bPlayer.accessory,
                direction: bPlayer.direction
            });
        } else{
            if(id === socket.id){
                fPlayers[id].x = bPlayer.x;
                fPlayers[id].y = bPlayer.y;
                fPlayers[id].direction = bPlayer.direction;
    
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
                fPlayers[id].direction = bPlayer.direction;
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

socket.on("update-playerlist", (bPlayers) => {
    const userList = document.querySelector(".userlist");
    userList.innerHTML = '';

    for (const id in bPlayers) {
        if (id !== socket.id) {
            const bPlayer = bPlayers[id];
            const userElement = document.createElement("div");
            userElement.className = "users";
            userElement.textContent = bPlayer.username;
            userElement.addEventListener("click", () => {
                privateChatRecipient = bPlayer.username;
                openPrivateChat(bPlayer.username);
                userElement.classList.remove("new-message");
            });
            userList.appendChild(userElement);
        }
    }

    $("#playerCount").text(`${Object.keys(bPlayers).length}`);
});

const keys = {
    w: { pressed: false },
    s: { pressed: false },
    a: { pressed: false },
    d: { pressed: false }
}

const speed = 6;
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
        fPlayers[socket.id].direction = "left";
        socket.emit("keydown", {key: 'a', sequenceNum});
    }

    if(keys.d.pressed){
        sequenceNum++;
        playerInputs.push({sequenceNum, dx: speed, dy: 0});
        fPlayers[socket.id].x += speed;
        fPlayers[socket.id].direction = "right";
        socket.emit("keydown", {key: 'd', sequenceNum});
    }
}, 15)

socket.on("load-public-messages", (messages) => {
    publicChat.innerHTML = '';
    messages.forEach((message) => {
        const messageElement = document.createElement("div");
        if (message.username === fPlayers[socket.id].username) {
            messageElement.innerHTML = `<span style="color: rgb(77, 184, 255)">${message.username}</span> : &nbsp ${message.text}`;
        } else {
            messageElement.innerHTML = `<span style="color: gray">${message.username}</span> : &nbsp ${message.text}`;
        }
        // messageElement.innerHTML = `<span style="color: gray">${message.username}</span> : &nbsp ${message.text}`;
        messageElement.className = "textMessages";
        publicChat.appendChild(messageElement);
    });
    publicChat.scrollTop = publicChat.scrollHeight;
});

socket.on("public-message", (message) => {
    const messageElement = document.createElement("div");

    if(message.username === fPlayers[socket.id].username){
        messageElement.innerHTML = `<span style="color: rgb(77, 184, 255)">${message.username}</span> : &nbsp ${message.text}`;
    } else{
        messageElement.innerHTML = `<span style="color: gray">${message.username}</span> : &nbsp ${message.text}`;
    }

    messageElement.className = "textMessages";
    publicChat.appendChild(messageElement);
    publicChat.scrollTop = publicChat.scrollHeight;
})

socket.on("private-message", (message) => {
    const messageElement = document.createElement("div");
    if (message.sender === privateChatRecipient || message.sender === fPlayers[socket.id].username) {
        if (message.sender === fPlayers[socket.id].username) {
            messageElement.innerHTML = `<span style="color: rgb(77, 184, 255)">${message.sender}</span> : &nbsp ${message.text}`;
        } else {
            messageElement.innerHTML = `<span style="color: gray">${message.sender}</span> : &nbsp ${message.text}`;
        }
        messageElement.className = "textMessages";
        privateChat.appendChild(messageElement);
        privateChat.scrollTop = privateChat.scrollHeight;
    }

    if (message.sender !== privateChatRecipient && message.sender !== fPlayers[socket.id].username) {
        const userElements = document.querySelectorAll(".users");
        userElements.forEach(userElement => {
            if (userElement.textContent === message.sender) {
                if (!userElement.classList.contains("new-message")) {
                    userElement.classList.add("new-message");
                }
            }
        });
    }
});

socket.on("load-private-messages", (messages) => {
    privateChat.innerHTML = "";
    messages.forEach((message) => {
        const messageElement = document.createElement("div");
        if (message.sender === fPlayers[socket.id].username) {
            messageElement.innerHTML = `<span style="color: rgb(77, 184, 255)">${message.sender}</span> : &nbsp ${message.text}`;
        } else {
            messageElement.innerHTML = `<span style="color: gray">${message.sender}</span> : &nbsp ${message.text}`;
        }
        messageElement.className = "textMessages";
        privateChat.appendChild(messageElement);
    });
    privateChat.scrollTop = privateChat.scrollHeight;
});

socket.on("shoutout-message", (message) => {
    shoutoutInput.val(message.text);
    shoutoutInputContainer.css("display", "none");
    shoutoutStartTime = window.performance.now();
    shoutoutButton.css("pointer-events", "none");
    shoutoutButton.css("color", "rgba(255, 255, 255, 0.4)");
    updateShoutout(message.username, message.text);
});

socket.on("enable-shoutout", () => {
    shoutoutButton.css("pointer-events", "all");
    shoutoutButton.css("color", "white");
});

socket.on("update-rooms", (room) => {
    rooms.push(room);
})

socket.on("remove-rooms", (room) => {
    let i = rooms.indexOf(room);

    if(i !== -1){
        rooms.splice(i, 1);
    }
})

function sendPublicMessage() {
    if ((publicSendButton || publicMessageInput.is(":focus")) && publicMessageInput.val() !== '') {
        publicMessageContainer.add(publicMessageInput).add(publicSendButton).add(publicChatButton).add(shoutoutButton).add(publicInputClose).toggle();
        publicChatContainer.css("opacity", 0.4).css("background-color", "rgba(0, 0, 0, 0)");

        const message = publicMessageInput.val();
        socket.emit("public-message", message);

        publicMessageInput.val('');
    }
}

function openPrivateChat(username) {
    privateMessageContainer.add(privateMessageInput).add(privateSendButton).add(privateInputClose).css("display", "block");
    privateMessageInput.attr("placeholder", `Send message to ${username}...`);
    privateMessageInput.focus();
    privateChatContainer.css("opacity", 1);

    privateChat.innerHTML = "";
    socket.emit("get-private-messages", { sender: fPlayers[socket.id].username, receiver: privateChatRecipient });
    privateChat.style.display = "block";
}

function sendPrivateMessage() {
    const privateMessageInput = $(".privateMessageInput");

    if (privateMessageInput.val() !== '' && privateChatRecipient) {
        const message = privateMessageInput.val();
        socket.emit("private-message", { sender: fPlayers[socket.id].username, receiver: privateChatRecipient, text: message });
        privateMessageInput.val('');
    }
}

function updateShoutout(username, text) {
    const elapsedTime = window.performance.now() - shoutoutStartTime;
    if (elapsedTime < 10000) {
        shoutoutContainer.html(`<span style="color: yellow;">${username}</span> : &nbsp ${text}`);
        requestAnimationFrame(() => updateShoutout(username, text));
    } else {
        shoutoutContainer.text('');
        shoutoutInput.val('');
        socket.emit("enable-shoutout");
    }
}

function joinRoom(){
    const room = $(".join-room-input").val();

    if(rooms.includes(room)){
        socket.emit("change-room", room);

        $(".join-room-input").val('');
        $(".change-room-container").toggle();
    } else{
        $(".join-room-input").val('');
        alert("Room does not exist!");
    }
}

$(document).keydown((e) => {
    if (e.key === "Enter") {
        e.preventDefault();

        if (publicMessageInput.is(":focus")) {
            sendPublicMessage();
        } else if(privateMessageInput.is(":focus")){
            sendPrivateMessage();
        } else if(shoutoutInput.is(":focus")){
            const message = shoutoutInput.val();
            if (message.trim() !== "") {
                socket.emit("shoutout-message", message);
                shoutoutButton.prop("disabled", true);
                shoutoutInput.val('');
                shoutoutInputContainer.toggle();
                shoutoutStartTime = window.performance.now();
            }
        } else if($(".join-room-input").is(":focus")){
            joinRoom();
        }
        else if (fPlayers[socket.id].username) {
            publicMessageContainer.add(publicMessageInput).add(publicSendButton).add(publicInputClose).css("display", "block");
            publicChatButton.add(shoutoutButton).toggle();
            publicMessageInput.focus();
            publicChatContainer.css("opacity", 1).css("background-color", "rgba(0, 0, 0, 0.8)");
        }
    }

    // if(e.key === "Escape"){
    //     e.preventDefault();

    //     publicMessageContainer.add(publicMessageInput).add(publicSendButton).toggle();
    //     publicChatButton.toggle();
    //     publicChatContainer.css("opacity", 0.4);
    // }

    if(e.key === "Tab"){
        $(".userlist-container, .private-chat-button-close, .private-chat-button").toggle();
    }
});

let animationId;

const camera = {
    x: 0,
    y: 0,
};

function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

function updateCamera(targetX, targetY) {
    const lerpFactor = 0.6;
    camera.x = lerp(camera.x, targetX - canvas.width / 2, lerpFactor);
    camera.y = lerp(camera.y, targetY - canvas.height / 2, lerpFactor);
}

const borderWidth = 2000;
const borderHeight = 1400;


function animate() {
    animationId = requestAnimationFrame(animate);
    
    c.fillStyle = "rgba(0, 0, 0, 0.3)";
    c.fillRect(0, 0, canvas.width, canvas.height);

    // c.clearRect(0, 0, canvas.width, canvas.height);

    const player = fPlayers[socket.id];
    if(!player) return;
    updateCamera(player.x, player.y);

    // const camera = {
    //     x: player.x - canvas.width / 2,
    //     y: player.y - canvas.height / 2
    // }

    c.save();
    c.translate(-camera.x, -camera.y);

    c.strokeStyle = "rgba(255, 255, 255, 0.3)";
    c.lineWidth = 5;
    c.strokeRect(50, 50, borderWidth, borderHeight);

    c.restore();

    for(const id in fPlayers){
        const fPlayer = fPlayers[id];
        fPlayer.draw(c, camera);
    }
}

animate();
