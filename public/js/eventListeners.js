"use strict";

window.addEventListener("keydown", (e) => {
    if(!fPlayers[socket.id]) return;

    const publicMessageInput = $(".publicMessageInput");
    if(!publicMessageInput.is(":focus") 
        && !privateMessageInput.is(":focus")
        && !shoutoutInput.is(":focus")
        && !$(".join-room-input").is(":focus")){
        switch(e.key){
            case 'w':
                keys.w.pressed = true;
                break;
            case 's':
                keys.s.pressed = true;
                break;
            case 'a':
                keys.a.pressed = true;
                break;
            case 'd':
                keys.d.pressed = true;
                break;
        }
    }
    
})

window.addEventListener("keyup", (e) => {
    if(!fPlayers[socket.id]) return;

    switch(e.key){
        case 'w':
            keys.w.pressed = false;
            break;
        case 's':
            keys.s.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
    }    
})

var selectedAccessory = '';

$(".grid-item").click(function() {
    $(".grid-item").removeClass("selected");
    $(this).addClass("selected");
    selectedAccessory = $(this).attr("data-accessory");
});

$("#usernameForm").submit((e) => {
    e.preventDefault();
    const username = $("#usernameInput").val();
    const color = $("#colorInput").val();
    const room = "main";
    var accessory = selectedAccessory;

    const width = 2000;
    const height = 1400;

    if(!username){
        alert("Please enter username")
        return;
    }
    if(color === "#000000"){
        alert("Please choose a lighter color")
        return;
    }

    socket.emit("check-username", username, (res) => {
        if(res.exists) {
            alert("Username already exists.");
        } else {
            if(room) {
                socket.emit("join-room", room);
            }
            $("#usernameForm, #formDiv, .options-container, .public-chat-button, .private-chat-button, .top-options-container, .public-chat-container").toggle();
            socket.emit("init", { username, color, room, width, height, accessory });
        }
    });
})

$(".public-send-button").click(() => {
    sendPublicMessage();
})

$(".public-chat-button").click(() => {
    publicMessageContainer.add(publicMessageInput).add(publicSendButton).add(publicInputClose).css("display", "block");
    publicChatButton.add(shoutoutButton).toggle();
    publicMessageInput.focus();
    publicChatContainer.css("opacity", 1).css("background-color", "rgba(0, 0, 0, 0.8)");
})

$(".private-chat-button, .private-chat-button-close").click(() => {
    $(".userlist-container, .private-chat-button-close, .private-chat-button").toggle();
})

$(".private-send-button").click(() => {
    sendPrivateMessage();
})

$(".public-input-close").click(() => {
    publicMessageContainer.add(publicMessageInput).add(publicSendButton).add(publicInputClose).toggle();
    publicChatButton.add(shoutoutButton).toggle();
    publicChatContainer.css("opacity", 0.4).css("background-color", "rgba(0, 0, 0, 0)");
})

$(".private-input-close").click(() => {
    privateMessageContainer.add(privateChatContainer).css("display", "none");

    privateChatRecipient = null;
})

$(".shoutout-button").click(() => {
    shoutoutInputContainer.toggle();
    shoutoutInput.focus();
})

$(".shoutout-send-button").click(() => {
    const message = shoutoutInput.val();
    if (message.trim() !== "") {
        socket.emit("shoutout-message", message);
        shoutoutButton.prop("disabled", true);
        shoutoutInput.val('');
        shoutoutInputContainer.toggle();
        shoutoutStartTime = window.performance.now();
    }
})

$(".shoutout-input-close").click(() => {
    shoutoutInputContainer.toggle();
    shoutoutInput.focus();
})

$(".change-room-button").click(() => {
    $(".change-room-container").toggle();
})

$(".change-room-close").click(() => {
    $(".change-room-container").toggle();
})

$(".join-room-button").click(() => {
    joinRoom();
})

$(".create-room-button").click(() => {
    let roomCode = '';

    do{
        roomCode = Array.from(Array(8), () => Math.floor(Math.random() * 36).toString(36)).join('');
    } while(rooms.includes(roomCode))

    socket.emit("new-room", roomCode);

    socket.emit("change-room", roomCode);
    $(".change-room-container").toggle();
})

$(".room-text-copy").click(() => {
    let text = $("#room-text").text();
    let tempText = $("<textarea>");
    $("body").append(tempText);
    tempText.val(text).select();
    document.execCommand("copy");
    tempText.remove();
    $(".room-text-copy").toggle();
    $(".room-text-copied").toggle();

    setTimeout(() => {
        $(".room-text-copy").toggle();
        $(".room-text-copied").toggle();
    }, 2 * 1000);
})

$(".search-button, .search-button-close").click(() => {
    $(".player-list-text, #search-input, .search-button, .search-button-close").toggle();
    $("#search-input").val("");
    updatePlayerList(fPlayers)
})

$("#search-input").on("input", function() {
    const query = $(this).val().toLowerCase();
    updatePlayerList(fPlayers, query);
});