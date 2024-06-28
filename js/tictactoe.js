let board = [];
let level, player = 'x';

const showBoard = () => document.body.style.opacity = 1;

const touchScreen = () => matchMedia('(hover: none)').matches;

const initBoard = () => board = [['','',''],['','',''],['','','']];

const placeMark = (board, row, col, mark) => board[row][col] = mark; 

const setBoardSize = () => {

    let minSide = screen.height > screen.width ? screen.width : window.innerHeight;
    let cssBoardSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--board-size')) / 100;
    let boardSize = Math.ceil(minSide * cssBoardSize / 3) * 3;

    document.documentElement.style.setProperty('--board-size', boardSize + 'px');
}

const preloadImages = () => {

    let marks = ['x','o','x-bold','o-bold'];

    for (let mark of marks) {

        let img = new Image();

        img.src = `images/marks/${mark}.svg`;
    }
}

const shuffle = (array) => {

    for (let i = array.length - 1; i > 0; i--) {

        let j = Math.trunc(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]] 
    }

    return array;
}

const boardFull = (board) => {

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
           if (board[i][j] == '') return false;
        }
    }

    return true;
}

const nFreeSquares = (board) => {

    let n = 0
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] == '') n++;
        }
    }

    return n;
}

const win = (board, mark) => {

    let threes = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

    outer: for (let squares of threes) {

        for (let square of squares) {

            let r = Math.trunc(square / 3);
            let c = square % 3;

            if (board[r][c] != mark) continue outer;
        }

        return squares;
    }

    return false;
}

const newGame = ({level = false} = {}) => {

    let n = 9 - nFreeSquares(board) + Boolean(win(board)) * 3;
    let images =  document.querySelectorAll('img');

    document.querySelector('.board').removeEventListener('touchstart', newGame);
    document.querySelector('.board').removeEventListener('mousedown', newGame);

    if (!level || win(board, 'x') ||  win(board, 'o')) player = player == 'x' ? 'o' : 'x';

    images.forEach(image => {

        if (image.getAttribute('src') != '') {

            image.classList.add('reset');
            image.parentElement.parentElement.classList.remove('filled', 'win');

            image.addEventListener('transitionend', e => {

                n--;
                
                let image = e.currentTarget;

                image.src = '';
                image.classList.remove('reset');
        
                if (n == 0) {

                    // firstMove = level ? player : firstMove == 'x' ? 'o' : 'x';

                    initBoard();

                    // if (firstMove != player) setTimeout(aiMove, 300);

                    player == 'x' ? enableTouch() : setTimeout(aiMove, 300);


                    // player = 'o'; //
                    // setTimeout(aiMove, 300); //
                }
        
            }, {once: true})
        }
    });
}

const gameEnd = (board, mark) => {

    let squares = win(board, mark);

    if (squares) {

        let squaresEl = document.querySelectorAll('.square');
        // let delay = mark == player ? 100 : 100;
        let image = mark == 'x' ? 'images/marks/x-bold.svg' : 'images/marks/o-bold.svg';

        setTimeout(() => {
            for (let square of squares) {

                let el = squaresEl[square];
                let img = squaresEl[square].querySelector('.bold');

                img.src = image;
                el.classList.add('win');

                img.addEventListener('transitionend', () => {

                    img.parentElement.parentElement.classList.remove('filled');
                    img.nextSibling.src = '';

                }, {once: true});
            }
        }, 100);
    }

    if (squares || boardFull(board)) {

        setTimeout(() => {
            document.querySelector('.board').addEventListener('touchstart', newGame);
            document.querySelector('.board').addEventListener('mousedown', newGame);
        }, 200);
        
        return true;
    }
}

const validMoves = (board) => {

    let moves = [];

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
           if (board[i][j] == '') moves.push([i,j]);
        }
    }

    return shuffle(moves);
}

const randomAI = (board) => {

    let moves = validMoves(board);

    return moves[Math.floor(Math.random() * moves.length)];
}

