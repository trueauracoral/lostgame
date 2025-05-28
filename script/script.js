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
var tilesetcols = 5;
const map = {
    cols: 6,
    rows: 7,
    tsize: 8,
    tiles: [
        1,2,2,2,2,3,
        6,7,7,7,7,8,
        6,7,7,7,7,8,
        6,7,7,7,7,8,
        6,7,7,4,7,8,
        6,7,7,7,9,8,
        11,12,12,12,12,13,
    ],
    getTile(col, row) {
        return this.tiles[row * map.cols + col];
    },
};
 
let tileAtlas = loadImage("./img/tileset.png");

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
    for (let i = 0; i < map.tiles.length; i++) {
        if (map.tiles[i] === value) {
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
    map.tiles[oldIndex] = 14;
    map.tiles[newIndex] = newValue;
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
gameLoop();