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
        enemy.prevStyle = {
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

            let angle = Math.atan2(dy, dx) - player.rotation;
            if ((angle > -fov) && (angle < fov)) {

                let img = enemy.img;
                let size = viewDist / (Math.cos(angle) * distance);
                let x = Math.tan(angle) * viewDist;
                let prevStyle = enemy.prevStyle;

                if (size != prevStyle.height) {
                    img.style.height = size + 'px';
                    prevStyle.height = size;
                }
                // times the total number of states
                if ((size * enemy.numOfStates) != prevStyle.width) {
                    img.style.width = (size * enemy.numOfStates) + 'px';
                    prevStyle.width = (size * enemy.numOfStates);
                }
                if (((screenHeight - size) / 2) != prevStyle.top) {
                    img.style.top = ((screenHeight - size) / 2) + 'px';
                    prevStyle.top = ((screenHeight - size) / 2);
                }
                if ((screenWidth / 2 + x - size / 2 - size * enemy.state) != prevStyle.left) {
                    img.style.left = (screenWidth / 2 + x - size / 2 - size * enemy.state) + 'px';
                    prevStyle.left = (screenWidth / 2 + x - size / 2 - size * enemy.state);
                }
                if (("brightness(" + (100 - 15 * distance) + "%)") != prevStyle.filter) {
                    img.style.filter = ("brightness(" + (100 - 15 * distance) + "%)");
                    prevStyle.filter = ("brightness(" + (100 - 15 * distance) + "%)");
                }
                if (Math.floor(size) != prevStyle.zIndex) {
                    img.style.zIndex = Math.floor(size);
                    prevStyle.zIndex = Math.floor(size);
                }
                if ('block' != prevStyle.display) {
                    img.style.display = 'block';
                    prevStyle.display = 'block';
                }

                if (('rect(0, ' + (size * (enemy.state + 1)) + ', ' + size + ', ' + (size * (enemy.state)) + ')') != prevStyle.clip) {
                    img.style.clip = ('rect(0, ' + (size * (enemy.state + 1)) + ', ' + size + ', ' + (size * (enemy.state)) + ')');
                    prevStyle.clip = ('rect(0, ' + (size * (enemy.state + 1)) + ', ' + size + ', ' + (size * (enemy.state)) + ')');
                }
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