//bản đồ
let map = $('#map');
let mapSize = 40;

//cấp độ
let currentLevel = parseInt(localStorage.getItem('level'));

//rắn
let snakeDir = {
    'left': 1,
    'right': 2,
    'up': 3,
    'down': 4
};
let snakePos = {
    'row': Math.trunc(mapSize / 2),
    'col': Math.trunc(mapSize / 3)
};
let currentDir;
let snakePosElement;
let snakeBody = 0;
let snakeTailElement;
let snakeHeadElement;
let snakeLength = 5;
let snakePoint = 0;
let isMoved;
let isSnakeRunning = false;
let canThroughWall = true;
let reverseSnakeDir = false;

//thức ăn
let foodRow;
let foodCol;
let foodElement;
let foodCount = 0;

//bảng điểm và hướng dẫn
let scoreArea;
let instructArea;

//chướng ngại vật
let obstacleSize = 5;
//chướng ngại vật trên
let topObstacleStartCol = Math.trunc((mapSize - obstacleSize) / 2) + 1;
let topObstacleEndCol = Math.trunc((mapSize - obstacleSize) / 2) + obstacleSize + 1;
let topObstacleStartRow = Math.trunc((mapSize - obstacleSize) / 3) + 1;
let topObstacleEndRow = Math.trunc((mapSize - obstacleSize) / 3) + obstacleSize + 1;
let reverseTopObstacleDir = false;

//chướng ngại vật dưới
let bottomObstacleStartCol = Math.trunc((mapSize - obstacleSize) / 2) + 1;
let bottomObstacleEndCol = Math.trunc((mapSize - obstacleSize) / 2) + obstacleSize + 1;
let bottomObstacleStartRow = Math.trunc((mapSize - obstacleSize) / 3) * 2 + 1;
let bottomObstacleEndRow = Math.trunc((mapSize - obstacleSize) / 3) * 2 + obstacleSize + 1;
let reverseBottomObstacleDir = true;

//mìn
let time = 0;
let mineRow;
let mineCol;
let mineElement;
let mineRoundTime = 5;

//nút dừng
let pauseButton = $('.pause-button');
let pauseContent = $('.pause-content');

//chế độ trò chơi
let mode = 'normal';
let modeButton = $('.mode-button');
let modeContent = $('.mode-content');

//nút tải lại trang
let reloadButton = $('.reload-button');
let reloadContent = $('.reload-content');

//nút chuyển cấp độ
let nextButton = $('.next-button');
let nextContent = $('.next-content');

//nút âm thanh
let soundButton = $('.sound-button');
let soundContent = $('.sound-content');
let isSoundPlaying = true;

//nút nhạc nền
let musicButton = $('.music-button');
let musicContent = $('.music-content');
let isMusicPlaying = true;

//thời gian được tính toán
let snakeTimer;
let obstacleTimer;
let mineTimer;

//chọn cấp độ khởi đầu
if (isNaN(currentLevel)) {
    currentLevel = 1;
}

//âm thanh
let snakeSoundElement = $('.snake-sound')[0];
let mineSoundElement = $('.mine-sound')[0];
let loseSoundElement = $('.lose-sound')[0];
let wonSoundElement = $('.won-sound')[0];
let eatSoundElement = $('.eat-sound')[0];
snakeSoundElement.volume = loseSoundElement.volume = 0.3;
mineSoundElement.volume = wonSoundElement.volume = eatSoundElement.volume = 0.7;

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
    
    //điều kiện cho từng hướng di chuyển
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

    //đã di chuyển
    isMoved = true;

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

    //ăn thức ăn
    updateFood();

    //kiểm tra điểm để qua màn
    if (mode == 'normal') {
        if (snakePoint >= 1) {
            wonLevel();
            return;
        }
    }
}

