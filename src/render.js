function initScreen() {

    var screen = $("screen");

    screen.style.height = screenHeight + 'px';
    screen.style.width = screenWidth + 'px';

    for (var i = 0; i < screenWidth; i += stripWidth) {
        let strip = document.createElement("div");
        strip.style.position = "absolute";
        strip.style.left = i + "px";
        strip.style.width = stripWidth + "px";
        strip.style.overflow = "hidden";

        let img = new Image();
        img.src = ("src/assets/walls.png");
        img.style.position = "absolute";
        strip.appendChild(img);
        strip.img = img;

        let fog = document.createElement("span");
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
    let xHit = 0;   	// the x coord of where the ray hit the block
    let yHit = 0;       // the y coord of where the ray hit the block

    let textureX;	// the x-coord on the texture
    let wallX;	    // the x map coord of the block
    let wallY;      // the y map coord of the block

    let shadow; // vertical walls shadowed

    // check vertical wall lines by moving across edge of the block 
    // we're standing in then moving in 1 map unit steps horizontally
    // move vertically is determined by the slope of the ray

    let slope = angleSin / angleCos; 	// the slope made by the ray
    let dXVer = right ? 1 : -1; 	    // we move to the left or right
    let dYVer = dXVer * slope; 	        // how much to move up or down

    // starting horizontal position, at one of the edges of the current map block
    let x = right ? Math.ceil(player.x) : (player.x) >> 0;
    // starting vertical position, add the horizontal step we made * slope.
    let y = player.y + (x - player.x) * slope;

    while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
        wallX = (x + (right ? 0 : -1)) >> 0;
        wallY = (y) >> 0;

        if (spritePosition[wallY][wallX] && !spritePosition[wallY][wallX].visible) {
            spritePosition[wallY][wallX].visible = true;
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
    slope = angleCos / angleSin;
    let dYHor = up ? -1 : 1;
    let dXHor = dYHor * slope;
    y = up ? (player.y) >> 0 : Math.ceil(player.y);
    x = player.x + (y - player.y) * slope;

    while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
        wallY = (y + (up ? -1 : 0)) >> 0;
        wallX = (x) >> 0;

        if (spritePosition[wallY][wallX] && !spritePosition[wallY][wallX].visible) {
            spritePosition[wallY][wallX].visible = true;
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
        let texX = Math.round(textureX * width);
       
        strip.style.height = height + "px";
        strip.style.top = top + "px";
        if (texX > width - stripWidth)
            texX = width - stripWidth;
        texX += (shadow ? width : 0);

        strip.img.style.left = -texX + "px";
        strip.img.style.height = (height * numoftex) >> 0 + "px";
        strip.img.style.width = (width * 2) >> 0 + "px";
        strip.img.style.top = -(height * (wallType - 1)) >> 0 + "px";
        strip.style.zIndex = height >> 0;
        strip.fog.style.height = height >> 0 + "px";
        strip.fog.style.width = (width * 2) >> 0 + "px";
        strip.fog.style.background = "rgba(0,0,0," + distance / 10 + ")";
    }
    drawRay(xHit, yHit);
}

//----------------------------------------------------------