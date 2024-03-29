let currentLevel = parseInt(localStorage.getItem('level'));
let snakeTimer;
let obstacleTimer;
let mineTimer;
let isSnakeRunning = false;

console.log(currentLevel);
if (currentLevel == null) {
    currentLevel = 1;
}

let map = $('#map');
let mapSize = 40;

let snakePos = {
    'row': Math.trunc(mapSize / 2),
    'col': Math.trunc(mapSize / 3)
};
let snakePosElement;

let snakeDir = {
    'left': 1,
    'right': 2,
    'up': 3,
    'down': 4
};
let currentDir;

let snakeBody = 0;
let snakeTailElement;
let snakeHeadElement;
let snakeLength = 5;

let isMoved;

let foodRow;
let foodCol;
let foodElement;

let snakePoint = 0;

let hasWall;
let canThroughWall = true;
let reverseSnakeDir = false;

let reverseObstacleDir = false;
let obstacleSize = 16;
let obstacleStartCol = Math.trunc((mapSize - obstacleSize) / 2) + 1;
let obstacleEndCol = Math.trunc((mapSize - obstacleSize) / 2) + obstacleSize + 1;
let obstacleStartRow = Math.trunc((mapSize - obstacleSize) / 2) + 1;
let obstacleEndRow = Math.trunc((mapSize - obstacleSize) / 2) + obstacleSize + 1;

let time = 0;
let mineRow;
let mineCol;
let mineElement;
let mineRoundTime = 5;

function createMap() {
    // tạo hàng
    for (let i = 1; i <= mapSize; i++) {
        map.append(`<tr class='row-${i}'></tr>`);
        //tạo cột
        for (let j = 1; j <= mapSize; j++) {
            let thisRow = $(`.row-${i}`);
            thisRow.append(`<td class='row-${i}-col-${j}'></td>`);
        }
    }
}

function createSnake() {
    snakeBody += 1;

    switch (currentDir) {
        case 1:
            snakePos['col'] -= 1;

            //đi xuyên tường
            if (snakePos['col'] < 1) {
                if (canThroughWall) {
                    snakePos['col'] = mapSize;
                } else {
                    endGame();
                    break;
                }
            }
            
            snakePosElement = $(`.row-${snakePos['row']}-col-${snakePos['col']}`);

            break;
        case 2:
            snakePos['col'] += 1;

            //đi xuyên tường
            if (snakePos['col'] > mapSize) {
                if (canThroughWall) {
                    snakePos['col'] = 1;
                } else {
                    endGame();
                    break;
                }
            }

            snakePosElement = $(`.row-${snakePos['row']}-col-${snakePos['col']}`);

            break;
        case 3:
            snakePos['row'] -= 1;

            //đi xuyên tường
            if (snakePos['row'] < 1) {
                if (canThroughWall) {
                    snakePos['row'] = mapSize;
                } else {
                    endGame();
                    break;
                }
            }

            snakePosElement = $(`.row-${snakePos['row']}-col-${snakePos['col']}`);

            break;
        case 4:
            snakePos['row'] += 1;

            //đi xuyên tường
            if (snakePos['row'] > mapSize) {
                if (canThroughWall) {
                    snakePos['row'] = 1;
                } else {
                    endGame();
                    break;
                }
            }

            snakePosElement = $(`.row-${snakePos['row']}-col-${snakePos['col']}`);
            
            break;
        }

    //tự cắn đuôi & đụng tường & dính khói & đụng chướng ngại vật
    if (snakePosElement.hasClass('snake') || snakePosElement.hasClass('wall') || snakePosElement.hasClass('smoke') || snakePosElement.hasClass('obstacle')) {
        endGame();
        return;
    }

    //lấy ra đuôi của rắn
    snakeTailElement = $(`.snake-body-${snakeBody - snakeLength}`);
    //xóa đuôi khi quá kích thước
    snakeTailElement.removeClass(`snake snake-body-${snakeBody - snakeLength}`);

    snakePosElement.addClass(`snake snake-body-${snakeBody}`);

    //lấy đầu của rắn
    snakeHeadElement = $(`.snake-body-${snakeBody}`);
    snakeHeadElement.addClass('snake-head')
    //bỏ đầu cũ của rắn
    if (snakeBody > 1) {
        oldSnakeHead = $(`.snake-body-${snakeBody - 1}`);
        oldSnakeHead.removeClass('snake-head');
    }
    //đã di chuyển
    isMoved = true;

    //ăn thức ăn
    if (snakePos['row'] == foodRow && snakePos['col'] == foodCol) {
        snakePoint += 1;
        snakeLength += 1;
        foodElement.removeClass('food');

        //cập nhật bảng điểm
        scoreArea = $('#score');
        scoreArea.html(`<p>Score:</p>${snakePoint}`);
        createFood();
    }
}

