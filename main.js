//bản đồ
let map = $('#map');
let mapSize = 40;

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

//nút chế độ
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

//nút nhạc nền
let musicButton = $('.music-button');
let musicContent = $('.music-content');

//thời gian được tính toán
let snakeTimer;
let obstacleTimer;
let mineTimer;

//âm thanh
let snakeSoundElement = $('.snake-sound')[0];
let mineSoundElement = $('.mine-sound')[0];
let loseSoundElement = $('.lose-sound')[0];
let wonSoundElement = $('.won-sound')[0];
let eatSoundElement = $('.eat-sound')[0];
let warningSoundElement = $('.warning-sound')[0];
snakeSoundElement.volume = loseSoundElement.volume = 0.3;
mineSoundElement.volume = warningSoundElement.volume = wonSoundElement.volume = eatSoundElement.volume = 0.7;

//dữ liệu cục bộ

//cấp độ
let currentLevel = parseInt(localStorage.getItem('level'));
if (isNaN(currentLevel)) {
    currentLevel = 1;
}

//chế độ
let mode = localStorage.getItem('mode');
if (mode == null) {
    mode = 'normal';
}
if (mode == 'normal') {
    modeButton.html('Normal');
} else {
    modeButton.html('Infinite');
}

//âm thanh
let isSoundPlaying = localStorage.getItem('sound');
let isMusicPlaying = localStorage.getItem('music');

if (isSoundPlaying == 'true') {
    isSoundPlaying = true;
    soundButton.html('<i class="fa-solid fa-volume-high"></i>');
} else if (isSoundPlaying == 'false') {
    isSoundPlaying = false;
    soundButton.html('<i class="fa-solid fa-volume-xmark"></i>');
}

if (isMusicPlaying == 'true') {
    isMusicPlaying = true;
    musicButton.html('<i class="fa-solid fa-music"></i>');
} else if (isMusicPlaying == 'false') {
    isMusicPlaying = false;
    musicButton.html('<i class="fa-solid fa-volume-xmark"></i>');
}

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
        if (snakePoint >= 30) {
            wonLevel();
            return;
        }
    }

    //chỉnh đầu của rắn khi chuyển hướng
    let tempSnakeDir = 2;
    if (tempSnakeDir != currentDir) {
        switch (currentDir) {
            case 1:
                $('.snake-head').css({ 'transform': 'rotate(-180deg)' });
                break;
            case 2:
                $('.snake-head').css({ 'transform': 'rotate(180deg)' });
                break;
            case 3:
                $('.snake-head').css({ 'transform': 'rotate(-90deg)' });
                break;
            case 4:
                $('.snake-head').css({ 'transform': 'rotate(90deg)' });
                break;
        }
    }
}

