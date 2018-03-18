var player = {
    x: 15.5,
    y: 16.5,
    dir: 0,		// -1 for left or 1 for right
    rot: 0,		// the current angle of rotation
    speed: 0,		// forward 1 backwards -1
    moveSpeed: 0.1,	// step/update
    rotSpeed: 6		// rotate each update (in degrees)
}

//----------------------------------------------------------

update = function () {
    let miniMap = $("minimap");
    let mapObjects = $("mapobjects");

    let objectCtx = mapObjects.getContext("2d");
    objectCtx.clearRect(0, 0, miniMap.width, miniMap.height);

    objectCtx.fillRect(
        // draw a dot at the current player positionition
        player.x * mapScale - 2,
        player.y * mapScale - 2,
        4, 4
    );
}

//----------------------------------------------------------

move = function () {
    let moveStep = player.speed * player.moveSpeed;
    player.rot += player.dir * player.rotSpeed * Math.PI / 180;
    while (player.rot < 0) player.rot += Math.PI * 2;
    while (player.rot >= Math.PI * 2) player.rot -= Math.PI * 2;

    let newX = player.x + Math.cos(player.rot) * moveStep;
    let newY = player.y + Math.sin(player.rot) * moveStep;

    let position = isCollision(player.x, player.y, newX, newY, 0.35);
    player.x = position.x; // set new positionition
    player.y = position.y;
}

//----------------------------------------------------------

isCollision = function (fromX, fromY, toX, toY, radius) {

    let position = {
        x: fromX,
        y: fromY
    };

    if (toY < 0 || toY >= mapHeight || toX < 0 || toX >= mapWidth)
        return position;

    let blockX = Math.floor(toX);
    let blockY = Math.floor(toY);

    if (isBlocking(blockX, blockY)) {
        return position;
    }

    position.x = toX;
    position.y = toY;

    let top = isBlocking(blockX, blockY - 1);
    let bottom = isBlocking(blockX, blockY + 1);
    let left = isBlocking(blockX - 1, blockY);
    let right = isBlocking(blockX + 1, blockY);

    if (top != 0 && toY - blockY < radius) {
        toY = position.y = blockY + radius;
    }
    if (bottom != 0 && blockY + 1 - toY < radius) {
        toY = position.y = blockY + 1 - radius;
    }
    if (left != 0 && toX - blockX < radius) {
        toX = position.x = blockX + radius;
    }
    if (right != 0 && blockX + 1 - toX < radius) {
        toX = position.x = blockX + 1 - radius;
    }

    // is tile to the top-left a wall
    if (isBlocking(blockX - 1, blockY - 1) != 0 && !(top != 0 && left != 0)) {
        var dx = toX - blockX;
        var dy = toY - blockY;
        if (dx * dx + dy * dy < radius * radius) {
            if (dx * dx > dy * dy)
                toX = position.x = blockX + radius;
            else
                toY = position.y = blockY + radius;
        }
    }
    // is tile to the top-right a wall
    if (isBlocking(blockX + 1, blockY - 1) != 0 && !(top != 0 && right != 0)) {
        var dx = toX - (blockX + 1);
        var dy = toY - blockY;
        if (dx * dx + dy * dy < radius * radius) {
            if (dx * dx > dy * dy)
                toX = position.x = blockX + 1 - radius;
            else
                toY = position.y = blockY + radius;
        }
    }
    // is tile to the bottom-left a wall
    if (isBlocking(blockX - 1, blockY + 1) != 0 && !(bottom != 0 && bottom != 0)) {
        var dx = toX - blockX;
        var dy = toY - (blockY + 1);
        if (dx * dx + dy * dy < radius * radius) {
            if (dx * dx > dy * dy)
                toX = position.x = blockX + radius;
            else
                toY = position.y = blockY + 1 - radius;
        }
    }
    // is tile to the bottom-right a wall
    if (isBlocking(blockX + 1, blockY + 1) != 0 && !(bottom != 0 && right != 0)) {
        var dx = toX - (blockX + 1);
        var dy = toY - (blockY + 1);
        if (dx * dx + dy * dy < radius * radius) {
            if (dx * dx > dy * dy)
                toX = position.x = blockX + 1 - radius;
            else
                toY = position.y = blockY + 1 - radius;
        }
    }

    return position;
}

//----------------------------------------------------------

function isBlocking(x, y) {

    if (y < 0 || y >= mapHeight || x < 0 || x >= mapWidth)
        return true;
    return (map[Math.floor(y)][Math.floor(x)] != 0);
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