document.addEventListener('keydown', function (e) {
    //đã di chuyển mới được đổi hướng
    if (currentDir == 0) {
        currentDir = snakeDir['right'];
        map.css({'opacity': '1'});
        $('.pause-button').html('<b>II</b>');
        $('.start-label').css({'display': 'none'})

        if (currentLevel == 5) {
            obstacleTimer = setInterval(function () {
                moveObstacle();
            }, 200);
        }

        if (currentLevel == 6) {
            mineTimer = setInterval(function () {
                blastingMine();
            }, 100);
        }
    }

    if (isMoved) {
        if (reverseSnakeDir) {
            if (e.key == 'ArrowLeft') {
                if (currentDir != 1) {
                    currentDir = snakeDir['right'];
                }
            } else if (e.key == 'ArrowRight') {
                if (currentDir != 2) {
                    currentDir = snakeDir['left'];
                }
            } else if (e.key == 'ArrowUp') {
                if (currentDir != 3) {
                    currentDir = snakeDir['down'];
                }
            } else if (e.key == 'ArrowDown') {
                if (currentDir != 4) {
                    currentDir = snakeDir['up'];
                }
            }
        } else {
            if (e.key == 'ArrowLeft') {
                if (currentDir != 2) {
                    currentDir = snakeDir['left'];
                }
            } else if (e.key == 'ArrowRight') {
                if (currentDir != 1) {
                    currentDir = snakeDir['right'];
                }
            } else if (e.key == 'ArrowUp') {
                if (currentDir != 4) {
                    currentDir = snakeDir['up'];
                }
            } else if (e.key == 'ArrowDown') {
                if (currentDir != 3) {
                    currentDir = snakeDir['down'];
                }
            }
        }
    }
    isMoved = false;
});

function createFood() {
    if (hasWall) {
        foodRow = Math.floor(Math.random() * (mapSize - 2)) + 2;
        foodCol = Math.floor(Math.random() * (mapSize - 2)) + 2;
    } else {
        foodRow = Math.floor(Math.random() * mapSize) + 1;
        foodCol = Math.floor(Math.random() * mapSize) + 1;
    }
    console.log(foodRow, foodCol);

    foodElement = $(`.row-${foodRow}-col-${foodCol}`);

    while (foodElement.hasClass('snake') || foodElement.hasClass('wall')) {
        return createFood();
    }

    foodElement.addClass('food');
}

