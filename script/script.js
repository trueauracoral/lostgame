const canvas = document.getElementById('canvas');

const ctx = canvas.getContext('2d');

let scalingFactor = 8;
canvas.width =8*6 * scalingFactor;
canvas.height = 8*7 * scalingFactor;
ctx.scale(scalingFactor, scalingFactor);
let width = canvas.width / scalingFactor
let height = canvas.height / scalingFactor
const halfWidth = width / 2;
const halfHeight = height / 2;

ctx.imageSmoothingEnabled = false;
function loadImage(src) {
    var img = new Image();
    img.src = src;
    return img;
}

function startGame() {
    gameLoop();
}
const delay = ms => new Promise(res => setTimeout(res, ms));
let tilesetcols = 5;
let LEVEL = 0;
let selectLevels = true;
let hasTriggeredWin = false;
//1,2,2,2,2,3,
//6,7,7,7,7,8,
//6,7,7,7,7,8,
//6,7,7,7,7,8,
//6,7,7,7,7,8,
//6,7,7,7,9,8,
//11,12,12,12,12,13,
var map = {
    cols: 6,
    rows: 7,
    tsize: 8,
    tiles: [
        [
            1,2,2,2,2,3,
            6,7,7,7,7,8,
            6,7,7,7,7,8,
            6,7,7,7,7,8,
            6,7,4,4,7,8,
            6,7,7,7,9,8,
            11,12,12,12,12,13,
        ],
        [
            1,2,2,2,2,3,
            6,7,7,7,7,8,
            6,7,4,7,7,8,
            6,7,7,7,7,8,
            6,7,7,4,7,8,
            6,7,7,7,9,8,
            11,12,12,12,12,13,
        ],
        [
            1,2,2,2,2,3,
            6,7,7,7,7,8,
            6,7,4,4,7,8,
            6,7,7,7,7,8,
            6,7,7,4,4,8,
            6,7,7,7,9,8,
            11,12,12,12,12,13,
        ],
        [
            1,2,2,2,2,3,
            6,4,7,7,7,8,
            6,7,7,7,7,8,
            6,7,7,7,7,8,
            6,7,7,4,7,8,
            6,7,7,4,9,8,
            11,12,12,12,12,13,
        ],
    ],
    getTile(col, row) {
        return this.tiles[LEVEL][row * map.cols + col];
    },
};
let backupTiles = map.tiles.map(layer => layer.slice());;
 
let tileAtlas = loadImage("./img/tileset.png");
let numbersAtlas = loadImage("./img/numbers.png");

// https://jakesgordon.com/writing/javascript-game-foundations-sound/
function createAudio(src) {
    var audio = document.createElement('audio');
    audio.volume = 0.5;
    //audio.loop   = options.loop;
    audio.src = src;
    return audio;
}

//var bounce = createAudio('./sound/bounce.wav');

function vec2(x, y) {
    return {x: x, y: y};
}

function gameUpdate() {
    executeMoves();
}

function gameDraw() {
    //Bird.draw();

    for (let c = 0; c < map.cols; c++) {
        for (let r = 0; r < map.rows; r++) {
            const tile = map.getTile(c, r);
            if (tile !== 0) {
            // 0 => empty tile
            const tileIndex = tile - 1;
            const sx = (tileIndex % tilesetcols) * map.tsize;
            const sy = Math.floor(tileIndex / tilesetcols) * map.tsize;
            ctx.drawImage(
                tileAtlas, // image
                sx, // source x
                sy, // source y
                map.tsize, // source width
                map.tsize, // source height
                c * map.tsize, // target x
                r * map.tsize, // target y
                map.tsize, // target width
                map.tsize, // target height
            );
            }
        }
    }
    if (hasWon()) {
        if (!selectLevels && hasWon() && !hasTriggeredWin) {
            hasTriggeredWin = true;
            console.log("has won");
            setTimeout(() => {
                selectLevels = true;
                hasTriggeredWin = false; // reset flag for next level
            }, 2000);
        }
    }
    if (selectLevels) {
        for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 2; r++) {
                const tile = r * 4 + c + 1; // +1 ensures tile index is 1–10
                const tileIndex = tile - 1;
                const sx = (tileIndex % 4) * map.tsize;
                const sy = Math.floor(tileIndex / 4) * map.tsize;
                ctx.drawImage(
                    numbersAtlas,
                    sx,
                    sy,
                    map.tsize,
                    map.tsize,
                    c * map.tsize + 8,
                    r * map.tsize + 8,
                    map.tsize,
                    map.tsize
                );
            }
        }
    }
      
}

