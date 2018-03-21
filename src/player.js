var player = {
    x: 15.5,
    y: 16.5,
    direction: 0,		// right 1 left -1
    rotation: 0,		// the current angle of rotationation
    vertical: 0,		// forward 1 backwards -1
    moveSpeed: 0.1,	    // step/update
    rotationSpeed: 6,	// rotation each update (in degrees)
    horizontal: false   // right 1 left -1
}

//----------------------------------------------------------

update = function () {
    let miniMap = $("minimap");
    let objects = $("objects");

    let objectCtx = objects.getContext("2d");
    objectCtx.clearRect(0, 0, miniMap.width, miniMap.height);

    objectCtx.fillStyle = "black";
    objectCtx.fillRect(
        player.x * mapScale - 2,
        player.y * mapScale - 2,
        4, 4
    );

    // enemy drawing
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        objectCtx.fillStyle = "black";
        objectCtx.fillRect(	
            enemy.x * mapScale - 2,
            enemy.y * mapScale - 2,
            4, 4
        );
    }
}

//----------------------------------------------------------

move = function () {

    let moveStep
    if (!player.horizontal) {
        moveStep = player.vertical * player.moveSpeed;
        player.rotation += player.direction * player.rotationSpeed * Math.PI / 180;
    }
    else
        moveStep = player.direction * player.moveSpeed;

    while (player.rotation < 0) player.rotation += Math.PI * 2;
    while (player.rotation >= Math.PI * 2) player.rotation -= Math.PI * 2;

    let newX, newY;
    if (!player.horizontal) {
        newX = player.x + Math.cos(player.rotation) * moveStep;
        newY = player.y + Math.sin(player.rotation) * moveStep;
    } else {
        newX = player.x + Math.cos(player.rotation + 90 * Math.PI / 180) * moveStep;
        newY = player.y + Math.sin(player.rotation + 90 * Math.PI / 180) * moveStep;
    }

    let position = checkCollision(player.x, player.y, newX, newY, 0.35);
    player.x = position.x;
    player.y = position.y;
}

//----------------------------------------------------------

checkCollision = function (fromX, fromY, toX, toY, radius) {

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
    if (spritePosition[Math.floor(y)][Math.floor(x)] && spritePosition[Math.floor(y)][Math.floor(x)].block)
        return true;
    return false;
}

//----------------------------------------------------------

function drawRay(rayX, rayY) {
    let objects = $("objects");
    let objectCtx = objects.getContext("2d");

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