function createTranscript() {
    let infoTable = $('#info');
    let instructTitle = '<div id="title"><p><b>Instruction:</b></p></div>';
    let instructContent = '<div id="content">';

    //viết hướng dẫn
    switch (currentLevel) {
        case 1:
            instructContent += '<div class="move-content">';
            instructContent += '<p>&larr;&nbsp;: Move left</p>';
            instructContent += '<p>&rarr;&nbsp;: Move right</p>';
            instructContent += '<p>&uarr;&nbsp;&nbsp;&nbsp;: Move up</p>';
            instructContent += '<p>&darr;&nbsp;&nbsp;&nbsp;: Move down</p>';
            instructContent += '</div>';

            instructContent += '<div class="obstacle-content">';
            instructContent += '<div class="obstacle-content-item">';
            instructContent += '<div class="obstacle-content-color wall"></div>';
            instructContent += '<div class="obstacle-content-notice">&nbsp;: Wall(Do not touch)</div>';
            instructContent += '</div>';
            instructContent += '<div class="obstacle-content-item">';
            instructContent += '<div class="obstacle-content-color food"></div>';
            instructContent += '<div class="obstacle-content-notice">&nbsp;: Food(Eat to win)</div>';
            instructContent += '</div>';
            instructContent += '</div>';

            instructContent += '</div>';

            break;
        case 2:
            instructContent += '<div class="move-content">';
            instructContent += '<p>&larr;&nbsp;: Move left</p>';
            instructContent += '<p>&rarr;&nbsp;: Move right</p>';
            instructContent += '<p>&uarr;&nbsp;&nbsp;&nbsp;: Move up</p>';
            instructContent += '<p>&darr;&nbsp;&nbsp;&nbsp;: Move down</p>';
            instructContent += '</div>';

            instructContent += '<div class="obstacle-content">';
            instructContent += '<div class="obstacle-content-item">';
            instructContent += '<div class="obstacle-content-color wall"></div>';
            instructContent += '<div class="obstacle-content-notice">&nbsp;: Wall(Do not touch)</div>';
            instructContent += '</div>';
            instructContent += '<div class="obstacle-content-item">';
            instructContent += '<div class="obstacle-content-color food"></div>';
            instructContent += '<div class="obstacle-content-notice">&nbsp;: Food(Eat to win)</div>';
            instructContent += '</div>';
            instructContent += '</div>';

            instructContent += '</div>';

            break;
        case 3:
            instructContent += '<div class="move-content">';
            instructContent += '<p>&larr;&nbsp;: Move right</p>';
            instructContent += '<p>&rarr;&nbsp;: Move left</p>';
            instructContent += '<p>&uarr;&nbsp;&nbsp;&nbsp;: Move down</p>';
            instructContent += '<p>&darr;&nbsp;&nbsp;&nbsp;: Move up</p>';
            instructContent += '</div>';

            instructContent += '<div class="obstacle-content">';
            instructContent += '<div class="obstacle-content-item">';
            instructContent += '<div class="obstacle-content-color wall"></div>';
            instructContent += '<div class="obstacle-content-notice">&nbsp;: Wall(Do not touch)</div>';
            instructContent += '</div>';
            instructContent += '<div class="obstacle-content-item">';
            instructContent += '<div class="obstacle-content-color food"></div>';
            instructContent += '<div class="obstacle-content-notice">&nbsp;: Food(Eat to win)</div>';
            instructContent += '</div>';
            instructContent += '</div>';

            instructContent += '</div>';

            break;
        case 4:
            instructContent += '<div class="move-content">';
            instructContent += '<p>&larr;&nbsp;: Move left</p>';
            instructContent += '<p>&rarr;&nbsp;: Move right</p>';
            instructContent += '<p>&uarr;&nbsp;&nbsp;&nbsp;: Move up</p>';
            instructContent += '<p>&darr;&nbsp;&nbsp;&nbsp;: Move down</p>';
            instructContent += '</div>';

            instructContent += '<div class="obstacle-content">';
            instructContent += '<div class="obstacle-content-item">';
            instructContent += '<div class="obstacle-content-color wall"></div>';
            instructContent += '<div class="obstacle-content-notice">&nbsp;: Wall(Do not touch)</div>';
            instructContent += '</div>';
            instructContent += '<div class="obstacle-content-item">';
            instructContent += '<div class="obstacle-content-color food"></div>';
            instructContent += '<div class="obstacle-content-notice">&nbsp;: Food(Eat to win)</div>';
            instructContent += '</div>';
            instructContent += '</div>';

            instructContent += '</div>';

            break;
        case 5:
            instructContent += '<div class="move-content">';
            instructContent += '<p>&larr;&nbsp;: Move left</p>';
            instructContent += '<p>&rarr;&nbsp;: Move right</p>';
            instructContent += '<p>&uarr;&nbsp;&nbsp;&nbsp;: Move up</p>';
            instructContent += '<p>&darr;&nbsp;&nbsp;&nbsp;: Move down</p>';
            instructContent += '</div>';

            instructContent += '<div class="obstacle-content">';
            instructContent += '<div class="obstacle-content-item">';
            instructContent += '<div class="obstacle-content-color wall"></div>';
            instructContent += '<div class="obstacle-content-notice">&nbsp;: Wall(Do not touch)</div>';
            instructContent += '</div>';
            instructContent += '<div class="obstacle-content-item">';
            instructContent += '<div class="obstacle-content-color food"></div>';
            instructContent += '<div class="obstacle-content-notice">&nbsp;: Food(Eat to win)</div>';
            instructContent += '</div>';
            instructContent += '<div class="obstacle-content-item">';
            instructContent += '<div class="obstacle-content-color obstacle"></div>';
            instructContent += '<div class="obstacle-content-notice">&nbsp;: Obstacle(Try to dodge)</div>';
            instructContent += '</div>';
            instructContent += '</div>';

            instructContent += '</div>';

            break;
        case 6:
            instructContent += '<div class="move-content">';
            instructContent += '<p>&larr;&nbsp;: Move left</p>';
            instructContent += '<p>&rarr;&nbsp;: Move right</p>';
            instructContent += '<p>&uarr;&nbsp;&nbsp;&nbsp;: Move up</p>';
            instructContent += '<p>&darr;&nbsp;&nbsp;&nbsp;: Move down</p>';
            instructContent += '</div>';

            instructContent += '<div class="obstacle-content">';
            instructContent += '<div class="obstacle-content-item">';
            instructContent += '<div class="obstacle-content-color wall"></div>';
            instructContent += '<div class="obstacle-content-notice">&nbsp;: Wall(Do not touch)</div>';
            instructContent += '</div>';
            instructContent += '<div class="obstacle-content-item">';
            instructContent += '<div class="obstacle-content-color food"></div>';
            instructContent += '<div class="obstacle-content-notice">&nbsp;: Food(Eat to win)</div>';
            instructContent += '</div>';
            instructContent += '<div class="obstacle-content-item">';
            instructContent += '<div class="obstacle-content-color mine"></div>';
            instructContent += '<div class="obstacle-content-notice">&nbsp;: Mine(Explodes after 5s)</div>';
            instructContent += '</div>';
            instructContent += '<div class="obstacle-content-item">';
            instructContent += '<div class="obstacle-content-color smoke"></div>';
            instructContent += '<div class="obstacle-content-notice">&nbsp;: Smoke(Emitted after mine explodes)</div>';
            instructContent += '</div>';
            instructContent += '</div>';

            instructContent += '</div>';

            break;
    }

    //bảng điểm
    infoTable.append('<td id="score"></td>');
    scoreArea = $('#score');
    scoreArea.html(`<p><b>Score:</b></p>${snakePoint}`);

    //bảng hướng dẫn
    infoTable.append('<td id="instruct"></td>');
    scoreArea = $('#instruct');
    scoreArea.html(instructTitle + instructContent);
}

