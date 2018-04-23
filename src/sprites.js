initSprites = function () {

    addItems();
    for (var i = 0; i < map.length; i++) {
        spritePosition[i] = [];
    }

    var screen = $('screen');
    for (var i = 0; i < mapSprites.length; i++) {
        var sprite = mapSprites[i];
        var itemType = itemTypes[sprite.type];
        var img = document.createElement('img');
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
    for (var y = 0; y < mapHeight; y++) {
        for (var x = 0; x < mapWidth; x++) {
            var wall = map[y][x];

            if (wall == 0)
                if (Math.random() * 100 < 2) {
                    var item = {
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
    for (var i = 0; i < sprites.length; i++) {
        var sprite = sprites[i];
        sprite.visible = false;
    }
}

//----------------------------------------------------------

renderSprites = function () {
    for (var i = 0; i < sprites.length; i++) {

        var sprite = sprites[i];
        if (sprite.visible) {

            var img = sprite.img;
            img.style.display = "block";

            // translate position to viewer space
            var dx = sprite.x + 0.5 - player.x;
            var dy = sprite.y + 0.5 - player.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            var angle = Math.atan2(dy, dx) - player.rotation;
            var size = viewDist / (Math.cos(angle) * distance);

            // x-position on screen
            var x = Math.tan(angle) * viewDist;
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