document.addEventListener('keydown', function (e) {
    //cài đặt cho cấp độ cho lần đầu chơi(chưa có dữ liệu cục bộ)
    if (currentDir == 0) {
        currentDir = snakeDir['right'];
        pauseButton.html('<i class="fa-solid fa-pause"></i>');
        
        //ẩn hướng dẫn khi ấn phím bất kỳ
        $('.start-label').hide();

        //ngăn ấn nút đổi chế độ khi game đã được chơi
        modeButton.attr('disabled', 'disabled');
        modeButton.hover(function () {
            $(this).css({ 'box-shadow': 'none' });
        });
        $('.mode').css({ 'opacity': '0.5' });
        
        //tạo chướng ngại vật di chuyển khi nó là cấp độ 5
        if (currentLevel == 5) {
            obstacleTimer = setInterval(function () {
                moveObstacle();
            }, 200);
        }
        
        //tạo mìn khi nó là cấp độ 6
        if (currentLevel == 6) {
            mineTimer = setInterval(function () {
                blastingMine();
            }, 100);
        }
    }
    
    //đã di chuyển mới được đổi hướng
    if (isMoved) {
        if (reverseSnakeDir) {//di chuyển bị đảo ngược
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
        } else {//di chuyển bình thường
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

    //nếu thức ăn ở vị trí của tường hoặc của rắn thì tạo ngẫu nhiên lại
    while (foodElement.hasClass('snake') || foodElement.hasClass('wall')) {
        return createFood();
    }

    //tạo thức ăn thường và thức ăn đặc biệt mỗi 5 thức ăn thường
    if (foodCount == 5) {
        foodElement.addClass('special-food');
    } else {
        foodElement.addClass('food');
    }
}

function updateFood() {
    //kiểm tra rắn đến chỗ thức ăn
    if (snakePos['row'] == foodRow && snakePos['col'] == foodCol) {
        //chỉnh âm thanh & thêm chiều dài rắn
        if (isSoundPlaying) {
            eatSoundElement.play();
        }
        snakeLength += 1;

        //tạo thức ăn đặc biệt mỗi 5 thức ăn thường
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
            scoreArea.html(`<p class="score-title"><b>Score:</b></p><p class="score-point">${snakePoint}/30</p>`);
        } else {
            scoreArea.html(`<p class="score-title"><b>Score:</b></p><p class="score-point">${snakePoint}</p>`);
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
            instructContent += '<p>&uarr;&nbsp;&nbsp;: Move up</p>';
            instructContent += '<p>&darr;&nbsp;&nbsp;: Move down</p>';
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
            instructContent += '<p>&uarr;&nbsp;&nbsp;: Move up</p>';
            instructContent += '<p>&darr;&nbsp;&nbsp;: Move down</p>';
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
            instructContent += '<p>&uarr;&nbsp;&nbsp;: Move down</p>';
            instructContent += '<p>&darr;&nbsp;&nbsp;: Move up</p>';
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
            instructContent += '<p>&uarr;&nbsp;&nbsp;: Move up</p>';
            instructContent += '<p>&darr;&nbsp;&nbsp;: Move down</p>';
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
            instructContent += '<p>&uarr;&nbsp;&nbsp;: Move up</p>';
            instructContent += '<p>&darr;&nbsp;&nbsp;: Move down</p>';
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
            instructContent += '<p>&uarr;&nbsp;&nbsp;: Move up</p>';
            instructContent += '<p>&darr;&nbsp;&nbsp;: Move down</p>';
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
    if (mode == 'normal') {
        scoreArea.html(`<p class="score-title"><b>Score:</b></p><p class="score-point">${snakePoint}/30</p>`);
    } else {
        scoreArea.html(`<p class="score-title"><b>Score:</b></p><p class="score-point">${snakePoint}</p>`);
    }

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

//tạo chướng ngại vật
function createObstacle() {
    //tạo chướng ngại vật trên theo cột bắt đầu và cột kết thúc
    for (let i = topObstacleStartRow; i <= topObstacleEndRow; i++) {
        for (let j = topObstacleStartCol; j <= topObstacleEndCol; j++) {
            $(`.row-${i}-col-${j}`).addClass('obstacle');
        }
    }
    
    //tạo chướng ngại vật dưới theo cột bắt đầu và cột kết thúc
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
        //cột di chuyển tiếp theo
        reverseTopObstacleDir = !reverseTopObstacleDir;
        topObstacleStartCol += 1;
        topObstacleEndCol += 1;

        //đổi thứ tự cột thêm và xóa để di chuyển ngược lại
        let temp = topObstacleStartCol;
        topObstacleStartCol = topObstacleEndCol;
        topObstacleEndCol = temp;
    } else if (topObstacleStartCol > mapSize - 1) {
        //cột di chuyển tiếp theo
        reverseTopObstacleDir = !reverseTopObstacleDir;
        topObstacleStartCol -= 1;
        topObstacleEndCol -= 1;

        //đổi thứ tự cột thêm và xóa để di chuyển ngược lại
        let temp = topObstacleStartCol;
        topObstacleStartCol = topObstacleEndCol;
        topObstacleEndCol = temp;
    }

    if (bottomObstacleEndCol > mapSize - 1) {
        //cột di chuyển tiếp theo
        reverseBottomObstacleDir = !reverseBottomObstacleDir;
        bottomObstacleStartCol -= 1;
        bottomObstacleEndCol -= 1;

        //đổi thứ tự cột thêm và xóa để di chuyển ngược lại
        let temp = bottomObstacleStartCol;
        bottomObstacleStartCol = bottomObstacleEndCol;
        bottomObstacleEndCol = temp;
    } else if (bottomObstacleEndCol <= 1) {
        //cột di chuyển tiếp theo
        reverseBottomObstacleDir = !reverseBottomObstacleDir;
        bottomObstacleStartCol += 1;
        bottomObstacleEndCol += 1;

        //đổi thứ tự cột thêm và xóa để di chuyển ngược lại
        let temp = bottomObstacleStartCol;
        bottomObstacleStartCol = bottomObstacleEndCol;
        bottomObstacleEndCol = temp;
    }

    //kiểm tra chướng ngại vật trên chạm đuôi trước khi di chuyển
    for (let i = topObstacleStartRow; i <= topObstacleEndRow; i++) {
        if ($(`.row-${i}-col-${topObstacleStartCol}`).hasClass('snake')) {
            endGame();
            return;
        }
    }
    //kiểm tra chướng ngại vật dưới chạm đuôi trước khi di chuyển
    for (let i = bottomObstacleStartRow; i <= bottomObstacleEndRow; i++) {
        if ($(`.row-${i}-col-${bottomObstacleStartCol}`).hasClass('snake')) {
            endGame();
            return;
        }
    }

    //di chuyển chướng ngại vật trên
    for (let i = topObstacleStartRow; i <= topObstacleEndRow; i++) {
        $(`.row-${i}-col-${topObstacleStartCol}`).addClass('obstacle');
        $(`.row-${i}-col-${topObstacleEndCol}`).removeClass('obstacle');
    }
    //di chuyển chướng ngại vật dưới
    for (let i = bottomObstacleStartRow; i <= bottomObstacleEndRow; i++) {
        $(`.row-${i}-col-${bottomObstacleStartCol}`).removeClass('obstacle');
        $(`.row-${i}-col-${bottomObstacleEndCol}`).addClass('obstacle');
    }

    //cột di chuyển tiếp theo của chướng ngại vật trên
    if (reverseTopObstacleDir) {
        topObstacleStartCol += 1;
        topObstacleEndCol += 1;
    } else {
        topObstacleStartCol -= 1;
        topObstacleEndCol -= 1;
    }
    //cột di chuyển tiếp theo của chướng ngại vật dưới
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

    //nếu mìn được tạo ở vị trí tường hay thức ăn thì tạo ngẫu nhiên lại
    if (!mineElement.hasClass('wall') && checkMineNotInFood(mineElement)) {
        for (let i = mineRow - 2; i <= mineRow + 2; i++) {
            for (let j = mineCol - 2; j <= mineCol + 2; j++) {
                $(`.row-${i}-col-${j}`).addClass('mine');
            }
        }
        mineRoundTime += 10;
        warningSoundElement.play();
    } else {
        createMine();
    }
}

//kiểm tra mìn có rơi ngay thức ăn hay không
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

//nổ mìn
function blastingMine() {
    //tính thời gian game
    time += 0.1;
    time = parseFloat(time.toFixed(2));

    if (time % 5 == 0 && time == mineRoundTime) {
        createMine();
    }

    if (time % 10 == 0) {
        mineSoundElement.play();
        //xóa lớp mìn đi thêm với tường trong phạm vi 2 ô xung quanh
        for (let i = mineRow - 2; i <= mineRow + 2; i++) {
            for (let j = mineCol - 2; j <= mineCol + 2; j++) {
                $(`.row-${i}-col-${j}`).addClass('wall');
                $(`.row-${i}-col-${j}`).removeClass('mine');
            }
        }

        //tạo khói mìn tỏa ra lần 1 ở vòng tròn xung quanh thứ 3
        for (let i = mineRow - 3; i <= mineRow + 3; i++) {
            for (let j = mineCol - 3; j <= mineCol + 3; j++) {
                if (i == mineRow - 3 || i == mineRow + 3) {
                    $(`.row-${i}-col-${j}`).addClass('smoke');

                    //khói mìn chạm đuôi
                    if ($(`.row-${i}-col-${j}`).hasClass('snake')) {
                        endGame();
                    }
                } else {
                    if (j == mineCol - 3 || j == mineCol + 3) {
                        $(`.row-${i}-col-${j}`).addClass('smoke');

                        //khói mìn chạm đuôi
                        if ($(`.row-${i}-col-${j}`).hasClass('snake')) {
                            endGame();
                        }
                    }
                }
            }
        }

        setTimeout(() => {
            //xóa khói đã tỏa ra lần 1 ở vòng tròn xung quanh thứ 3
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

            //tạo khói mìn tỏa ra lần 2 ở vòng tròn xung quanh thứ 4
            for (let i = mineRow - 4; i <= mineRow + 4; i++) {
                for (let j = mineCol - 4; j <= mineCol + 4; j++) {
                    if (i == mineRow - 4 || i == mineRow + 4) {
                        $(`.row-${i}-col-${j}`).addClass('smoke');

                        //khói mìn chạm đuôi
                        if ($(`.row-${i}-col-${j}`).hasClass('snake')) {
                            endGame();
                        }
                    } else {
                        if (j == mineCol - 4 || j == mineCol + 4) {
                            $(`.row-${i}-col-${j}`).addClass('smoke');

                            //khói mìn chạm đuôi
                            if ($(`.row-${i}-col-${j}`).hasClass('snake')) {
                                endGame();
                            }
                        }
                    }
                }
            }
        }, 500);

        //xóa khói mìn tỏa ra lần 2 ở vòng tròn xung quanh thứ 4
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
    //đối tượng cho từng chướng ngại vật muốn tạo
    let terrainFlexPos;

    //chia bản đồ thành 5 đoạn
    let terrainCornerSize = parseInt(mapSize / 5);
    
    //chia bản đồ thành 2 đoạn
    let terrainCenterSize = parseInt(mapSize / 2);

    //tạo địa hình góc trái trên
    //tạo tường ngang dài 1/5 bản đồ từ vị trí 1/5 tới 2/5
    for (let i = terrainCornerSize; i < terrainCornerSize * 2; i++) {
        //chọn hàng thứ 1/5 của bản đồ làm mốc
        terrainFlexPos = `row-${terrainCornerSize}-col-${i}`;
        $(`.${terrainFlexPos}`).addClass('wall');
    }
    //tạo tường dọc dài 1/5 bản đồ từ vị trí 1/5 tới 2/5
    for (let i = terrainCornerSize; i < terrainCornerSize * 2; i++) {
        //chọn cột thứ 1/5 của bản đồ làm mốc
        terrainFlexPos = `row-${i}-col-${terrainCornerSize}`;
        $(`.${terrainFlexPos}`).addClass('wall');
    }

    //tạo địa hình góc phải trên
    //tạo tường ngang dài 1/5 bản đồ từ vị trí 4/5 về 3/5
    for (let i = terrainCornerSize * 4; i > terrainCornerSize * 3; i--) {
        //chọn hàng thứ 1/5 của bản đồ làm mốc
        terrainFlexPos = `row-${terrainCornerSize}-col-${i}`;
        $(`.${terrainFlexPos}`).addClass('wall');
    }
    //tạo tường dọc dài 1/5 bản đồ từ vị trí 1/5 tới 2/5
    for (let i = terrainCornerSize; i < terrainCornerSize * 2; i++) {
        //chọn cột thứ 4/5 của bản đồ làm mốc
        terrainFlexPos = `row-${i}-col-${mapSize - terrainCornerSize}`;
        $(`.${terrainFlexPos}`).addClass('wall');
    }

    //tạo địa hình góc trái dưới
    //tạo tường ngang dài 1/5 bản đồ từ vị trí 1/5 tới 2/5
    for (let i = terrainCornerSize; i < terrainCornerSize * 2; i++) {
        //chọn hàng thứ 4/5 của bản đồ làm mốc
        terrainFlexPos = `row-${mapSize - terrainCornerSize}-col-${i}`;
        $(`.${terrainFlexPos}`).addClass('wall');
    }
    //tạo tường dọc dài 1/5 bản đồ từ vị trí 4/5 về 3/5
    for (let i = terrainCornerSize * 4; i > terrainCornerSize * 3; i--) {
        //chọn cột thứ 1/5 của bản đồ làm mốc
        terrainFlexPos = `row-${i}-col-${terrainCornerSize}`;
        $(`.${terrainFlexPos}`).addClass('wall');
    }

    //tạo địa hình góc phải dưới
    //tạo tường ngang dài 1/5 bản đồ từ vị trí 4/5 về 3/5
    for (let i = terrainCornerSize * 4; i > terrainCornerSize * 3; i--) {
        //chọn hàng thứ 4/5 của bản đồ làm mốc
        terrainFlexPos = `row-${i}-col-${mapSize - terrainCornerSize}`;
        $(`.${terrainFlexPos}`).addClass('wall');
    }
    //tạo tường dọc dài 1/5 bản đồ từ vị trí 4/5 về 3/5
    for (let i = terrainCornerSize * 4 + 1; i > terrainCornerSize * 3; i--) {
        //chọn cột thứ 4/5 của bản đồ làm mốc
        terrainFlexPos = `row-${mapSize - terrainCornerSize}-col-${i}`;
        $(`.${terrainFlexPos}`).addClass('wall');
    }

    //tạo địa hình ở giữa
    //tạo tường ngang dài 3/5 bản đồ từ vị trí 1/5 về 4/5
    for (let i = terrainCornerSize + 1; i <= terrainCornerSize * 4; i++) {
        //chọn hàng giữa làm mốc
        terrainFlexPos = `row-${i}-col-${terrainCenterSize}`;
        $(`.${terrainFlexPos}`).addClass('wall');
    }
    //tạo tường dọc dài 3/5 bản đồ từ vị trí 1/5 về 4/5
    for (let i = terrainCornerSize + 1; i <= terrainCornerSize * 4; i++) {
        //chọn cột giữa làm mốc
        terrainFlexPos = `row-${terrainCenterSize}-col-${i}`;
        $(`.${terrainFlexPos}`).addClass('wall');
    }
}

//tạo khung chọn cấp độ
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

//nút tạm dừng
pauseButton.click(function () {
    //thiết lập cho lần đầu chơi(chưa có dữ liệu cục bộ) 
    if (currentDir == 0) {
        isSnakeRunning = true;

        //xóa hướng dẫn khi bắt đầu trò chơi
        $('.start-label').hide();
        
        //hiệu ứng khi bắt đầu trò chơi
        map.css({ 'opacity': '1' });
        currentDir = snakeDir['right'];

        //chỉnh nút tạm dừng
        pauseButton.html('<i class="fa-solid fa-pause"></i>');
        pauseContent.html('Pause');

        //chỉnh và hiệu ứng nút cấp độ
        modeButton.attr('disabled', 'disabled');
        modeButton.hover(function () {
            $(this).css({ 'box-shadow': 'none' });
        });
        $('.mode').css({ 'opacity': '0.5' });

        //tạm dừng chướng ngại vật di chuyển nếu là cấp độ 5
        if (currentLevel == 5) {
            obstacleTimer = setInterval(function () {
                moveObstacle();
            }, 200);
        }

        //tạm dừng thả mìn khi là cấp độ 6
        if (currentLevel == 6) {
            mineTimer = setInterval(function () {
                blastingMine();
            }, 100);
        }
    } else if (isSnakeRunning) {
        //tạm dừng tất cả vật thể đang chuyển động
        clearInterval(snakeTimer);
        clearInterval(obstacleTimer);
        clearInterval(mineTimer);
        isSnakeRunning = false;

        //chỉnh nút tạm dừng
        pauseButton.html('<i class="fa-solid fa-play"></i>');
        pauseContent.html('Resume');

        //hiệu ứng cho bản đồ khi tạm dừng
        map.css({ 'filter': 'blur(2px)' });
    } else {
        //tiếp tục di chuyển rắn
        snakeTimer = setInterval(function () {
            createSnake();
            isSnakeRunning = true;
        }, 100);
        
        //chỉnh nút tạm dừng
        pauseButton.html('<i class="fa-solid fa-pause"></i>');
        pauseContent.html('Pause');
        
        //hiệu ứng cho bản đồ khi tiếp tục
        map.css({ 'filter': 'none' });

        //tiếp tục di chuyển chướng ngại vật nếu là cấp độ 5
        if (currentLevel == 5) {
            obstacleTimer = setInterval(function () {
                moveObstacle();
            }, 200);
        }

        //tiếp tục thả mìn nếu là cấp độ 6
        if (currentLevel == 6) {
            mineTimer = setInterval(function () {
                blastingMine();
            }, 100);
        }
    }
});

//nút chế độ
modeButton.click(function () {
    if (mode == 'normal') {
        modeButton.html('Infinite');
        mode = 'infinite';
        scoreArea.html(`<p class="score-title"><b>Score:</b></p><p class="score-point">${snakePoint}</p>`);
    } else {
        modeButton.html('Normal');
        mode = 'normal';
        scoreArea.html(`<p class="score-title"><b>Score:</b></p><p class="score-point">${snakePoint}/30</p>`);
    }
});

//nút tải lại
reloadButton.click(function () {
    window.location.reload();
});

//nút chuyển cấp độ tiếp theo
nextButton.click(function () {
    if (currentLevel == 6) {
        localStorage.setItem('level', currentLevel = 1);
    } else {
        localStorage.setItem('level', currentLevel += 1);
    }
    window.location.reload();
});

//nút âm thanh
soundButton.click(function () {
    if (isSoundPlaying) {
        soundButton.html('<i class="fa-solid fa-volume-xmark"></i>');
    } else {
        soundButton.html('<i class="fa-solid fa-volume-high"></i>');
    }

    isSoundPlaying = !isSoundPlaying;
});

//nút nhạc nền
musicButton.click(function () {
    if (isMusicPlaying) {
        musicButton.html('<i class="fa-solid fa-volume-xmark"></i>');
        snakeSoundElement.pause();
    } else {
        musicButton.html('<i class="fa-solid fa-music"></i>');
        snakeSoundElement.play();
    }
    isMusicPlaying = !isMusicPlaying;
});

//kết thúc cấp độ hiện tại
function endGame() {
    //dừng mọi vật đang chuyển động
    clearInterval(snakeTimer);
    clearInterval(obstacleTimer);
    clearInterval(mineTimer);
    isSnakeRunning = false;
    
    //hiệu ứng cho bản đồ
    map.css({ 'opacity': '1', 'filter': 'blur(2px)' });
    if (isSoundPlaying) {
        loseSoundElement.play();
    }

    //chỉnh và hiệu ứng cho nút tạm dừng
    pauseButton.html('<i class="fa-solid fa-play"></i>');
    pauseButton.attr('disabled', 'disabled');
    $('.pause').css({ 'opacity': '0.5' });
    pauseButton.hover(function () {
        $(this).css({ 'box-shadow': 'none' });
    });
    
    //hiệu ứng cho kết thúc cấp độ
    $('.lose-label').css({ 'display': 'block' });
    $('.reload').css({ 'position': 'absolute', 'margin': 'auto', 'top': '280px', 'left': '680px', 'right': '0', 'bottom': '0', 'transition': '0.2s' });
    setTimeout(() => {
        $('.reload').css({ 'margin': 'auto', 'top': '240px', 'left': '0', 'right': '0', 'bottom': '0' });
    }, 0);
}

//chiến thắng cấp độ hiện tại
function wonLevel() {
    //dừng mọi vật đang chuyển động
    clearInterval(snakeTimer);
    clearInterval(obstacleTimer);
    clearInterval(mineTimer);
    isSnakeRunning = false;
    
    //hiệu ứng cho bản đồ
    map.css({ 'opacity': '1', 'filter': 'blur(2px)' });
    if (isSoundPlaying) {
        wonSoundElement.play();
    }
    
    //chỉnh và hiệu ứng cho nút tạm dừng
    pauseButton.html('<i class="fa-solid fa-play"></i>');
    pauseButton.attr('disabled', 'disabled');
    $('.pause').css({ 'opacity': '0.5' });
    pauseButton.hover(function () {
        $(this).css({ 'box-shadow': 'none' });
    });
    
    //hiệu ứng cho chiến thắng cấp độ
    $('.won-label').css({ 'display': 'block' });
    $('.next').css({ 'position': 'absolute', 'margin': 'auto', 'top': '400px', 'left': '680px', 'right': '0', 'bottom': '0', 'transition': '0.2s' });
    setTimeout(() => {
        $('.next').css({ 'margin': 'auto', 'top': '240px', 'left': '0', 'right': '0', 'bottom': '0' });
    }, 0);
}

//chỉnh cấp độ
function setLevel(level) {
    if (level != currentLevel) {
        //thiết lập dữ liệu cục bộ cho người dùng khi chọn cấp độ
        localStorage.setItem('level', level);
        localStorage.setItem('mode', mode);
        localStorage.setItem('sound', isSoundPlaying);
        localStorage.setItem('music', isMusicPlaying);
        window.location.reload();
    }
}

//thiết lập cho từng cấp độ
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
        case 3: //có tường + địa hình
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
        case 4: //có tường + địa hình + đi ngược
            mapSize += 1;
            reverseSnakeDir = true;
            canThroughWall = false;
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