function createWall() {
    hasWall = true;
    let wallFlexPos;

    //tạo tường bên trái
    for (let i = 1; i <= mapSize; i++) {
        wallFlexPos = `row-${i}-col-1`;
        $(`.${wallFlexPos}`).addClass('wall');
    }

    //tạo tường bên phải
    for (let i = 1; i <= mapSize; i++) {
        wallFlexPos = `row-${i}-col-${mapSize}`;
        $(`.${wallFlexPos}`).addClass('wall');
    }

    //tạo tường bên trên
    for (let i = 1; i <= mapSize; i++) {
        wallFlexPos = `row-1-col-${i}`;
        $(`.${wallFlexPos}`).addClass('wall');
    }

    //tạo tường bên dưới
    for (let i = 1; i <= mapSize; i++) {
        wallFlexPos = `row-${mapSize}-col-${i}`;
        $(`.${wallFlexPos}`).addClass('wall');
    }
}

function createObstacle() {
    for (let i = obstacleStartCol; i <= obstacleEndCol; i++) {
        for (let j = obstacleStartCol; j <= obstacleEndCol; j++) {
            $(`.row-${i}-col-${j}`).addClass('obstacle');
        }
    }
    obstacleStartCol -= 1;
}

function moveObstacle() {
    if (obstacleStartCol <= 1) {
        reverseObstacleDir = !reverseObstacleDir;
        obstacleStartCol += 1;
        obstacleEndCol += 1;

        //đổi thứ tự cột thêm và xóa để di chuyển ngược lại
        let temp = obstacleStartCol;
        obstacleStartCol = obstacleEndCol;
        obstacleEndCol = temp;
    } else if (obstacleStartCol > mapSize - 1) {
        reverseObstacleDir = !reverseObstacleDir;
        obstacleStartCol -= 1;
        obstacleEndCol -= 1;

        //đổi thứ tự cột thêm và xóa để di chuyển ngược lại
        let temp = obstacleStartCol;
        obstacleStartCol = obstacleEndCol;
        obstacleEndCol = temp;
    }

    //kiểm tra chạm đuôi trước khi di chuyển
    for (let i = obstacleStartRow; i <= obstacleEndRow; i++) {
        if ($(`.row-${i}-col-${obstacleStartCol}`).hasClass('snake')) {
            endGame();
            return;
        }
    }

    //di chuyển chướng ngại vật
    for (let i = obstacleStartRow; i <= obstacleEndRow; i++) {
        $(`.row-${i}-col-${obstacleStartCol}`).addClass('obstacle');
        $(`.row-${i}-col-${obstacleEndCol}`).removeClass('obstacle');
    }

    //cột tiếp di chuyển theo của rắn
    if (reverseObstacleDir) {
        obstacleStartCol += 1;
        obstacleEndCol += 1;
    } else {
        obstacleStartCol -= 1;
        obstacleEndCol -= 1;
    }
}

