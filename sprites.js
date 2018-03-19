initSprites = function () {
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

var spriteMap;
var visibleSprites = [];
var oldVisibleSprites = [];
var itemTypes = [
    { img: 'sprites/bush.png', block: false },
];

//----------------------------------------------------------

var mapItems = [
    { type: 0, x: 16, y: 14 },
    { type: 0, x: 15, y: 17 },
    { type: 0, x: 14, y: 15 },
    { type: 0, x: 14, y: 16 },
    { type: 0, x: 19, y: 22 },
    { type: 0, x: 08, y: 18 },
    { type: 0, x: 17, y: 18 }
];

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
    
		var dbx = sprite.x - player.x;
		var dby = sprite.y - player.y;

		img.style.width = size + "px";
		img.style.height =  size + "px";

		// var blockDist = dbx*dbx + dby*dby;
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