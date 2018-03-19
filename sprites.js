initSprites = function () {

    addItems();
    spriteMap = [];
    for (var y = 0; y < map.length; y++) {
        spriteMap[y] = [];
    }

    var screen = $('screen');
    for (var i = 0; i < mapItems.length; i++) {
        var sprite = mapItems[i];
        var itemType = itemTypes[sprite.type];
        var img = dc('img');
        img.src = itemType.img;
        img.style.display = 'none';
        img.style.position = 'absolute';
        sprite.visible = false;
        sprite.block = itemType.block;
        sprite.img = img;
        spriteMap[sprite.y][sprite.x] = sprite;
        screen.appendChild(img);
    }
}

//----------------------------------------------------------

var mapItems = [];
var spriteMap = [];
var visibleSprites = [];
var oldVisibleSprites = [];
var itemTypes = [
    { img: 'sprites/bush.png', block: false },
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
                    mapItems.push(item)
                }
        }
    }
}

//----------------------------------------------------------

clearSprites = function () {
    // Clear the visible sprites array but keep
    // a copy in oldVisibleSprites for later.
    // Also mark all the sprites as not visible
    // so they can be added to visibleSprites
    // again during raycasting.
    oldVisibleSprites = [];
    for (var i = 0; i < visibleSprites.length; i++) {
        var sprite = visibleSprites[i];
        oldVisibleSprites[i] = sprite;
        sprite.visible = false;
    }
    visibleSprites = [];
}

//----------------------------------------------------------

renderSprites = function () {
    for (let i = 0; i < visibleSprites.length; i++) {

        let sprite = visibleSprites[i];
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
        img.style.zIndex = Math.floor(size);
    }

    // hide the sprites that are no longer visible
    for (let i = 0; i < oldVisibleSprites.length; i++) {
        let sprite = oldVisibleSprites[i];
        if (visibleSprites.indexOf(sprite) < 0) {
            sprite.visible = false;
            sprite.img.style.display = "none";
        }
    }
}