function createMine() {
    mineRow = Math.floor(Math.random() * mapSize) + 1;
    mineCol = Math.floor(Math.random() * mapSize) + 1;
    mineElement = $(`.row-${mineRow}-col-${mineCol}`);

    if (!mineElement.hasClass('wall') && checkMineNotInFood(mineElement)) {
        for (let i = mineRow - 2; i <= mineRow + 2; i++) {
            for (let j = mineCol - 2; j <= mineCol + 2; j++) {
                $(`.row-${i}-col-${j}`).addClass('mine');
            }
        }
        mineRoundTime += 10;
    } else {
        createMine();
    }
}

function checkMineNotInFood(mineElement) {
    let result = true;

    for (let i = mineRow - 2; i <= mineRow + 2; i++) {
        for (let j = mineCol - 2; j <= mineCol + 2; j++) {
            if ($(`.row-${i}-col-${j}`).hasClass('food')) {
                result = false;
                console.log(result);
            }
        }
    }

    return result;
}

function blastingMine() {
    //tính thời gian game
    time += 0.1;
    time = parseFloat(time.toFixed(2));

    if (time % 5 == 0 && time == mineRoundTime) {
        createMine();
    }

    if (time % 10 == 0) {
        //thả mìn
        for (let i = mineRow - 2; i <= mineRow + 2; i++) {
            for (let j = mineCol - 2; j <= mineCol + 2; j++) {
                $(`.row-${i}-col-${j}`).addClass('wall');
                $(`.row-${i}-col-${j}`).removeClass('mine');
            }
        }

        //khói mìn tỏa ra
        for (let i = mineRow - 3; i <= mineRow + 3; i++) {
            for (let j = mineCol - 3; j <= mineCol + 3; j++) {
                if (i == mineRow - 3 || i == mineRow + 3) {
                    $(`.row-${i}-col-${j}`).addClass('smoke');
                } else {
                    if (j == mineCol - 3 || j == mineCol + 3) {
                        $(`.row-${i}-col-${j}`).addClass('smoke');
                    }
                }
            }
        }

        setTimeout(function () {
            for (let i = mineRow - 3; i <= mineRow + 3; i++) {
                for (let j = mineCol - 3; j <= mineCol + 3; j++) {
                    if (i == mineRow - 3 || i == mineRow + 3) {
                        $(`.row-${i}-col-${j}`).removeClass('smoke');
                    } else {
                        if (j == mineCol - 3 || j == mineCol + 3) {
                            $(`.row-${i}-col-${j}`).removeClass('smoke');
                        }
                    }
                }
            }

            for (let i = mineRow - 4; i <= mineRow + 4; i++) {
                for (let j = mineCol - 4; j <= mineCol + 4; j++) {
                    if (i == mineRow - 4 || i == mineRow + 4) {
                        $(`.row-${i}-col-${j}`).addClass('smoke');
                    } else {
                        if (j == mineCol - 4 || j == mineCol + 4) {
                            $(`.row-${i}-col-${j}`).addClass('smoke');
                        }
                    }
                }
            }
        }, 500);

        setTimeout(function () {
            for (let i = mineRow - 4; i <= mineRow + 4; i++) {
                for (let j = mineCol - 4; j <= mineCol + 4; j++) {
                    if (i == mineRow - 4 || i == mineRow + 4) {
                        $(`.row-${i}-col-${j}`).removeClass('smoke');
                    } else {
                        if (j == mineCol - 4 || j == mineCol + 4) {
                            $(`.row-${i}-col-${j}`).removeClass('smoke');
                        }
                    }
                }
            }
        }, 1000);
    }
}

