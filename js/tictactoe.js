let board = [];
let level = 3;
let player = 'x';
// let currentPlayer = player;

const showBoard = () => document.body.style.opacity = 1;

const touchScreen = () => matchMedia('(hover: none)').matches;

const initBoard = () => board = [['','',''],['','',''],['','','']];

const placeMark = (board, row, col, mark) => board[row][col] = mark; 

// const terminalNode = (board) => win(board, 'x') || win(board, 'o') || boardFull(board);

const fillBoard = () => {

    let cells = document.querySelectorAll('.cell');

    cells.forEach(cell => cell.firstChild.innerText = '');
}

const setBoardSize = () => {

    let boardSize;
    let minSide = screen.height > screen.width ? screen.width : window.innerHeight;

    boardSize = Math.ceil(minSide * parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--board-size')) / 3) * 3;

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
        const j = Math.floor(Math.random() * (i + 1));
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

const nFreeCells = (board) => {

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

    outer: for (let three of threes) {

        for (let cell of three) {

            let row = Math.trunc(cell / 3);
            let col = cell % 3;

            if (board[row][col] != mark) continue outer;
        }

        return three;
    }

    return false;
}

const resetGame = () => {

    console.log('RESET');
}

const gameEnd = (board, mark) => {

    let cells = win(board, mark);

    if (cells) {

        let cellsEl = document.querySelectorAll('.cell');
        let delay = mark == player ? 0 : 50;
        let image = mark == 'x' ? `images/marks/x-bold.svg` : `images/marks/o-bold.svg`;

        setTimeout(() => {
            for (let cell of cells) {
                // cellsEl[cell].classList.add('bold');  
                cellsEl[cell].firstChild.src = image;
            }
        }, delay);
    }

    if (cells || boardFull(board)) {

        let event = touchScreen() ? "touchstart" : "mousedown";

        setTimeout(() => {
            document.querySelector('.board').addEventListener(event, resetGame, {once: true});
        }, 100);
        
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

const heuristicAI = (board, mark) => {

    let opponent = mark == 'x' ? 'o' : 'x';
    let marks = [mark, opponent];
    let threes = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
   
    for (let mark of marks) {
        outer: for (let three of threes) {

            let nMarks = 0;
            let empty = [];
            let opponent = mark == 'x' ? 'o' : 'x';

            for (let cell of three) {

                let row = Math.trunc(cell / 3);
                let col = cell % 3;

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

const minimax = (board, alpha, beta, maximizingPlayer) => {

    let tempBoard, bestScore, bestMove;
    let ai = player == 'x' ? 'o' : 'x';

    if (win(board, player)) return [null, -100 * (nFreeCells(board) + 1)];
    if (win(board, ai)) return [null, 100 * (nFreeCells(board) + 1)];
    if (boardFull(board)) return [null, 0];

    if (maximizingPlayer) {
        
        bestScore = -Infinity;
        
        for (let move of validMoves(board)) {

            tempBoard = board.map(arr => arr.slice());
    
            placeMark(tempBoard, move[0], move[1], ai);
    
            [_, score] = minimax(tempBoard, alpha, beta, false);

            if (score > bestScore) [bestScore, bestMove] = [score, move];

            alpha = Math.max(alpha, score);

            if (alpha >= beta) break;
        }

        return [bestMove, bestScore];

    } else {

        bestScore = Infinity;
        
        for (let move of validMoves(board)) {

            tempBoard = board.map(arr => arr.slice());
    
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

    let move = [];
    let ai = player == 'x' ? 'o' : 'x';

    switch(level) {
        case 1:
            move = randomAI(board);
            break;
        case 2:
            move = heuristicAI(board, ai);
            break;
        case 3:
            [move, _] = minimax(board, -Infinity, Infinity, true);
    }

    let cells = document.querySelectorAll('.cell');
    let cell = cells[[move[0] * 3 + move[1]]];

    // ai == 'x' ? cell.classList.add('cross') : cell.classList.add('nought');
    // cell.firstChild.innerText = ai.toUpperCase();

    let image = ai == 'x' ? `images/marks/x.svg` : `images/marks/o.svg`;

    cell.firstChild.src = image;
    cell.firstChild.classList.add('filled');

    placeMark(board, move[0], move[1], ai);

    if (gameEnd(board, ai)) return;

    enableTouch();
}

const humanTurn = (e) => {

    let cell = e.currentTarget
    let cells = document.querySelectorAll('.cell');
    let i = [...cells].indexOf(cell);

    // if (cell.firstChild.innerText != '') return;
    if (cell.firstChild.classList.contains('filled')) return;


    disableTouch();

    // player == 'x' ? cell.classList.add('cross') : cell.classList.add('nought');
    // cell.firstChild.innerText = player.toUpperCase();


    let image = player == 'x' ? `images/marks/x.svg` : `images/marks/o.svg`;


    cell.firstChild.src = image;
    cell.firstChild.classList.add('filled');

    placeMark(board, Math.trunc(i / 3), i % 3, player);

    if (gameEnd(board, player)) return;

    setTimeout(aiMove, 300);
}

const selectLevel = (e) => {

    let star = e.currentTarget;
    let levels = document.querySelectorAll('.star');
    level = [...levels].indexOf(star) + 1;

    levels.forEach((l, i) => i < level ? l.innerText = '★' : l.innerText = '☆');
    localStorage.setItem('level-xo', JSON.stringify(level));
}

const loadLevel = () => {

    let levels = document.querySelectorAll('.star');
    let savedLevel = JSON.parse(localStorage.getItem('level-xo'));
    level = savedLevel == null ? 2 : Number(savedLevel);

    levels.forEach((l, i) => i < level ? l.innerText = '★' : l.innerText = '☆');
}

const disableTapZoom = () => {

    const preventDefault = (e) => e.preventDefault();
    const event = touchScreen() ? "touchstart" : "mousedown";

    document.body.addEventListener(event, preventDefault, {passive: false});
}

const enableTouch = () => {

    let cells = document.querySelectorAll('.cell');

    for (let cell of cells) {

        let event = touchScreen() ? "touchstart" : "mousedown";

        cell.addEventListener(event, humanTurn);
    }
}

const disableTouch = () => {

    let cells = document.querySelectorAll('.cell');

    for (let cell of cells) {

        let event = touchScreen() ? "touchstart" : "mousedown";

        cell.removeEventListener(event, humanTurn);
    }
}

const enableLevels = () => {

    let stars = document.querySelectorAll('.star');

    for (let star of stars) {

        let event = touchScreen() ? "touchstart" : "mousedown";

        star.addEventListener(event, selectLevel);
    }
}

const init = () => {

    setBoardSize();
    preloadImages();
    initBoard();
    fillBoard();
    loadLevel();
    showBoard();
    disableTapZoom();
    enableTouch();
    enableLevels();
}

window.onload = () => document.fonts.ready.then(init());