const basicAI = (board, mark) => {

    let opponent = mark == 'x' ? 'o' : 'x';
    let marks = [mark, opponent];
    let threes = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
   
    for (let mark of marks) {
        outer: for (let three of threes) {

            let nMarks = 0;
            let empty = [];
            let opponent = mark == 'x' ? 'o' : 'x';

            for (let square of three) {

                let row = Math.trunc(square / 3);
                let col = square % 3;

                switch(board[row][col]) {

                    case opponent:
                        continue outer;
                    case mark:
                        nMarks++;
                        break;
                    case '':
                        empty = [row, col];
                        break;
                }
            }

            if (nMarks == 2) return empty;
        }
    }

    return randomAI(board);
}

const advancedAI = (board, mark) => {

    countMarks = (three) => {

        let counts = {'ai': 0, 'player': 0, 'empty': 0};
    
        three.forEach(square => {

            switch (board[Math.trunc(square / 3)][square % 3]) {

                case ai:
                    counts['ai']++;
                    break;
                case player:
                    counts['player']++;
                    break;
                case '':
                    counts['empty']++;
                    break;
            }
        });
    
        return counts;
    }

    let ai = mark;
    let player = mark == 'x' ? 'o' : 'x';
    let threes = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    let squares =  Array(9).fill(0);

    for(let r = 0; r < 3; r++) { 
        
        for(let c = 0; c < 3; c++) {

            if (board[r][c] != '') continue;

            if (squares[r * 3 + c] == 0) squares[r * 3 + c] = 1;

            for (let three of threes) {

                let i = r * 3 + c;

                if (three.includes(i)) {

                    let counts = countMarks(three);

                    if (counts['ai'] == 2 && counts['empty'] == 1) squares[i] += 100;
                    if (counts['player'] == 2 && counts['empty'] == 1) squares[i] += 50;
                    if (counts['ai'] == 1 && counts['empty'] == 2) squares[i] += 10;
                    if (counts['player'] == 1 && counts['empty'] == 2) squares[i] += 5;
                }
            }
        }
    }

    let maxIndexes = [];
    let maxValue = Math.max(...squares); 

    squares.forEach((val, i) => {
        if (val == maxValue) maxIndexes.push(i);
    });
    
    let i = maxIndexes[Math.trunc(Math.random() * maxIndexes.length)];
    let move = [Math.trunc(i / 3), i % 3];

    return move;
}

const expertAI = (board, mark) => {

    // let timeLimit = 500;
    // let startTime = Date.now();
    // let move = mcts(board, mark, startTime, timeLimit);

    let [move, _] = minimax(board, -Infinity, Infinity, true);

    return move;
}

const minimax = (board, alpha, beta, maximizingPlayer) => {

    let bestMove;
    let ai = player == 'x' ? 'o' : 'x';

    if (win(board, player)) return [null, -100 * (nFreeSquares(board) + 1)];
    if (win(board, ai)) return [null, 100 * (nFreeSquares(board) + 1)];
    if (boardFull(board)) return [null, 0];

    if (maximizingPlayer) {
        
        let bestScore = -Infinity;
        
        for (let move of validMoves(board)) {

            let tempBoard = board.map(arr => arr.slice());
    
            placeMark(tempBoard, move[0], move[1], ai);
    
            [_, score] = minimax(tempBoard, alpha, beta, false);

            if (score > bestScore) [bestScore, bestMove] = [score, move];

            alpha = Math.max(alpha, score);

            if (alpha >= beta) break;
        }

        return [bestMove, bestScore];

    } else {

        let bestScore = Infinity;
        
        for (let move of validMoves(board)) {

            let tempBoard = board.map(arr => arr.slice());
    
            placeMark(tempBoard, move[0], move[1], player);

            [_, score] = minimax(tempBoard, alpha, beta, true);
    
            if (score < bestScore) [bestScore, bestMove] = [score, move];

            beta = Math.min(beta, score);

            if (beta <= alpha) break;
        }

        return [bestMove, bestScore];
    }
}

