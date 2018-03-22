initEnemies = function () {

    addEnemies();
    var screen = $('screen');
    for (let i = 0; i < mapEnemies.length; i++) {
        let enemy = mapEnemies[i];
        let type = enemyTypes[enemy.type];
        let img = document.createElement('img');
        img.src = type.img;
        img.style.display = "none";
        img.style.position = "absolute";

        enemy.state = 0;
        enemy.rot = 0;
        enemy.dir = 0;
        enemy.speed = 0;
        enemy.moveSpeed = type.moveSpeed;
        enemy.rotSpeed = type.rotSpeed;
        enemy.numOfStates = type.numOfStates;
        enemy.oldStyles = {
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            clip: '',
            display: 'none',
            zIndex: 0
        };
        enemy.img = img;
        enemies.push(enemy);
        screen.appendChild(img);
    }
}

//----------------------------------------------------------

var enemies = [];
var mapEnemies = [];

//----------------------------------------------------------

var enemyTypes = [
    {
        img: 'src/assets/rat.png',
        moveSpeed: 0.05,
        rotSpeed: 3,
        numOfStates: 9
    }
];

//----------------------------------------------------------

addEnemies = function () {

    let enemy = {
        type: 0,
        x: 8.5,
        y: 27.5
    }
    mapEnemies.push(enemy);
}

//----------------------------------------------------------

renderEnemies = function () {
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        let dx = enemy.x - player.x;
        let dy = enemy.y - player.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
            let img = enemy.img;
            let angle = Math.atan2(dy, dx) - player.rotation;
            let size = viewDist / (Math.cos(angle) * distance);
            let x = Math.tan(angle) * viewDist;
            let style = img.style;
            let oldStyles = enemy.oldStyles;

            if (size != oldStyles.height) {
                style.height = size + 'px';
                oldStyles.height = size;
            }
            // times the total number of states
            let styleWidth = size * enemy.numOfStates;
            if (styleWidth != oldStyles.width) {
                style.width = styleWidth + 'px';
                oldStyles.width = styleWidth;
            }
            let styleTop = ((screenHeight - size) / 2);
            if (styleTop != oldStyles.top) {
                style.top = styleTop + 'px';
                oldStyles.top = styleTop;
            }
            let styleLeft = (screenWidth / 2 + x - size / 2 - size * enemy.state);
            if (styleLeft != oldStyles.left) {
                style.left = styleLeft + 'px';
                oldStyles.left = styleLeft;
            }
            let styleBright = "brightness(" + (100 - 15 * distance) + "%)"; 'block';
            if (styleBright != oldStyles.filter) {
                style.filter = styleBright;
                oldStyles.filter = styleBright;
            }
            let styleZIndex = Math.floor(size);
            if (styleZIndex != oldStyles.zIndex) {
                style.zIndex = styleZIndex;
                oldStyles.zIndex = styleZIndex;
            }
            let styleDisplay = 'block';
            if (styleDisplay != oldStyles.display) {
                style.display = styleDisplay;
                oldStyles.display = styleDisplay;
            }
            let styleClip = 'rect(0, ' +
                (size * (enemy.state + 1)) + ', ' +
                size + ', ' +
                (size * (enemy.state)) + ')';
            if (styleClip != oldStyles.clip) {
                style.clip = styleClip;
                oldStyles.clip = styleClip;
            }
        }
    }
    enemyAI();
}

//----------------------------------------------------------

enemyAI = function () {

    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if ((distance > 2) && (distance < 8)) {
            let angle = Math.atan2(dy, dx);
            enemy.rotDeg = angle * 180 / Math.PI;
            enemy.rot = angle;
            enemy.speed = 1;
            let walkCycleTime = 1000;
            let numWalkSprites = 7;
            enemy.state = Math.floor((new Date() % walkCycleTime) / (walkCycleTime / numWalkSprites)) + 1;
        } else {
            enemy.state = 0;
            enemy.speed = 0;
        }
        enemyMove(enemies[i]);
    }
}

//----------------------------------------------------------

enemyMove = function (enemy) {

    let moveStep = enemy.speed * enemy.moveSpeed;
    let newX = enemy.x + Math.cos(enemy.rot) * moveStep;
    let newY = enemy.y + Math.sin(enemy.rot) * moveStep;

    // lets take player's collision checker
    let pos = checkCollision(enemy.x, enemy.y, newX, newY, 0.35);
    enemy.x = pos.x;
    enemy.y = pos.y;
}

//----------------------------------------------------------