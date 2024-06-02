"use strict";

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

const socket = io();

const devicePixelRatio = window.devicePixelRatio || 1;

canvas.width = innerWidth;
canvas.height = innerHeight;

const fPlayers = {};

var privateChatRecipient = null;

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

const publicChat = document.querySelector(".public-chat-container");
const privateChat = document.querySelector(".private-chat-container");

socket.on("load-public-messages", (messages) => {
    messages.forEach((message) => {
        const messageElement = document.createElement("div");
        messageElement.innerHTML = `<span style="color: gray">${message.username}</span> : &nbsp ${message.text}`;
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

function sendPublicMessage() {
    const publicMessageInput = $(".publicMessageInput");
    const publicMessageContainer = $(".public-message-container");
    const publicSendButton = $(".public-send-button");
    const publicInputClose = $(".public-input-close");
    const publicChatButton = $(".public-chat-button");
    const publicChatContainer = $(".public-chat-container");

    if ((publicSendButton || publicMessageInput.is(":focus")) && publicMessageInput.val() !== '') {
        publicMessageContainer.add(publicMessageInput).add(publicSendButton).add(publicChatButton).add(publicInputClose).toggle();
        publicChatContainer.css("opacity", 0.4);

        const message = publicMessageInput.val();
        socket.emit("public-message", message);

        publicMessageInput.val('');
    }
}

function openPrivateChat(username) {
    const privateMessageContainer = $(".private-message-container");
    const privateMessageInput = $(".privateMessageInput");
    const privateSendButton = $(".private-send-button");
    const privateInputClose = $(".private-input-close");
    const privateChatContainer = $(".private-chat-container");

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

$(document).keydown((e) => {
    const publicMessageInput = $(".publicMessageInput");
    const publicMessageContainer = $(".public-message-container");
    const publicSendButton = $(".public-send-button");
    const publicInputClose = $(".public-input-close");
    const publicChatButton = $(".public-chat-button");
    const publicChatContainer = $(".public-chat-container");

    if (e.key === "Enter") {
        e.preventDefault();

        if (publicMessageInput.is(":focus")) {
            sendPublicMessage();
        } else if (fPlayers[socket.id].username) {
            publicMessageContainer.add(publicMessageInput).add(publicSendButton).add(publicInputClose).css("display", "block");
            publicChatButton.toggle();
            publicMessageInput.focus();
            publicChatContainer.css("opacity", 1);
        }
    }

    if(e.key === "Escape"){
        e.preventDefault();

        publicMessageContainer.add(publicMessageInput).add(publicSendButton).toggle();
        publicChatButton.toggle();
        publicChatContainer.css("opacity", 0.4);
    }

    if(e.key === "Tab"){
        $(".userlist-container, .private-chat-button-close, .private-chat-button").toggle();
    }
});

let animationId;

function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = "rgba(0, 0, 0, 0.5)";
    c.fillRect(0, 0, canvas.width, canvas.height);

    for(const id in fPlayers){
        const fPlayer = fPlayers[id];
        fPlayer.draw();
    }
}

animate();