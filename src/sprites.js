initSprites = function () {

    addItems();
    spriteMap = [];
    for (let y = 0; y < map.length; y++) {
        spriteMap[y] = [];
    }

    var screen = $('screen');
    for (let i = 0; i < items.length; i++) {
        let sprite = items[i];
        let itemType = itemTypes[sprite.type];
        let img = document.createElement('img');
        img.src = itemType.img;
        img.style.display = "none";
        img.style.position = "absolute";
        img.style.overflow = "hidden";
        sprite.visible = false;
        sprite.block = itemType.block;
        sprite.img = img;
        spriteMap[sprite.y][sprite.x] = sprite;
        screen.appendChild(img);
    }
}

//----------------------------------------------------------

var items = [];
var spriteMap = [];
var visible = [];
var nonVisible = [];
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
                    items.push(item)
                }
        }
    }
}

//----------------------------------------------------------

clearSprites = function () {
    nonVisible = [];
    for (var i = 0; i < visible.length; i++) {
        var sprite = visible[i];
        nonVisible[i] = sprite;
        sprite.visible = false;
    }
    visible = [];
}

//----------------------------------------------------------

renderSprites = function () {
    for (let i = 0; i < visible.length; i++) {

        let sprite = visible[i];
        let img = sprite.img;
        img.style.display = "block";

        // translate position to viewer space
        let dx = sprite.x + 0.5 - player.x;
        let dy = sprite.y + 0.5 - player.y;

        let distance = Math.sqrt(dx * dx + dy * dy);
        let spriteAngle = Math.atan2(dy, dx) - player.rotation;
        let size = viewDist / (Math.cos(spriteAngle) * distance);

        if (size <= 0) continue;

        // x-position on screen
        let x = Math.tan(spriteAngle) * viewDist;
        img.style.left = (screenWidth / 2 + x - size / 2) + "px";
        // y is constant
        img.style.top = ((screenHeight - size) / 2) + "px";

        img.style.width = size + "px";
        img.style.height = size + "px";

        // fog on sprite
        img.style.filter = "brightness(" + (100 - 15 * distance) + "%)";
        img.style.zIndex = Math.floor(size);
    }

    // hide the sprites that are no longer visible
    for (let i = 0; i < nonVisible.length; i++) {
        let sprite = nonVisible[i];
        if (visible.indexOf(sprite) < 0) {
            sprite.visible = false;
            sprite.img.style.display = "none";
        }
    }
}