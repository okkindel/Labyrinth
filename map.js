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
    dir: 0,		// -1 for left or 1 for right
    rot: 0,		// the current angle of rotation
    speed: 0,		// forward 1 backwards -1
    moveSpeed: 0.18,	// step/update
    rotSpeed: 6		// rotate each update (in degrees)
}

var mapWidth = 0;		// Number of map blocks in x-direction
var mapHeight = 0;		// Number of map blocks in y-direction
var mapScale = 15;	    // How many pixels to draw a map block

var screenWidth = 640;
var stripWidth = 4;
var fov = 60 * Math.PI / 180;
var numRays = Math.ceil(screenWidth / stripWidth);
var viewDist = (screenWidth / 2) / Math.tan((fov / 2));

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
    castRays();
    setTimeout(cycle, 1000 / 30);
}

//----------------------------------------------------------

bindKeys = function () {

    document.onkeydown = function (event) {
        event = event || window.event;

        // which key was pressed?
        switch (event.keyCode) {

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
    while (player.rot < 0) player.rot += Math.PI * 2;
    while (player.rot >= Math.PI * 2) player.rot -= Math.PI * 2;

    let newX = player.x + Math.cos(player.rot) * moveStep;
    let newY = player.y + Math.sin(player.rot) * moveStep;

    if (isBlocking(newX, newY))
        return;

    player.x = newX;
    player.y = newY;
}

//----------------------------------------------------------

isBlocking = function (x, y) {

    if (y < 0 || y > mapHeight || x < 0 || x > mapWidth)
        return true;
    return (map[Math.floor(y)][Math.floor(x)] != 0);
}

//----------------------------------------------------------

castRays = function () {
    let stripIdx = 0;

    for (let i = 0; i < numRays; i++) {
        // where on the screen does ray go through?
        let rayScreenPos = (-numRays / 2 + i) * stripWidth;
        // the distance from the viewer to the point on the screen, simply Pythagoras.
        let rayViewDist = Math.sqrt(rayScreenPos * rayScreenPos + viewDist * viewDist);
        // the angle of the ray, relative to the viewing direction a = sin(A) * c
        let rayAngle = Math.asin(rayScreenPos / rayViewDist);

        castRay(
            player.rot + rayAngle, 	// add the players viewing direction to get the angle in world space
            stripIdx++
        );
    }
}

//----------------------------------------------------------

castRay = function (rayAngle, stripIdx) {

    // first make sure the angle is between 0 and 360 degrees
    rayAngle %= Math.PI * 2;
    if (rayAngle < 0) rayAngle += Math.PI * 2;

    // moving right/left? up/down? Determined by which quadrant the angle is in.
    let right = (rayAngle > Math.PI * 2 * 0.75 || rayAngle < Math.PI * 2 * 0.25);
    let up = (rayAngle < 0 || rayAngle > Math.PI);

    // only do these once
    let angleSin = Math.sin(rayAngle);
    let angleCos = Math.cos(rayAngle);

    let dist = 0;
    let xHit = 0;
    let yHit = 0;

    let textureX;	// part of the texture are we going to render
    let wallX;	// the (x,y) map coords of the block
    let wallY;


    // first check against the vertical map/wall lines
    // we do this by moving to the right or left edge of the block we're standing in
    // and then moving in 1 map unit steps horizontally. The amount we have to move vertically
    // is determined by the slope of the ray, which is simply defined as sin(angle) / cos(angle).

    let slope = angleSin / angleCos; 	// the slope of the straight line made by the ray
    let dX = right ? 1 : -1; 	// we move either 1 map unit to the left or right
    let dY = dX * slope; 		// how much to move up or down

    let x = right ? Math.ceil(player.x) : Math.floor(player.x);	// starting horizontal position, at one of the edges of the current map block
    let y = player.y + (x - player.x) * slope;			// starting vertical position. We add the small horizontal step we just made, multiplied by the slope.

    while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
        let wallX = Math.floor(x + (right ? 0 : -1));
        let wallY = Math.floor(y);

        // is this point inside a wall block?
        if (map[wallY][wallX] > 0) {

            let distX = x - player.x;
            let distY = y - player.y;
            dist = distX * distX + distY * distY;	// the distance from the player to this point, squared.

            textureX = y % 1;	// where exactly are we on the wall? textureX is the x coordinate on the texture that we'll use when texturing the wall.
            if (!right) textureX = 1 - textureX; // if we're looking to the left side of the map, the texture should be reversed

            xHit = x;	// save the coordinates of the hit. We only really use these to draw the rays on minimap.
            yHit = y;

            break;
        }
        x += dX;
        y += dY;
    }

    // now check against horizontal lines. It's basically the same, just "turned around".
    // the only difference here is that once we hit a map block, 
    // we check if there we also found one in the earlier, vertical run. We'll know that if dist != 0.
    // If so, we only register this hit if this distance is smaller.

    let slope = angleCos / angleSin;
    let dY = up ? -1 : 1;
    let dX = dY * slope;
    let y = up ? Math.floor(player.y) : Math.ceil(player.y);
    let x = player.x + (y - player.y) * slope;

    while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
        let wallY = Math.floor(y + (up ? -1 : 0));
        let wallX = Math.floor(x);
        if (map[wallY][wallX] > 0) {
            let distX = x - player.x;
            let distY = y - player.y;
            let blockDist = distX * distX + distY * distY;
            if (!dist || blockDist < dist) {
                dist = blockDist;
                xHit = x;
                yHit = y;
                textureX = x % 1;
                if (up) textureX = 1 - textureX;
            }
            break;
        }
        x += dX;
        y += dY;
    }

    if (dist) {
        drawRay(xHit, yHit);
    }

}

//----------------------------------------------------------

function drawRay(rayX, rayY) {
    let mapObjects = $("mapobjects");
    let objectCtx = mapObjects.getContext("2d");

    objectCtx.strokeStyle = "rgba(100,100,100,0.3)";
    objectCtx.lineWidth = 0.5;
    objectCtx.beginPath();
    objectCtx.moveTo(player.x * mapScale, player.y * mapScale);
    objectCtx.lineTo(
        rayX * mapScale,
        rayY * mapScale
    );
    objectCtx.closePath();
    objectCtx.stroke();
}

//----------------------------------------------------------

// Open space - 0
// Wall - 1

var map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]




];

//----------------------------------------------------------