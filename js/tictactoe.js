let board = [];
let level, player, xTimeout, oTimeout;
let firstMove = player;

// const showBoard = () => document.body.style.opacity = 1;

const touchScreen = () => matchMedia('(hover: none)').matches;

const initBoard = () => board = [['','',''],['','',''],['','','']];

const placeMark = (board, row, col, mark) => board[row][col] = mark; 

const setBoardSize = () => {

    let minSide = screen.height > screen.width ? screen.width : window.innerHeight;
    let cssBoardSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--board-size'));
    let boardSize = Math.ceil(minSide * cssBoardSize / 3) * 3;

    document.documentElement.style.setProperty('--board-size', boardSize + 'px');
}

const loadImages = () => {

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

    outer: for (let three of threes) {

        for (let square of three) {

            let row = Math.trunc(square / 3);
            let col = square % 3;

            if (board[row][col] != mark) continue outer;
        }

        return three;
    }

    return false;
}

const newGame = ({changeLevel = false} = {}) => {
    
    let n = 9 - nFreeSquares(board);
    let marks = document.querySelectorAll('img');
    let event = touchScreen() ? 'touchstart' : 'mousedown';
    firstMove = changeLevel ? player : firstMove == 'x' ? 'o' : 'x';
    document.querySelector('.board').removeEventListener(event, newGame);

    if (n == 0) enableTouch();

    marks.forEach(mark => {

        if (mark.classList.contains('filled')) {

            mark.classList.add('reset');
            mark.classList.remove('filled');

            mark.addEventListener('transitionend', e => {

                n--;
                
                let mark = e.currentTarget;

                mark.src = '';
                mark.className = '';
        
                if (n == 0) {
                    initBoard();
                    enableTouch();
                    if (firstMove != player) setTimeout(aiMove, 300);
                }
        
            }, {once: true})
        }
    });
}

