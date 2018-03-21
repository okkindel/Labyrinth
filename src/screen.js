function initScreen() {

    var screen = $("screen");

    screen.style.height = screenHeight + 'px';
    screen.style.width = screenWidth + 'px';

    for (var i = 0; i < screenWidth; i += stripWidth) {
        let strip = document.createElement("div");
        strip.style.position = "absolute";
        strip.style.left = i + "px";
        strip.style.width = stripWidth + "px";
        strip.style.height = "0px";
        strip.style.overflow = "hidden";
        strip.style.backgroundColor = "transparent";

        let img = new Image();
        img.src = ("src/assets/walls.png");
        img.style.position = "absolute";
        img.style.left = "0px";

        // assign image to property on strip element for easy access
        strip.appendChild(img);
        strip.img = img;

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

    let ceiling = $("ceiling");
    // it's kinda random value, depends on image width
    ceiling.style.backgroundPosition = -200 * player.rotation + "px " + "100%";
}

//----------------------------------------------------------

castRays = function () {
    let stripIdx = 0;

    for (let i = 0; i < numofrays; i++) {
        // where on the screen does ray go through
        let rayScreenPos = (-numofrays / 2 + i) * stripWidth;
        // the distance from the viewer to the point on the screen
        let rayViewDist = Math.sqrt(rayScreenPos * rayScreenPos + viewDist * viewDist);
        // the angle relative to the viewing direction a = sin(x) * c
        let rayAngle = Math.asin(rayScreenPos / rayViewDist);

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
    let right = (rayAngle > Math.PI * 2 * 0.75 || rayAngle < Math.PI * 2 * 0.25);
    let up = (rayAngle < 0 || rayAngle > Math.PI);
    let wallType = 0;
    let angleSin = Math.sin(rayAngle);
    let angleCos = Math.cos(rayAngle);

    let distance = 0;	// the distance to the block we hit
    let xHit = 0; 	// the x and y coord of where the ray hit the block
    let yHit = 0;

    let textureX;	// the x-coord on the texture
    let wallX;	    // the (x,y) map coords of the block
    let wallY;

    let shadow; // vertical walls shadowed

    // check vertical wall lines by moving across edge of the block 
    // we're standing in then moving in 1 map unit steps horizontally
    // move vertically is determined by the slope of the ray

    var slope = angleSin / angleCos; 	// the slope made by the ray
    let dXVer = right ? 1 : -1; 	    // we move to the left or right
    let dYVer = dXVer * slope; 	        // how much to move up or down

    // starting horizontal position, at one of the edges of the current map block
    var x = right ? Math.ceil(player.x) : Math.floor(player.x);
    // starting vertical position, add the horizontal step we made * slope.
    var y = player.y + (x - player.x) * slope;

    while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
        let wallX = Math.floor(x + (right ? 0 : -1));
        let wallY = Math.floor(y);

        if (spriteMap[wallY][wallX] && !spriteMap[wallY][wallX].visible) {
            spriteMap[wallY][wallX].visible = true;
            visible.push(spriteMap[wallY][wallX]);
        }

        if (map[wallY][wallX] > 0) {
            let distX = x - player.x;
            let distY = y - player.y;
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
    var slope = angleCos / angleSin;
    let dYHor = up ? -1 : 1;
    let dXHor = dYHor * slope;
    var y = up ? Math.floor(player.y) : Math.ceil(player.y);
    var x = player.x + (y - player.y) * slope;

    while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
        let wallY = Math.floor(y + (up ? -1 : 0));
        let wallX = Math.floor(x);

        if (spriteMap[wallY][wallX] && !spriteMap[wallY][wallX].visible) {
            spriteMap[wallY][wallX].visible = true;
            visible.push(spriteMap[wallY][wallX]);
        }

        if (map[wallY][wallX] > 0) {
            let distX = x - player.x;
            let distY = y - player.y;
            let blockDist = distX * distX + distY * distY;
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
        let strip = screenStrips[stripIdx];
        distance = Math.sqrt(distance);
        // fish eye
        // distorted_dist = correct_dist / cos(relative_angle_of_ray)
        distance = distance * Math.cos(player.rotation - rayAngle);
        // calc position, height and width of the wall strip
        let height = Math.round(viewDist / distance);
        // stretch the texture to a factor to make it fill the strip correctly
        let width = height * stripWidth;
        // since everything is centered on the x-axis, move it half 
        // way down the screen and then half the wall height back up.
        let top = Math.round((screenHeight - height) / 2);
        strip.style.height = height + "px";
        strip.style.top = top + "px";

        strip.img.style.height = Math.floor(height * numoftex) + "px";
        strip.img.style.width = Math.floor(width * 2) + "px";
        strip.img.style.top = -Math.floor(height * (wallType - 1)) + "px";

        // fog
        strip.img.style.filter = "brightness(" + (100 - 12 * distance) + "%)";

        let texX = Math.round(textureX * width);
        if (texX > width - stripWidth)
            texX = width - stripWidth;
        texX += (shadow ? width : 0);

        strip.img.style.left = -texX + "px";
        strip.style.zIndex = Math.floor(height);

        drawRay(xHit, yHit);
    }
}

//----------------------------------------------------------