function createTerrain() {
    let terrainFlexPos;
    let terrainCornerSize = parseInt(mapSize / 5);
    let terrainCenterSize = parseInt(mapSize / 3);
    let centerPos = parseInt(mapSize / 2);

    //tạo địa hình góc trái trên
    for (let i = terrainCornerSize; i < terrainCornerSize * 2; i++) {
        terrainFlexPos = `row-${terrainCornerSize}-col-${i}`;
        $(`.${terrainFlexPos}`).addClass('wall');
    }
    for (let i = terrainCornerSize; i < terrainCornerSize * 2; i++) {
        terrainFlexPos = `row-${i}-col-${terrainCornerSize}`;
        $(`.${terrainFlexPos}`).addClass('wall');
    }

    //tạo địa hình góc phải trên
    for (let i = terrainCornerSize * 4; i > terrainCornerSize * 3; i--) {
        terrainFlexPos = `row-${terrainCornerSize}-col-${i}`;
        $(`.${terrainFlexPos}`).addClass('wall');
    }
    for (let i = terrainCornerSize; i < terrainCornerSize * 2; i++) {
        terrainFlexPos = `row-${i}-col-${mapSize - terrainCornerSize}`;
        $(`.${terrainFlexPos}`).addClass('wall');
    }

    //tạo địa hình góc trái dưới
    for (let i = terrainCornerSize; i < terrainCornerSize * 2; i++) {
        terrainFlexPos = `row-${mapSize - terrainCornerSize}-col-${i}`;
        $(`.${terrainFlexPos}`).addClass('wall');
    }

    for (let i = terrainCornerSize * 4; i > terrainCornerSize * 3; i--) {
        terrainFlexPos = `row-${i}-col-${terrainCornerSize}`;
        $(`.${terrainFlexPos}`).addClass('wall');
        console.log(terrainFlexPos);
    }

    //tạo địa hình góc phải dưới
    for (let i = terrainCornerSize * 4; i > terrainCornerSize * 3; i--) {
        terrainFlexPos = `row-${i}-col-${mapSize - terrainCornerSize}`;
        $(`.${terrainFlexPos}`).addClass('wall');
    }
    for (let i = terrainCornerSize * 4 + 1; i > terrainCornerSize * 3; i--) {
        terrainFlexPos = `row-${mapSize - terrainCornerSize}-col-${i}`;
        $(`.${terrainFlexPos}`).addClass('wall');
    }

    //tạo địa hình ở giữa
    for (let i = terrainCenterSize + 2; i < terrainCenterSize * 2; i++) {
        terrainFlexPos = `row-${i}-col-${centerPos}`;
        $(`.${terrainFlexPos}`).addClass('wall');
    }
    for (let i = terrainCenterSize + 2; i < terrainCenterSize * 2; i++) {
        terrainFlexPos = `row-${centerPos}-col-${i}`;
        $(`.${terrainFlexPos}`).addClass('wall');
    }
}

