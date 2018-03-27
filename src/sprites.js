initSprites = function () {

    addItems();
    for (let i = 0; i < map.length; i++) {
        spritePosition[i] = [];
    }

    let screen = $('screen');
    for (let i = 0; i < mapSprites.length; i++) {
        let sprite = mapSprites[i];
        let itemType = itemTypes[sprite.type];
        let img = document.createElement('img');
        img.src = itemType.img;
        img.style.display = "none";
        img.style.position = "absolute";
        img.style.overflow = "hidden";
        sprite.visible = false;
        sprite.block = itemType.block;
        sprite.img = img;
        spritePosition[sprite.y][sprite.x] = sprite;
        sprites.push(sprite);
        screen.appendChild(img);
    }
}

//----------------------------------------------------------

var sprites = [];
var mapSprites = [];
var spritePosition = [];
var itemTypes = [
    { img: 'src/assets/bush.png', block: false },
];

//----------------------------------------------------------

addItems = function () {
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            let wall = map[y][x];

            if (wall == 0)
                if (Math.random() * 100 < 2) {
                    let item = {
                        type: 0,
                        x: x,
                        y: y
                    }
                    mapSprites.push(item)
                }
        }
    }
}

//----------------------------------------------------------

clearSprites = function () {
    for (let i = 0; i < sprites.length; i++) {
        let sprite = sprites[i];
        sprite.visible = false;
    }
}

//----------------------------------------------------------

renderSprites = function () {
    for (let i = 0; i < sprites.length; i++) {

        let sprite = sprites[i];
        if (sprite.visible) {

            let img = sprite.img;
            img.style.display = "block";

            // translate position to viewer space
            let dx = sprite.x + 0.5 - player.x;
            let dy = sprite.y + 0.5 - player.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let angle = Math.atan2(dy, dx) - player.rotation;
            let size = viewDist / (Math.cos(angle) * distance);

            // x-position on screen
            let x = Math.tan(angle) * viewDist;
            img.style.left = (screenWidth / 2 + x - size / 2) + "px";
            // y is constant
            img.style.top = ((screenHeight - size) / 2) + "px";
            img.style.width = size + "px";
            img.style.height = size + "px";

            // fog on sprite
            img.style.filter = "brightness(" + (100 - 15 * distance) + "%)";
            img.style.zIndex = (size) >> 0;
        } else {
            sprite.img.style.display = "none";
        }
    }
}

//----------------------------------------------------------