const aiMove = () => {

    let move;
    let ai = player == 'x' ? 'o' : 'x';
    let timeLimit = nFreeSquares(board) == 9 ? 0 : 200;
    let startTime = Date.now();

    switch (level) {
        case 1:
            move = basicAI(board, ai);
            break;
        case 2:
            move = advancedAI(board, ai);
            break;
        case 3:
            move = expertAI(board, ai);
    }

    // move = moves1.shift(); //

    do {} while (!(Date.now() - startTime >= timeLimit));

    let squares = document.querySelectorAll('.square');
    let square = squares[[move[0] * 3 + move[1]]];

    // ai == 'x' ? square.classList.add('cross') : square.classList.add('nought');
    // square.firstChild.innerText = ai.toUpperCase();

    let image = ai == 'x' ? 'images/marks/x.svg' : 'images/marks/o.svg';

    square.querySelector('.regular').src = image;
    square.classList.add('filled');

    placeMark(board, move[0], move[1], ai);

    if (gameEnd(board, ai)) return;

    setTimeout(enableTouch, 200);

    // player = player == 'x' ? 'o' : 'x'; //
    // setTimeout(aiMove, 500); //
}

const humanTurn = (e) => {

    let square = e.currentTarget
    let squares = document.querySelectorAll('.square');
    let i = [...squares].indexOf(square);

    // if (square.firstChild.innerText != '') return;
    if (square.classList.contains('filled')) return;


    disableTouch();

    // player == 'x' ? square.classList.add('cross') : square.classList.add('nought');
    // square.firstChild.innerText = player.toUpperCase();


    let image = player == 'x' ? 'images/marks/x.svg' : 'images/marks/o.svg';


    square.querySelector('.regular').src = image;
    square.classList.add('filled');

    placeMark(board, Math.trunc(i / 3), i % 3, player);

    if (gameEnd(board, player)) return;

    setTimeout(aiMove, 300);
}

const selectLevel = (e) => {

    let star = e.currentTarget;
    let levels = document.querySelectorAll('.star');
    let newLevel = [...levels].indexOf(star) + 1;

    if (newLevel == level) return;

    level = newLevel;

    levels.forEach((l, i) => i < level ? l.innerText = '★' : l.innerText = '☆');
    localStorage.setItem('level-xo', JSON.stringify(level));

    newGame({level: true});
}

const loadLevel = () => {

    let levels = document.querySelectorAll('.star');
    let savedLevel = JSON.parse(localStorage.getItem('level-xo'));
    level = savedLevel == null ? 2 : Number(savedLevel);

    levels.forEach((l, i) => i < level ? l.innerText = '★' : l.innerText = '☆');
}

const disableTapZoom = () => {

    const preventDefault = (e) => e.preventDefault();

    document.body.addEventListener('touchstart', preventDefault, {passive: false});
    document.body.addEventListener('mousedown', preventDefault, {passive: false});
}

const enableTouch = () => {

    let squares = document.querySelectorAll('.square');

    for (let square of squares) {

        square.addEventListener('touchstart', humanTurn);
        square.addEventListener('mousedown', humanTurn);
    }
}

const disableTouch = () => {

    let squares = document.querySelectorAll('.square');

    for (let square of squares) {

        square.removeEventListener('touchstart', humanTurn);
        square.removeEventListener('mousedown', humanTurn);
    }
}

const enableLevels = () => {

    let stars = document.querySelectorAll('.star');

    for (let star of stars) {

        star.addEventListener('touchstart', selectLevel);
        star.addEventListener('mousedown', selectLevel);
    }
}

const init = () => {

    setBoardSize();
    preloadImages();
    initBoard();
    loadLevel();
    showBoard();
    disableTapZoom();
    enableTouch();
    enableLevels();

    // player = 'o'; //
    // setTimeout(aiMove, 2000); //
}

window.onload = () => document.fonts.ready.then(init);