document.addEventListener('keydown', function (e) {
    //đã di chuyển mới được đổi hướng
    if (currentDir == 0) {
        musicButton.html('<i class="fa-solid fa-music"></i>');
        isMusicPlaying = true;
        
        snakeSoundElement.play();
        currentDir = snakeDir['right'];
        map.css({ 'opacity': '1' });
        pauseButton.html('<i class="fa-solid fa-pause"></i>');
        $('.start-label').hide();
        modeButton.attr('disabled', 'disabled');
        modeButton.hover(function () {
            $(this).css({ 'box-shadow': 'none' });
        });
        $('.mode').css({ 'opacity': '0.5' });
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
    foodRow = Math.floor(Math.random() * mapSize) + 1;
    foodCol = Math.floor(Math.random() * mapSize) + 1;
    foodElement = $(`.row-${foodRow}-col-${foodCol}`);
    
    while (foodElement.hasClass('snake') || foodElement.hasClass('wall')) {
        return createFood();
    }
    
    if (foodCount == 5) {
        foodElement.addClass('special-food');
    } else {
        foodElement.addClass('food');
    }
}

function updateFood() {
    //kiểm tra rắn đến chỗ thức ăn
    if (snakePos['row'] == foodRow && snakePos['col'] == foodCol) {
        if (isSoundPlaying) {
            eatSoundElement.play();
        }
        snakeLength += 1;
        if (foodCount == 5) {
            snakePoint += 5;
            foodElement.removeClass('special-food');
            foodCount = 0;
        } else {
            snakePoint += 1;
            foodElement.removeClass('food');
            foodCount += 1;
        }
        
        //cập nhật bảng điểm
        if (mode == 'normal') {            
            scoreArea.html(`<p><b>Score:</b></p>${snakePoint}/30`);
        } else {
            scoreArea.html(`<p><b>Score:</b></p>${snakePoint}`);
        }
        createFood();
    }
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

    //thêm thông tin bảng điểm
    infoTable.append('<td id="score"></td>');
    scoreArea = $('#score');
    scoreArea.html(`<p><b>Score:</b></p>${snakePoint}/30`);

    //thêm thông tin bảng hướng dẫn
    infoTable.append('<td id="instruct"></td>');
    instructArea = $('#instruct');
    instructArea.html(instructTitle + instructContent);
}

function createWall() {
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
    for (let i = topObstacleStartRow; i <= topObstacleEndRow; i++) {
        for (let j = topObstacleStartCol; j <= topObstacleEndCol; j++) {
            $(`.row-${i}-col-${j}`).addClass('obstacle');
        }
    }

    for (let i = bottomObstacleStartRow; i <= bottomObstacleEndRow; i++) {
        for (let j = bottomObstacleStartCol; j <= bottomObstacleEndCol; j++) {
            $(`.row-${i}-col-${j}`).addClass('obstacle');
        }
    }

    topObstacleStartCol -= 1;
    bottomObstacleEndCol += 1;
}

function moveObstacle() {
    if (topObstacleStartCol <= 1) {
        reverseTopObstacleDir = !reverseTopObstacleDir;
        topObstacleStartCol += 1;
        topObstacleEndCol += 1;
        
        //đổi thứ tự cột thêm và xóa để di chuyển ngược lại
        let temp = topObstacleStartCol;
        topObstacleStartCol = topObstacleEndCol;
        topObstacleEndCol = temp;
    } else if (topObstacleStartCol > mapSize - 1) {
        reverseTopObstacleDir = !reverseTopObstacleDir;
        topObstacleStartCol -= 1;
        topObstacleEndCol -= 1;

        //đổi thứ tự cột thêm và xóa để di chuyển ngược lại
        let temp = topObstacleStartCol;
        topObstacleStartCol = topObstacleEndCol;
        topObstacleEndCol = temp;
    }

    if (bottomObstacleEndCol > mapSize - 1) {
        reverseBottomObstacleDir = !reverseBottomObstacleDir;
        bottomObstacleStartCol -= 1;
        bottomObstacleEndCol -= 1;

        //đổi thứ tự cột thêm và xóa để di chuyển ngược lại
        let temp = bottomObstacleStartCol;
        bottomObstacleStartCol = bottomObstacleEndCol;
        bottomObstacleEndCol = temp;
    } else if (bottomObstacleEndCol <= 1) {
        reverseBottomObstacleDir = !reverseBottomObstacleDir;
        bottomObstacleStartCol += 1;
        bottomObstacleEndCol += 1;

        //đổi thứ tự cột thêm và xóa để di chuyển ngược lại
        let temp = bottomObstacleStartCol;
        bottomObstacleStartCol = bottomObstacleEndCol;
        bottomObstacleEndCol = temp;
    }

    //kiểm tra chạm đuôi trước khi di chuyển
    for (let i = topObstacleStartRow; i <= topObstacleEndRow; i++) {
        if ($(`.row-${i}-col-${topObstacleStartCol}`).hasClass('snake')) {
            endGame();
            return;
        }
    }

    for (let i = bottomObstacleStartRow; i <= bottomObstacleEndRow; i++) {
        if ($(`.row-${i}-col-${bottomObstacleStartCol}`).hasClass('snake')) {
            endGame();
            return;
        }
    }

    //di chuyển chướng ngại vật
    for (let i = topObstacleStartRow; i <= topObstacleEndRow; i++) {
        $(`.row-${i}-col-${topObstacleStartCol}`).addClass('obstacle');
        $(`.row-${i}-col-${topObstacleEndCol}`).removeClass('obstacle');
    }

    for (let i = bottomObstacleStartRow; i <= bottomObstacleEndRow; i++) {
        $(`.row-${i}-col-${bottomObstacleStartCol}`).removeClass('obstacle');
        $(`.row-${i}-col-${bottomObstacleEndCol}`).addClass('obstacle');
    }

    //cột di chuyển tiếp theo của chướng ngại vật
    if (reverseTopObstacleDir) {
        topObstacleStartCol += 1;
        topObstacleEndCol += 1;
    } else {
        topObstacleStartCol -= 1;
        topObstacleEndCol -= 1;
    }
    
    if (reverseBottomObstacleDir) {
        bottomObstacleStartCol += 1;
        bottomObstacleEndCol += 1;
    } else {
        bottomObstacleStartCol -= 1;
        bottomObstacleEndCol -= 1;
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
        mineSoundElement.play();
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

        setTimeout(() => {
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

        setTimeout(() => {
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


function setLevel(level) {
    if (level != currentLevel) {
        localStorage.setItem('level', level);
        window.location.reload();
    }
}

pauseButton.click(function () {
    if (currentDir == 0) {
        snakeSoundElement.play();
        musicButton.html('<i class="fa-solid fa-music"></i>');
        isMusicPlaying = true;
        map.css({ 'opacity': '1' });
        currentDir = snakeDir['right'];
        pauseButton.html('<i class="fa-solid fa-pause"></i>');
        pauseContent.html('Pause');
        isSnakeRunning = true;
        $('.start-label').hide();
        modeButton.attr('disabled', 'disabled');
        modeButton.hover(function () {
            $(this).css({ 'box-shadow': 'none' });
        });
        $('.mode').css({ 'opacity': '0.5' });
        
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
        clearInterval(mineTimer);
        isSnakeRunning = false;
        pauseButton.html('<i class="fa-solid fa-play"></i>');
        pauseContent.html('Resume');
        map.css({ 'opacity': '0.5' });
    } else {
        snakeTimer = setInterval(function () {
            createSnake();
            isSnakeRunning = true;
        }, 100);
        pauseButton.html('<i class="fa-solid fa-pause"></i>');
        pauseContent.html('Pause');
        map.css({ 'opacity': '1' });
        
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
});

modeButton.click(function () {
    if (mode == 'normal') {
        modeButton.html('Infinite');
        mode = 'infinite';
        scoreArea.html(`<p><b>Score:</b></p>${snakePoint}`);
    } else {
        modeButton.html('Normal');
        mode = 'normal';
        scoreArea.html(`<p><b>Score:</b></p>${snakePoint}/30`);
    }
});

reloadButton.click(function () {
    window.location.reload();
});

nextButton.click(function () {
    if (currentLevel == 6) {
        localStorage.setItem('level', currentLevel = 1);
    } else {
        localStorage.setItem('level', currentLevel += 1);
    }
    window.location.reload();
});

soundButton.click(function () {
    if (isSoundPlaying) {
        soundButton.html('<i class="fa-solid fa-volume-xmark"></i>');
    } else {
        soundButton.html('<i class="fa-solid fa-volume-high"></i>');
    }

    isSoundPlaying = !isSoundPlaying;
});

musicButton.click(function () {
    if (isMusicPlaying) {
        musicButton.html('<i class="fa-solid fa-microphone-slash"></i>');
        snakeSoundElement.pause();
    } else {
        musicButton.html('<i class="fa-solid fa-music"></i>');
        snakeSoundElement.play();
    }
    isMusicPlaying = !isMusicPlaying;
});

function endGame() {
    clearInterval(snakeTimer);
    clearInterval(obstacleTimer);
    clearInterval(mineTimer);
    if (isSoundPlaying) {
        loseSoundElement.play();
    }
    isSnakeRunning = false;
    map.css({ 'opacity': '1', 'filter': 'blur(2px)'});
    pauseButton.html('<b>II</b>');
    $('.reload').css({ 'position': 'absolute', 'margin': 'auto', 'top': '280px', 'left': '680px', 'right': '0', 'bottom': '0', 'transition': '0.2s' });
    pauseButton.attr('disabled', 'disabled');
    $('.pause').css({ 'opacity': '0.5' });
    pauseButton.hover(function () {
        $(this).css({ 'box-shadow': 'none' });
    });
    $('.lose-label').css({ 'display': 'block' });

    setTimeout(() => {
        $('.reload').css({ 'margin': 'auto', 'top': '240px', 'left': '0', 'right': '0', 'bottom': '0' });
    }, 0);
}

function wonLevel() {
    clearInterval(snakeTimer);
    clearInterval(obstacleTimer);
    clearInterval(mineTimer);
    if (isSoundPlaying) {
        wonSoundElement.play();
    }
    isSnakeRunning = false;
    map.css({ 'opacity': '0.5' });
    pauseButton.html('<b>II</b>');
    $('.next').css({ 'position': 'absolute', 'margin': 'auto', 'top': '400px', 'left': '680px', 'right': '0', 'bottom': '0', 'transition': '0.2s' });
    pauseButton.attr('disabled', 'disabled');
    $('.pause').css({ 'opacity': '0.5' });
    pauseButton.hover(function () {
        $(this).css({ 'box-shadow': 'none' });
    });
    $('.won-label').css({ 'display': 'block' });

    setTimeout(() => {
        $('.next').css({ 'margin': 'auto', 'top': '240px', 'left': '0', 'right': '0', 'bottom': '0' });
    }, 0);
}

$(document).ready(function () {
    switch (currentLevel) {
        case 1: //bình thường
            reverseSnakeDir = false;
            canThroughWall = true;
            createMap();
            createFood();
            createTranscript();

            snakeTimer = setInterval(function () {
                if (currentDir != 0) {
                    createSnake();
                    isSnakeRunning = true;
                }
            }, 90);

            break;
        case 2: //có tường
            mapSize += 1;
            reverseSnakeDir = false;
            canThroughWall = false;
            createMap();
            createWall();
            createFood();
            createTranscript();

            snakeTimer = setInterval(function () {
                if (currentDir != 0) {
                    createSnake();
                    isSnakeRunning = true;
                }
            }, 100);

            break;
        case 3: //có tường + đi ngược
            mapSize += 1;
            reverseSnakeDir = true;
            canThroughWall = false;
            createMap();
            createWall();
            createFood();
            createTranscript();

            snakeTimer = setInterval(function () {
                if (currentDir != 0) {
                    createSnake();
                    isSnakeRunning = true;
                }
            }, 100);

            break;
        case 4: //có tường + địa hình
            mapSize += 1;
            reverseSnakeDir = false;
            canThroughWall = true;
            snakePos['row'] = mapSize - 5;
            createMap();
            createWall();
            createTerrain();
            createFood();
            createTranscript();

            snakeTimer = setInterval(function () {
                if (currentDir != 0) {
                    createSnake();
                    isSnakeRunning = true;
                }
            }, 100);

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

            snakeTimer = setInterval(function () {
                if (currentDir != 0) {
                    createSnake();
                    isSnakeRunning = true;
                }
            }, 100);

            break;
        case 6: //có tường + mìn nổ
            mapSize += 1;
            reverseSnakeDir = false;
            canThroughWall = true;
            createMap();
            createWall();
            createFood();
            createTranscript();

            snakeTimer = setInterval(function () {
                if (currentDir != 0) {
                    createSnake();
                    isSnakeRunning = true;
                }
            }, 100);

            break;
        default:
            reverseSnakeDir = false;
            canThroughWall = true;
            createMap();
            createFood();
            createTranscript();

            snakeTimer = setInterval(function () {
                if (currentDir != 0) {
                    createSnake();
                    isSnakeRunning = true;
                }
            }, 100);

            break;
    }

    createLevelChoose();

    setTimeout(() => {
        for (let i = 0; i < snakeLength; i++) {
            currentDir = snakeDir['right'];
            createSnake();
        }
        currentDir = 0;
    }, 0);
});