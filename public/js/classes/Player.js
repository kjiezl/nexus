class Player {
    constructor({x, y, radius, color, username, room}) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.username = username;
        this.room = room;
    }

    draw() {
        // player
        c.beginPath();
        c.arc(
            this.x, 
            this.y, 
            this.radius,
            0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();

        // player name
        c.font = '16px "Radio Canada", sans-serif';
        c.fillStyle = 'white';
        c.textAlign = 'center';
        c.fillText(this.username, this.x, this.y - this.radius - 10);
    }
}