document.addEventListener("keydown", (e) => {
    if (controller[e.key]) {
        controller[e.key].pressed = true
    }
}) 
document.addEventListener("keyup", (e) => {
    if (controller[e.key]) {
        controller[e.key].pressed = false
    }
})
let specialPos = findTilePosition(9);

function findTilePosition(value) {
    for (let i = 0; i < map.tiles[LEVEL].length; i++) {
        if (map.tiles[LEVEL][i] === value) {
            return {
                col: i % map.cols,
                row: Math.floor(i / map.cols)
            };
        }
    }
    return null;
}

function moveTile(oldCol, oldRow, newCol, newRow, newValue) {
    const oldIndex = oldRow * map.cols + oldCol;
    const newIndex = newRow * map.cols + newCol;
    map.tiles[LEVEL][oldIndex] = 14;
    map.tiles[LEVEL][newIndex] = newValue;
    specialPos.col = newCol;
    specialPos.row = newRow;
}
function canMoveTo(col, row) {
    if (col < 1 || col >= map.cols - 1 || row < 1 || row >= map.rows - 1) return false;
    const tile = map.getTile(col, row);
    if (tile == 14 || tile == 4) {
        return false;
    } else {
        return true;
    }
}
function isStuck() {
    if (canMoveTo(specialPos.col, specialPos.row - 1) == false &&
        canMoveTo(specialPos.col, specialPos.row + 1) == false &&
        canMoveTo(specialPos.col - 1, specialPos.row) == false &&
        canMoveTo(specialPos.col + 1, specialPos.row) == false) {
            return true
        }
}
function hasWon() {
    if (map.tiles[LEVEL].includes(7)) {
        return false;
    } else {
        return true;
    }
}

function restart() {
    console.log("Restarted.");
    map.tiles = backupTiles.map(layer => layer.slice());
    specialPos = findTilePosition(9);
    hasTriggeredWin = false;
}
const controller = {
    "ArrowUp": {
        pressed: false,
        func: () => {
            let newRow = specialPos.row - 1;
            if (canMoveTo(specialPos.col, newRow)) {
                moveTile(specialPos.col, specialPos.row, specialPos.col, newRow, 15);
            }
        },
    },
    "ArrowDown": {
        pressed: false,
        func: () => {
            let newRow = specialPos.row + 1;
            if (canMoveTo(specialPos.col, newRow)) {
                moveTile(specialPos.col, specialPos.row, specialPos.col, newRow, 15);
            }
        },
    },
    "ArrowLeft": {
        pressed: false,
        func: () => {
            let newCol = specialPos.col - 1;
            if (canMoveTo(newCol, specialPos.row)) {
                moveTile(specialPos.col, specialPos.row, newCol, specialPos.row, 9);
            }
        },
    },
    "ArrowRight": {
        pressed: false,
        func: () => {
            let newCol = specialPos.col + 1;
            if (canMoveTo(newCol, specialPos.row)) {
                moveTile(specialPos.col, specialPos.row, newCol, specialPos.row, 10);
            }
        },
    },
    "w": { pressed: false, func: () => controller["ArrowUp"].func() },
    "s": { pressed: false, func: () => controller["ArrowDown"].func() },
    "a": { pressed: false, func: () => controller["ArrowLeft"].func() },
    "d": { pressed: false, func: () => controller["ArrowRight"].func() },
    "r": { pressed: false, func: () => restart() },

};
const executeMoves = () => {
    for (const key in controller) {
        if (controller[key].pressed && controller[key].func) {
            controller[key].func();
            controller[key].pressed = false; // one move per key press
        }
    }
};

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    window.requestAnimationFrame(gameLoop);
    
    gameUpdate();
    gameDraw()
    
}

function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = Math.floor((event.clientX - rect.left) / scalingFactor);
    let y = Math.floor((event.clientY - rect.top) / scalingFactor);
    return {x: x, y: y};
}

document.addEventListener('pointerdown', (event) => {
    //console.log("MOUSE CLICKED");
    var mouseCoords = getMousePosition(canvas, event);
    console.log(mouseCoords);
    if (selectLevels) {
        // Adjust for offset in drawing numbers (+8 pixels)
        let x = mouseCoords.x - 8;
        let y = mouseCoords.y - 8;

        // Check if within level selector area (4 columns × 2 rows)
        if (x >= 0 && y >= 0 && x < 4 * map.tsize && y < 2 * map.tsize) {
            let col = Math.floor(x / map.tsize);
            let row = Math.floor(y / map.tsize);
            let levelIndex = row * 4 + col;
            console.log(levelIndex);

            if (levelIndex < map.tiles.length) {
                LEVEL = levelIndex;
                restart(); // Reset level
                selectLevels = false;
                console.log("Selected Level:", LEVEL);
            }
        }
    }
});

gameLoop();