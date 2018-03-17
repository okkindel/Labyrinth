init = function () {

    mapWidth = map[0].length;
    mapHeight = map.length;

    bindKeys();
    draw();
    cycle();
}
setTimeout(init, 1);

//----------------------------------------------------------

var $ = function (id) {
    return document.getElementById(id);
};
var dc = function (tag) {
    return document.createElement(tag);
};

//----------------------------------------------------------

var player = {
    x: 16,
    y: 10,
    dir: 0,		// the direction that the player is turning, either -1 for left or 1 for right.
    rot: 0,		// the current angle of rotation
    speed: 0,		// is the playing moving forward (speed = 1) or backwards (speed = -1).
    moveSpeed: 0.18,	// how far (in map units) does the player move each step/update
    rotSpeed: 6		// how much does the player rotate each step/update (in degrees)
}

//----------------------------------------------------------

draw = function () {

    let container = $("map");
    let miniMap = $("minimap");
    let mapObjects = $("mapobjects");

    //canvas size
    miniMap.width = mapWidth * mapScale;
    miniMap.height = mapHeight * mapScale;
    mapObjects.width = miniMap.width;
    mapObjects.height = miniMap.height;

    let widthDim = (mapWidth * mapScale) + "px";
    let heightDim = (mapHeight * mapScale) + "px";
    miniMap.style.width = mapObjects.style.width = container.style.width = widthDim;
    miniMap.style.height = mapObjects.style.height = container.style.height = heightDim;

    let ctx = miniMap.getContext("2d");

    // loop through all blocks on the map
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {

            let wall = map[y][x];

            if (wall > 0) {

                ctx.fillStyle = "rgb(0,0,0)";
                ctx.fillRect(
                    x * mapScale,
                    y * mapScale,
                    mapScale,
                    mapScale
                );
            }
        }
    }
    update();
}

//----------------------------------------------------------

update = function () {
    let miniMap = $("minimap");
    let mapObjects = $("mapobjects");

    let objectCtx = mapObjects.getContext("2d");
    objectCtx.clearRect(0, 0, miniMap.width, miniMap.height);

    objectCtx.fillRect(
        // draw a dot at the current player position
        player.x * mapScale - 2,
        player.y * mapScale - 2,
        4, 4
    );

    objectCtx.beginPath();
    objectCtx.moveTo(player.x * mapScale, player.y * mapScale);
    objectCtx.lineTo(
        (player.x + Math.cos(player.rot) * 4) * mapScale,
        (player.y + Math.sin(player.rot) * 4) * mapScale
    );
    objectCtx.closePath();
    objectCtx.stroke();
}

//----------------------------------------------------------

cycle = function () {
    move();
    update();
    setTimeout(cycle, 1000 / 30);
}

//----------------------------------------------------------

bindKeys = function () {

    document.onkeydown = function (event) {
        event = event || window.event;

        switch (event.keyCode) { // which key was pressed?

            case 38: // up
                player.speed = 1;
                break;

            case 40: // down
                player.speed = -1;
                break;

            case 37: // left
                player.dir = -1;
                break;

            case 39: // right
                player.dir = 1;
                break;
        }
    }

    document.onkeyup = function (event) {
        event = event || window.event;

        switch (event.keyCode) {
            case 38:
            case 40:
                player.speed = 0;
                break;
            case 37:
            case 39:
                player.dir = 0;
                break;
        }
    }
}

//----------------------------------------------------------

move = function () {
    let moveStep = player.speed * player.moveSpeed;
    player.rot += player.dir * player.rotSpeed * Math.PI / 180;

    let newX = player.x + Math.cos(player.rot) * moveStep;
    let newY = player.y + Math.sin(player.rot) * moveStep;

    if (isBlocking(newX, newY))
        return;

    player.x = newX;
    player.y = newY;
}

//----------------------------------------------------------

function isBlocking(x, y) {

    if (y < 0 || y > mapHeight || x < 0 || x > mapWidth)
        return true;
    return (map[Math.floor(y)][Math.floor(x)] != 0);
}

//----------------------------------------------------------

// Open space - 0
// Block - 2
// Wall - 1

var map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 3, 0, 3, 0, 0, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 3, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 3, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [1, 0, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 4, 0, 0, 4, 2, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 4, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 4, 3, 3, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

var mapWidth = 0;		// Number of map blocks in x-direction
var mapHeight = 0;		// Number of map blocks in y-direction
var mapScale = 15;	    // How many pixels to draw a map block

//----------------------------------------------------------