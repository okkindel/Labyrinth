var player = {
    x: 15.5,
    y: 16.5,
    direction: 0,		// -1 for left or 1 for right
    rotation: 0,		// the current angle of rotationation
    horizontal: 0,
    vertical: 0,		    // forward 1 backwards -1
    moveSpeed: 0.1,	    // step/update
    rotationvertical: 6	// rotationate each update (in degrees)
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
    
    let moveStep;
    if (player.vertical)
        moveStep = player.vertical * player.moveSpeed;
    else
        moveStep = player.horizontal * player.moveSpeed;

    player.rotation += player.direction * player.rotationvertical * Math.PI / 180;
    while (player.rotation < 0) player.rotation += Math.PI * 2;
    while (player.rotation >= Math.PI * 2) player.rotation -= Math.PI * 2;

    let newX, newY;
    if (player.vertical) {
        newX = player.x + Math.cos(player.rotation) * moveStep;
        newY = player.y + Math.sin(player.rotation) * moveStep;
    } else {
        newX = player.x + Math.cos(player.rotation + 90 * Math.PI / 180) * moveStep;
        newY = player.y + Math.sin(player.rotation + 90 * Math.PI / 180) * moveStep;
    }

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
    if (map[Math.floor(y)][Math.floor(x)] != 0)
        return true;
    if (spriteMap[Math.floor(y)][Math.floor(x)] && spriteMap[Math.floor(y)][Math.floor(x)].block)
        return true;
    return false;
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

keys = function () {

    document.onkeydown = function (event) {
        event = event || window.event;

        // which key was pressed?
        switch (event.keyCode) {

            case 38: // up
                player.vertical = 1;
                break;

            case 40: // down
                player.vertical = -1;
                break;

            case 65: // left
                player.horizontal = -1;
                break;

            case 68: // right
                player.horizontal = 1;
                break;

            case 37: // left
                player.direction = -1;
                break;

            case 39: // right
                player.direction = 1;
                break;
        }
    }

    document.onkeyup = function (event) {
        event = event || window.event;

        switch (event.keyCode) {
            case 38:
            case 40:
            case 65:
            case 68:
                player.vertical = 0;
                player.horizontal = 0;
                break;
            case 37:
            case 39:
                player.direction = 0;
                break;
        }
    }
}

//----------------------------------------------------------