function createLevelChoose() {
    let levelTable = $('#level');
    let levelContent = '<td><button onclick="setLevel(1)">Level 1</button></td>';
    levelContent += '<td><button onclick="setLevel(2)">Level 2</button></td>';
    levelContent += '<td><button onclick="setLevel(3)">Level 3</button></td>';
    levelContent += '<td><button onclick="setLevel(4)">Level 4</button></td>';
    levelContent += '<td><button onclick="setLevel(5)">Level 5</button></td>';
    levelContent += '<td><button onclick="setLevel(6)">Level 6</button></td>';

    levelTable.append(levelContent);
}

$(document).ready(function () {
    switch (currentLevel) {
        case 1: //bình thường
            reverseSnakeDir = false;
            canThroughWall = true;
            createMap();
            createFood();
            createTranscript();

            break;
        case 2: //có tường
            mapSize += 1;
            reverseSnakeDir = false;
            canThroughWall = false;
            createMap();
            createWall();
            createFood();
            createTranscript();

            break;
        case 3: //có tường + đi ngược
            mapSize += 1;
            reverseSnakeDir = true;
            canThroughWall = false;
            createMap();
            createWall();
            createFood();
            createTranscript();

            break;
        case 4: //có tường + địa hình
            mapSize += 1;
            reverseSnakeDir = false;
            canThroughWall = true;
            snakePos['row'] = mapSize - 5;
            createMap();
            // createWall();
            createTerrain();
            createFood();
            createTranscript();

            break;
        case 5: //có tường + chướng ngại vật di chuyển
            mapSize += 1;
            reverseSnakeDir = false;
            canThroughWall = false;
            snakePos['row'] = mapSize - 5;
            createMap();
            createWall();
            createObstacle();
            createFood();
            createTranscript();

            break;
        case 6: //có tường + mìn nổ
            mapSize += 1;
            reverseSnakeDir = false;
            canThroughWall = true;
            createMap();
            createWall();
            createFood();
            createTranscript();

            break;
        default:
            reverseSnakeDir = false;
            canThroughWall = true;
            createMap();
            createFood();
            createTranscript();

            break;
    }

    createLevelChoose();

    setTimeout(function () {
        for (let i = 0; i < snakeLength; i++) {
            currentDir = snakeDir['right'];
            createSnake();
        }
        currentDir = 0;
    }, 0);

    snakeTimer = setInterval(function () {
        if (currentDir != 0) {
            createSnake();
            isSnakeRunning = true;  
        }
    }, 100);
});

function setLevel(level) {
    if (level != currentLevel) {
        localStorage.setItem('level', level);
        window.location.reload();
    }
}

function onPause() {
    if (currentDir == 0) {
        currentDir = snakeDir['right'];
        map.css({'opacity': '1'});
        $('.pause-button').html('<b>II</b>');
        isSnakeRunning = true;
        $('.start-label').css({'display': 'none'})

        if (currentLevel == 5) {
            obstacleTimer = setInterval(function () {
                moveObstacle();
            }, 200);
        }

        if (currentLevel == 6) {
            mineTimer = setInterval(function () {
                blastingMine();
            }, 100);
        }
    } else if (isSnakeRunning) {
        clearInterval(snakeTimer);
        clearInterval(obstacleTimer);
        isSnakeRunning = false;
        $('.pause-button').html('<b>&#9654;</b>');
        map.css({'opacity': '0.5'});
    } else {
        snakeTimer = setInterval(function () {
            createSnake();
            isSnakeRunning = true;
        }, 100);
        $('.pause-button').html('<b>II</b>');
        map.css({'opacity': '1'});

        if (currentLevel == 5) {
            obstacleTimer = setInterval(function () {
                moveObstacle();
            }, 200);
        }

        if (currentLevel == 6) {
            mineTimer = setInterval(function () {
                blastingMine();
            }, 100);
        }
    }
}

function reload() {
    window.location.reload();
}

function endGame() {
    clearInterval(snakeTimer);
    clearInterval(obstacleTimer);
    isSnakeRunning = false;
    $('.pause-button').html('<b>II</b>');
    map.css({'opacity': '0.5'});
    $('.reload-button').css({'left': '720px', 'top': '220px'});
    $('.pause-button').attr('disabled','disabled');
    $('.pause-button').css({'opacity': '0.5'});
    $('.pause-button').hover(function(){
        $(this).css({'box-shadow': 'none'});
    });
}