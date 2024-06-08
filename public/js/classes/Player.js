class Player {
    constructor({x, y, radius, color, username, room}) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.username = username;
        this.room = room;
    }

    draw(c, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        // player
        c.beginPath();
        c.arc(
            screenX, 
            screenY, 
            this.radius,
            0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();

        // player name
        c.font = '16px "Radio Canada", sans-serif';
        c.fillStyle = 'white';
        c.textAlign = 'center';
        c.fillText(this.username, screenX, screenY - this.radius - 10);
    }
}
