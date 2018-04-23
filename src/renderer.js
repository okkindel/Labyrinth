function initScreen() {

    var screen = $("screen");

    screen.style.height = screenHeight + 'px';
    screen.style.width = screenWidth + 'px';

    for (var i = 0; i < screenWidth; i += stripWidth) {
        var strip = document.createElement("div");
        strip.style.position = "absolute";
        strip.style.left = i + "px";
        strip.style.width = stripWidth + "px";
        strip.style.overflow = "hidden";

        var img = new Image();
        img.src = ("src/assets/walls.png");
        img.style.position = "absolute";
        img.prevStyle = {
            height: 0,
            width: 0,
            top: 0,
            left: 0
        }
        strip.appendChild(img);
        strip.img = img;

        var fog = document.createElement("span");
        fog.style.position = "absolute";
        strip.appendChild(fog);
        strip.fog = fog;

        screenStrips.push(strip);
        screen.appendChild(strip);
    }
}
//----------------------------------------------------------

var screenWidth = 1024;
var screenHeight = 768;
var screenStrips = [];
var numoftex = 3;
var stripWidth = 2;
var fov = 80 * Math.PI / 180;
var numofrays = Math.ceil(screenWidth / stripWidth);
var viewDist = (screenWidth / 2) / Math.tan((fov / 2));

//----------------------------------------------------------

updateBackground = function () {

    var ceiling = $("ceiling");
    // it's kinda random value, depends on image width
    ceiling.style.backgroundPosition = -200 * player.rotation + "px " + "100%";
}

//----------------------------------------------------------

castRays = function () {
    var stripIdx = 0;

    for (var i = 0; i < numofrays; i++) {
        // where on the screen does ray go through
        var rayScreenPos = (-numofrays / 2 + i) * stripWidth;
        // the distance from the viewer to the point on the screen
        var rayViewDist = Math.sqrt(rayScreenPos * rayScreenPos + viewDist * viewDist);
        // the angle relative to the viewing direction a = sin(x) * c
        var rayAngle = Math.asin(rayScreenPos / rayViewDist);

        castRay(
            // add the players viewing direction
            player.rotation + rayAngle,
            stripIdx++
        );
    }
}

//----------------------------------------------------------

castRay = function (rayAngle, stripIdx) {

    // if angle is between 0 and 360 deg
    rayAngle %= Math.PI * 2;
    if (rayAngle < 0) rayAngle += Math.PI * 2;

    // moving right/left/up/down determined by which quadrant the angle is in.
    var right = (rayAngle > Math.PI * 2 * 0.75 || rayAngle < Math.PI * 2 * 0.25);
    var up = (rayAngle < 0 || rayAngle > Math.PI);
    var wallType = 0;
    var angleSin = Math.sin(rayAngle);
    var angleCos = Math.cos(rayAngle);

    var distance = 0;	// the distance to the block we hit
    var xHit = 0;   	// the x coord of where the ray hit the block
    var yHit = 0;       // the y coord of where the ray hit the block

    var textureX;	// the x-coord on the texture
    var wallX;	    // the x map coord of the block
    var wallY;      // the y map coord of the block

    var shadow; // vertical walls shadowed

    // check vertical wall lines by moving across edge of the block 
    // we're standing in then moving in 1 map unit steps horizontally
    // move vertically is determined by the slope of the ray

    var slope = angleSin / angleCos; 	// the slope made by the ray
    var dXVer = right ? 1 : -1; 	    // we move to the left or right
    var dYVer = dXVer * slope; 	        // how much to move up or down

    // starting horizontal position, at one of the edges of the current map block
    var x = right ? Math.ceil(player.x) : (player.x) >> 0;
    // starting vertical position, add the horizontal step we made * slope.
    var y = player.y + (x - player.x) * slope;

    while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
        wallX = (x + (right ? 0 : -1)) >> 0;
        wallY = (y) >> 0;

        if (spritePosition[wallY][wallX] && !spritePosition[wallY][wallX].visible) {
            spritePosition[wallY][wallX].visible = true;
        }

        if (map[wallY][wallX] > 0) {
            var distX = x - player.x;
            var distY = y - player.y;
            distance = distX * distX + distY * distY;

            wallType = map[wallY][wallX];           // type of wall
            textureX = y % 1;	                    // where exactly on the wall
            if (!right) textureX = 1 - textureX;    // texture should be reversed on left side

            xHit = x;	// coordinates of the hit to draw the rays on minimap.
            yHit = y;
            shadow = true;
            break;
        }
        x += dXVer;
        y += dYVer;
    }

    // once we hit a map block, we check if there is found one in the vertical turn. 
    // we'll know that if distance !=0 -> we only register this hit if this distance is smaller.
    slope = angleCos / angleSin;
    var dYHor = up ? -1 : 1;
    var dXHor = dYHor * slope;
    y = up ? (player.y) >> 0 : Math.ceil(player.y);
    x = player.x + (y - player.y) * slope;

    while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
        wallY = (y + (up ? -1 : 0)) >> 0;
        wallX = (x) >> 0;

        if (spritePosition[wallY][wallX] && !spritePosition[wallY][wallX].visible) {
            spritePosition[wallY][wallX].visible = true;
        }

        if (map[wallY][wallX] > 0) {
            var distX = x - player.x;
            var distY = y - player.y;
            var blockDist = distX * distX + distY * distY;
            if (!distance || blockDist < distance) {
                distance = blockDist;
                xHit = x;
                yHit = y;

                wallType = map[wallY][wallX];
                textureX = x % 1;
                if (up) textureX = 1 - textureX;
                shadow = false;
            }
            break;
        }
        x += dXHor;
        y += dYHor;
    }

    if (distance) {

        var strip = screenStrips[stripIdx];
        distance = Math.sqrt(distance);
        // fish eye
        // distorted_dist = correct_dist / cos(relative_angle_of_ray)
        distance = distance * Math.cos(player.rotation - rayAngle);
        // calc position, height and width of the wall strip
        var height = Math.round(viewDist / distance);
        // stretch the texture to a factor to make it fill the strip correctly
        var width = height * stripWidth;
        // since everything is centered on the x-axis, move it half 
        // way down the screen and then half the wall height back up.
        var top = Math.round((screenHeight - height) / 2);
        var texX = Math.round(textureX * width);
        var prevStyle = strip.img.prevStyle;

        if (texX > width - stripWidth)
            texX = width - stripWidth;
        texX += (shadow ? width : 0);

        strip.style.height = height + "px";
        strip.style.top = top + "px";
        strip.style.zIndex = height >> 0;

        if (prevStyle.height != (height * numoftex) >> 0) {
            strip.img.style.height = (height * numoftex) >> 0 + "px";
            prevStyle.height = (height * numoftex) >> 0;
        }
        if (prevStyle.width != (width * 2) >> 0) {
            strip.img.style.width = (width * 2) >> 0 + "px";
            prevStyle.width = (width * 2) >> 0;
        }
        if (prevStyle.top != -(height * (wallType - 1)) >> 0) {
            strip.img.style.top = -(height * (wallType - 1)) >> 0 + "px";
            prevStyle.top = -(height * (wallType - 1)) >> 0;
        }
        if (prevStyle.left != -texX) {
            strip.img.style.left = -texX + "px";
            prevStyle.left = -texX;
        }
        strip.fog.style.height = height >> 0 + "px";
        strip.fog.style.width = (width * 2) >> 0 + "px";
        strip.fog.style.background = "rgba(0,0,0," + distance / 10 + ")";
    }
    drawRay(xHit, yHit);
}

//----------------------------------------------------------