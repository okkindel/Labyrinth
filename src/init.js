window.onload = function () {

    mapWidth = map[0].length;
    mapHeight = map.length;

    addKeys();
    initScreen();
    initSprites();
    initEnemies();
    drawMap();
    gameCycle();
    renderCycle();
}

//----------------------------------------------------------

var $ = function (id) {
    return document.getElementById(id);
};

//----------------------------------------------------------

var lastGameCycleTime = 0;
var gameCycleDelay = 1000 / 30;

//----------------------------------------------------------

gameCycle = function () {

    var now = new Date().getTime();
    var timeDelta = now - lastGameCycleTime;

    move(timeDelta);

    var cycleDelay = gameCycleDelay;
    if (timeDelta > cycleDelay) {
        cycleDelay = Math.max(1, cycleDelay - (timeDelta - cycleDelay))
    }
    lastGameCycleTime = now;
    setTimeout(gameCycle, cycleDelay);
}

//----------------------------------------------------------

renderCycle = function () {

    updateMap();
    clearSprites();
    castRays();
    renderSprites();
    renderEnemies();
    updateBackground();

    setTimeout(renderCycle, gameCycleDelay);
}

//----------------------------------------------------------