window.addEventListener("keydown", (e) => {
    if(!fPlayers[socket.id]) return;

    const publicMessageInput = $(".publicMessageInput");
    if(!publicMessageInput.is(":focus")){
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
    if(!username){
        alert("Please enter username")
        return;
    }
    $("#usernameForm, #formDiv, .options-container, .public-chat-button, .private-chat-button").toggle();
    socket.emit("init", {username, color});
})

$(".public-send-button").click(() => {
    sendPublicMessage();
})

$(".public-chat-button").click(() => {
    const publicMessageInput = $(".publicMessageInput");
    const publicMessageContainer = $(".public-message-container");
    const publicSendButton = $(".public-send-button");
    const publicInputClose = $(".public-input-close");
    const publicChatButton = $(".public-chat-button");
    const publicChatContainer = $(".public-chat-container");

    publicMessageContainer.add(publicMessageInput).add(publicSendButton).add(publicInputClose).css("display", "block");
    publicChatButton.toggle();
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
    const publicMessageInput = $(".publicMessageInput");
    const publicMessageContainer = $(".public-message-container");
    const publicSendButton = $(".public-send-button");
    const publicInputClose = $(".public-input-close");
    const publicChatButton = $(".public-chat-button");
    const publicChatContainer = $(".public-chat-container");

    publicMessageContainer.add(publicMessageInput).add(publicSendButton).add(publicInputClose).toggle();
    publicChatButton.toggle();
    publicChatContainer.css("opacity", 0.4);
})

$(".private-input-close").click(() => {
    const privateMessageContainer = $(".private-message-container");
    const privateChatContainer = $(".private-chat-container");

    privateMessageContainer.add(privateChatContainer).css("display", "none");

    privateChatRecipient = null;
})