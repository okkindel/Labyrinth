var player = {
    x: 15.5,
    y: 16.5,
    direction: 0,		// right 1 left -1
    rotation: 0,		// the current angle of rotationation
    vertical: 0,		// forward 1 backwards -1
    moveSpeed: 0.075,	    // step/update
    rotationSpeed: 5,	// rotation each update (in degrees)
    horizontal: false   // right 1 left -1
}

//----------------------------------------------------------

move = function (timeDelta) {

    var move_abs = timeDelta / gameCycleDelay;
    var moveStep
    if (!player.horizontal) {
        moveStep = move_abs * player.vertical * player.moveSpeed;
        player.rotation += move_abs * player.direction * player.rotationSpeed * Math.PI / 180;
    }
    else
        moveStep = move_abs * player.direction * player.moveSpeed;

    while (player.rotation < 0) player.rotation += Math.PI * 2;
    while (player.rotation >= Math.PI * 2) player.rotation -= Math.PI * 2;

    var newX, newY;
    if (!player.horizontal) {
        newX = player.x + Math.cos(player.rotation) * moveStep;
        newY = player.y + Math.sin(player.rotation) * moveStep;
    } else {
        newX = player.x + Math.cos(player.rotation + 90 * Math.PI / 180) * moveStep;
        newY = player.y + Math.sin(player.rotation + 90 * Math.PI / 180) * moveStep;
    }

    var position = checkCollision(player.x, player.y, newX, newY, 0.35);
    player.x = position.x;
    player.y = position.y;
}

//----------------------------------------------------------

checkCollision = function (fromX, fromY, toX, toY, radius) {

    var position = {
        x: fromX,
        y: fromY
    };

    if (toY < 0 || toY >= mapHeight || toX < 0 || toX >= mapWidth)
        return position;

    var blockX = toX >> 0;
    var blockY = toY >> 0;

    if (isBlocking(blockX, blockY)) {
        return position;
    }

    position.x = toX;
    position.y = toY;

    var top = isBlocking(blockX, blockY - 1);
    var bottom = isBlocking(blockX, blockY + 1);
    var left = isBlocking(blockX - 1, blockY);
    var right = isBlocking(blockX + 1, blockY);

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
    if (map[y >> 0][x >> 0] != 0)
        return true;
    if (spritePosition[y >> 0][(x) >> 0] && spritePosition[y >> 0][x >> 0].block)
        return true;
    return false;
}

//----------------------------------------------------------

function drawRay(rayX, rayY) {
    var objects = $("objects");
    var objectCtx = objects.getContext("2d");

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

addKeys = function () {

    document.onkeydown = function (event) {
        event = event || window.event;

        switch (event.keyCode) {

            case 38: // up
                player.vertical = 1; break;
            case 40: // down
                player.vertical = -1; break;
            case 16: // horizontal
                player.horizontal = true; break;
            case 37: // left
                player.direction = -1; break;
            case 39: // right
                player.direction = 1; break;
        }
    }

    document.onkeyup = function (event) {
        event = event || window.event;

        switch (event.keyCode) {
            case 38: case 40:
                player.vertical = 0;
                break;
            case 16:
                player.horizontal = false;
                break;
            case 37: case 39:
                player.direction = 0;
                break;
        }
    }
}

//----------------------------------------------------------