const gameEnd = (board, mark) => {

    let squares = win(board, mark);

    if (squares) {

        let squaresEl = document.querySelectorAll('.square');
        let delay = mark == player ? 0 : 50;
        let image = mark == 'x' ? 'images/marks/x-bold.svg' : 'images/marks/o-bold.svg';

        setTimeout(() => {
            for (let square of squares) {
                // squaresEl[square].classList.add('bold');  
                squaresEl[square].firstChild.src = image;
            }
        }, delay);
    }

    if (squares || boardFull(board)) {

        let event = touchScreen() ? 'touchstart' : 'mousedown';

        setTimeout(() => {
            document.querySelector('.board').addEventListener(event, newGame);
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

    switch (level) {
        case 1:
            move = randomAI(board);
            break;
        case 2:
            move = heuristicAI(board, ai);
            break;
        case 3:
            [move, _] = minimax(board, -Infinity, Infinity, true);
    }

    let squares = document.querySelectorAll('.square');
    let square = squares[[move[0] * 3 + move[1]]];

    // ai == 'x' ? square.classList.add('cross') : square.classList.add('nought');
    // square.firstChild.innerText = ai.toUpperCase();

    let image = ai == 'x' ? 'images/marks/x.svg' : 'images/marks/o.svg';

    square.firstChild.src = image;
    square.firstChild.classList.add('filled');

    placeMark(board, move[0], move[1], ai);

    if (gameEnd(board, ai)) return;

    enableTouch();
}

const humanTurn = (e) => {

    let square = e.currentTarget
    let squares = document.querySelectorAll('.square');
    let i = [...squares].indexOf(square);
    let imageEl = square.firstChild;

    // if (square.firstChild.innerText != '') return;
    if (imageEl.classList.contains('filled')) return;


    disableTouch();

    // player == 'x' ? square.classList.add('cross') : square.classList.add('nought');
    // square.firstChild.innerText = player.toUpperCase();


    let image = player == 'x' ? 'images/marks/x.svg' : 'images/marks/o.svg';


    imageEl.src = image;
    imageEl.classList.add('filled');

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

    disableTouch();
    newGame({changeLevel: true});
}

const loadLevel = () => {

    let levels = document.querySelectorAll('.star');
    let savedLevel = JSON.parse(localStorage.getItem('level-xo'));
    level = savedLevel == null ? 2 : Number(savedLevel);

    levels.forEach((l, i) => i < level ? l.innerText = '★' : l.innerText = '☆');
}

const setHeaderColors = (mark) => {

    if (mark == 'x') {
        document.documentElement.style.setProperty('--color1', getComputedStyle(document.documentElement).getPropertyValue('--blue'));
        document.documentElement.style.setProperty('--color2', getComputedStyle(document.documentElement).getPropertyValue('--red'));
    } else {
        document.documentElement.style.setProperty('--color1', getComputedStyle(document.documentElement).getPropertyValue('--red'));
        document.documentElement.style.setProperty('--color2', getComputedStyle(document.documentElement).getPropertyValue('--blue'));
    }
}

const showChoice = ({initial = false} = {}) => {

    setTimeout(() => {
        document.querySelector(".choice").style.opacity = 1;
    }, 50);

    if (!initial) {
        setTimeout(showBoard, 1500); 
        return;
    };

    xTimeout = setTimeout(() => {
        document.querySelector(".x").classList.add("zoom");
    }, 1000 + 50);

    oTimeout = setTimeout(() => {
        document.querySelector(".o").classList.add("zoom");
    }, 1000 + 700 + 50);    
}

const markChoice = (e) => {

    let el = e.currentTarget;
    let mark = el.classList.contains('x') ? 'x' : 'o'
    player = mark;

    disableTouchChoice();
    clearTimeout(xTimeout);
    clearTimeout(oTimeout);

    document.querySelector('.x').classList.remove("zoom");
    document.querySelector('.o').classList.remove("zoom");

    localStorage.setItem('mark', mark);
    setHeaderColors(mark);
    
    setTimeout(() => {
        el.classList.add("zoom");
    }, 50);

    showBoard(el);
}

const showBoard = (el = undefined) => {

    setTimeout(() => {
        document.querySelector(".choice").style.opacity = 0;
    }, 500);

    setTimeout(() => {

        if (el) el.classList.remove("zoom");

        document.querySelector(".choice").style.display = "none";
        document.querySelector("h1").style.display = "block";
        document.querySelector(".level").style.display = "flex";
        document.querySelector(".board").style.display = "grid";
        document.querySelector("#designed").style.display = "block";    

        setTimeout(() => {
            document.querySelector("h1").style.opacity = 1;
            document.querySelector(".level").style.opacity = 1;
            document.querySelector(".board").style.opacity = 1;
            document.querySelector("#designed").style.opacity = 1;

        }, 500);

        setTimeout(() => {
            enableTouch();
            enableLevels();
        }, 500 + 500);

    }, 1000 + 500);
}

const setMarks = () => {

    if (localStorage.mark) {
        player = localStorage.getItem('mark');
        setHeaderColors(player);
        showChoice();
        setTimeout(enableTouchChoice, 0);
    } else {
        showChoice({initial: true});
        setTimeout(enableTouchChoice, 250);
    }
}

const disableTapZoom = () => {

    const preventDefault = (e) => e.preventDefault();
    const event = touchScreen() ? 'touchstart' : 'mousedown';

    document.body.addEventListener(event, preventDefault, {passive: false});
}

const enableTouchChoice = () => {

    document.querySelectorAll('.x, .o').forEach((mark) => {

        let event = touchScreen() ? 'touchstart' : 'mousedown';

        mark.addEventListener(event, markChoice);

    });
}

const disableTouchChoice = () => {

    document.querySelectorAll('.x, .o').forEach((mark) => {

        let event = touchScreen() ? 'touchstart' : 'mousedown';

        mark.removeEventListener(event, markChoice);
    });
}

const enableTouch = () => {

    let squares = document.querySelectorAll('.square');

    for (let square of squares) {

        let event = touchScreen() ? 'touchstart' : 'mousedown';

        square.addEventListener(event, humanTurn);
    }
}

const disableTouch = () => {

    let squares = document.querySelectorAll('.square');

    for (let square of squares) {

        let event = touchScreen() ? 'touchstart' : 'mousedown';

        square.removeEventListener(event, humanTurn);
    }
}

const enableLevels = () => {

    let stars = document.querySelectorAll('.star');

    for (let star of stars) {

        let event = touchScreen() ? 'touchstart' : 'mousedown';

        star.addEventListener(event, selectLevel);
    }
}

const init = () => {

    setBoardSize();
    loadImages();
    loadLevel();

    setMarks();

    initBoard();
    // showBoard();
    disableTapZoom();
    // enableTouch();
    // enableLevels();
}

window.onload = () => document.fonts.ready.then(init());