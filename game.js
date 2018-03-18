function initScreen() {

    var screen = $("screen");

    screen.style.height = screenHeight + 'px';
    screen.style.width = screenWidth + 'px';

    for (var i = 0; i < screenWidth; i += stripWidth) {
        var strip = dc("div");
        strip.style.position = "absolute";
        strip.style.left = i + "px";
        strip.style.width = stripWidth + "px";
        strip.style.height = "0px";
        strip.style.overflow = "hidden";

        strip.style.backgroundColor = "transparent";

        var img = new Image();
        img.src = ("walls.png");
        img.style.position = "absolute";
        img.style.left = "0px";

        // assign the image to a property on the strip element so we have easy access to the image later
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
var numRays = Math.ceil(screenWidth / stripWidth);
var viewDist = (screenWidth / 2) / Math.tan((fov / 2));

//----------------------------------------------------------

castRays = function () {
    let stripIdx = 0;

    for (let i = 0; i < numRays; i++) {
        // where on the screen does ray go through?
        let rayScreenPos = (-numRays / 2 + i) * stripWidth;
        // the distance from the viewer to the point on the screen, simply Pythagoras.
        let rayViewDist = Math.sqrt(rayScreenPos * rayScreenPos + viewDist * viewDist);
        // the angle of the ray, relative to the viewing direction a = sin(A) * c
        let rayAngle = Math.asin(rayScreenPos / rayViewDist);

        castRay(
            player.rot + rayAngle, 	// add the players viewing direction to get the angle in world space
            stripIdx++
        );
    }
}

//----------------------------------------------------------

castRay = function (rayAngle, stripIdx) {

    // first make sure the angle is between 0 and 360 degrees
    rayAngle %= Math.PI * 2;
    if (rayAngle < 0) rayAngle += Math.PI * 2;

    // moving right/left? up/down? Determined by which quadrant the angle is in.
    let right = (rayAngle > Math.PI * 2 * 0.75 || rayAngle < Math.PI * 2 * 0.25);
    let up = (rayAngle < 0 || rayAngle > Math.PI);
    let wallType = 0;
    let angleSin = Math.sin(rayAngle);
    let angleCos = Math.cos(rayAngle);

    let dist = 0;	// the distance to the block we hit
    let xHit = 0; 	// the x and y coord of where the ray hit the block
    let yHit = 0;

    let textureX;	// the x-coord on the texture of the block, ie. what part of the texture are we going to render
    let wallX;	// the (x,y) map coords of the block
    let wallY;

    let wallIsShaded;

    // first check against the vertical map/wall lines
    // we do this by moving to the right or left edge of the block we're standing in
    // and then moving in 1 map unit steps horizontally. The amount we have to move vertically
    // is determined by the slope of the ray, which is simply defined as sin(angle) / cos(angle).
    var slope = angleSin / angleCos; 	// the slope of the straight line made by the ray
    let dXVer = right ? 1 : -1; 	// we move either 1 map unit to the left or right
    let dYVer = dXVer * slope; 	// how much to move up or down

    var x = right ? Math.ceil(player.x) : Math.floor(player.x);	// starting horizontal position, at one of the edges of the current map block
    var y = player.y + (x - player.x) * slope;			// starting vertical position. We add the small horizontal step we just made, multiplied by the slope.

    while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
        let wallX = Math.floor(x + (right ? 0 : -1));
        let wallY = Math.floor(y);

        // is this point inside a wall block?
        if (map[wallY][wallX] > 0) {
            let distX = x - player.x;
            let distY = y - player.y;
            dist = distX * distX + distY * distY;	// the distance from the player to this point, squared.

            wallType = map[wallY][wallX]; // we'll remember the type of wall we hit for later
            textureX = y % 1;	// where exactly are we on the wall? textureX is the x coordinate on the texture that we'll use later when texturing the wall.
            if (!right) textureX = 1 - textureX; // if we're looking to the left side of the map, the texture should be reversed

            xHit = x;	// save the coordinates of the hit. We only really use these to draw the rays on minimap.
            yHit = y;

            wallIsShaded = true;

            break;
        }
        x += dXVer;
        y += dYVer;
    }

    // now check against horizontal lines. It's basically the same, just "turned around".
    // the only difference here is that once we hit a map block, 
    // we check if there we also found one in the earlier, vertical run. We'll know that if dist != 0.
    // If so, we only register this hit if this distance is smaller.
    var slope = angleCos / angleSin;
    let dYHor = up ? -1 : 1;
    let dXHor = dYHor * slope;
    var y = up ? Math.floor(player.y) : Math.ceil(player.y);
    var x = player.x + (y - player.y) * slope;

    while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
        let wallY = Math.floor(y + (up ? -1 : 0));
        let wallX = Math.floor(x);
        if (map[wallY][wallX] > 0) {
            let distX = x - player.x;
            let distY = y - player.y;
            let blockDist = distX * distX + distY * distY;
            if (!dist || blockDist < dist) {
                dist = blockDist;
                xHit = x;
                yHit = y;

                wallType = map[wallY][wallX];
                textureX = x % 1;
                if (up) textureX = 1 - textureX;
                wallIsShaded = false;
            }
            break;
        }
        x += dXHor;
        y += dYHor;
    }

    if (dist) {
        let strip = screenStrips[stripIdx];
        dist = Math.sqrt(dist);
        // use perpendicular distance to adjust for fish eye
        // distorted_dist = correct_dist / cos(relative_angle_of_ray)
        dist = dist * Math.cos(player.rot - rayAngle);
        // now calc the position, height and width of the wall strip
        // "real" wall height in the game world is 1 unit, the distance from the player to the screen is viewDist,
        // thus the height on the screen is equal to wall_height_real * viewDist / dist
        let height = Math.round(viewDist / dist);
        // width is the same, but we have to stretch the texture to a factor of stripWidth to make it fill the strip correctly
        let width = height * stripWidth;
        // top placement is easy since everything is centered on the x-axis, so we simply move
        // it half way down the screen and then half the wall height back up.
        var top = Math.round((screenHeight - height) / 2);
        strip.style.height = height + "px";
        strip.style.top = top + "px";
        strip.img.style.height = Math.floor(height * numoftex) + "px";
        strip.img.style.width = Math.floor(width * 2) + "px";
        strip.img.style.top = -Math.floor(height * (wallType - 1)) + "px";

        let texX = Math.round(textureX * width);
		if (texX > width - stripWidth)
			texX = width - stripWidth;
		texX += (wallIsShaded ? width : 0);

        strip.img.style.left = -texX + "px";
        drawRay(xHit, yHit);
    }
}

//----------------------------------------------------------
