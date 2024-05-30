window.addEventListener("keydown", (e) => {
    if(!fPlayers[socket.id]) return;

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
    $("#usernameForm, #formDiv").css("display", "none");
    socket.emit("init", {username, color});
})

$(".publicSendButton").click(() => {sendPublicMessage()})

$(".publicMessageInput").keydown((e) => {
    if(e.key === "Enter"){
        sendPublicMessage();
    }
})
