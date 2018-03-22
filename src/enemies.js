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

        if (distance < 8) {

            let angle = Math.atan2(dy, dx) - player.rotation;
            if ((angle > -Math.PI * 180 / fov) && (angle < Math.PI * 180 / fov)) {

                let img = enemy.img;
                let size = viewDist / (Math.cos(angle) * distance);
                let x = Math.tan(angle) * viewDist;
                let style = img.style;
                let oldStyles = enemy.oldStyles;

                style.height = size + 'px';
                // times the total number of states
                style.width = (size * enemy.numOfStates) + 'px';
                style.top = ((screenHeight - size) / 2) + 'px';
                style.left = (screenWidth / 2 + x - size / 2 - size * enemy.state) + 'px';
                style.filter = ("brightness(" + (100 - 15 * distance) + "%)");
                style.zIndex = Math.floor(size);
                style.display = 'block';
                style.clip = ('rect(0, ' + (size * (enemy.state + 1)) + ', ' + size + ', ' + (size * (enemy.state)) + ')');
            }
            enemyAI(enemy);
        }
    }
}

//----------------------------------------------------------

enemyAI = function (enemy) {

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
    enemyMove(enemy);
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