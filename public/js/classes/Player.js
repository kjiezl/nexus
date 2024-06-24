class Player {
    constructor({x, y, radius, color, username, room, accessory, direction = "right"}) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.username = username;
        this.room = room;
        this.accessory = accessory;
        this.direction = direction;
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
        c.fillText(this.username, screenX, screenY - this.radius - 15);

        // accessory
        if (this.accessory) {
            const img = accessories[this.accessory];
            if (img) {
                let imgSize = '';
                if(this.accessory === "mask"){
                    imgSize = this.radius * 2.9;
                } else {
                    imgSize = this.radius * 2;
                }
                c.save();
                if (this.direction === "left") {
                    c.translate(screenX, screenY);
                    c.scale(-1, 1);
                    if(this.accessory === "mask"){
                        c.drawImage(img, -imgSize / 2, -imgSize + 20, imgSize, imgSize);
                    } else{
                        c.drawImage(img, -imgSize / 2, -imgSize, imgSize, imgSize);
                    }
                } else {
                    if(this.accessory === "mask"){
                        c.translate(screenX - imgSize / 2, screenY - imgSize + 20);
                        c.drawImage(img, 0, 0, imgSize, imgSize);
                    } else{
                        c.translate(screenX - imgSize / 2, screenY - imgSize);
                        c.drawImage(img, 0, 0, imgSize, imgSize);
                    }
                }
                c.restore();
            }
        }
    }
}
