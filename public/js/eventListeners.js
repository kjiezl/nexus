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

document.querySelector("#usernameForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = $("#usernameInput").val();
    const color = $("#colorInput").val();
    const room = $("#roomInput").val();
    if(!username){
        alert("Please enter username")
        return;
    }
    if(room){
        socket.emit("join-room", room);
    }
    $("#usernameForm, #formDiv, .options-container, .public-chat-button, .private-chat-button, .top-options-container").toggle();
    socket.emit("init", {username, color, room});
})

$(".public-send-button").click(() => {
    sendPublicMessage();
})

$(".public-chat-button").click(() => {
    publicMessageContainer.add(publicMessageInput).add(publicSendButton).add(publicInputClose).css("display", "block");
    publicChatButton.add(shoutoutButton).toggle();
    publicMessageInput.focus();
    publicChatContainer.css("opacity", 1);
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
    publicChatContainer.css("opacity", 0.4);
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