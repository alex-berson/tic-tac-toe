let size = 3;
let human = 'x';
let level, board;

const lessThan3 = (i) => i < 3;

const initBoard = () => board = [['','',''],['','',''],['','','']];

const updateBoard = (board, row, col, mark) => board[row][col] = mark;

const indexToCoords = (index) => [Math.floor(index / size), index % size];

const gameOver = (board, player) => win(board, player) || freeSquares(board).length == 0;

const shuffle = (array) => {

    for (let i = array.length - 1; i > 0; i--) {

        let j = Math.trunc(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}
 
const freeSquares = (board) => {

    let squares = [];

    for (let r = 0; lessThan3(r); r++) {
        for (let c = 0; lessThan3(c); c++) {
           if (board[r][c] == '') squares.push([r,c]);
        }
    }

    return shuffle(squares);
}

const win = (board, player) => {

    let lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

    outer: for (let line of lines) {

        for (let square of line) {

            let [r, c] = indexToCoords(square);

            if (board[r][c] != player) continue outer;
        }

        return line;
    }

    return null;
}

const newGame = ({changeLevel = false} = {}) => {

    if (!changeLevel || win(board, 'x') || win(board, 'o')) human = human == 'x' ? 'o' : 'x';

    clearBoard();
    initBoard();

    human == 'x' ? setTimeout(enableTouch, 600) : setTimeout(aiTurn, 600);

    // setTimeout(() => { //
    //     human == 'x' ? enableTouch() : aiTurn(); //
    //     if (moves5.length == 0) return; //
    //     moves = moves5.shift(); //
    //     human = 'o'; //
    //     setTimeout(aiTurn, 300); //
    // }, 600); //
}

const aiTurn = async () => {

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    let ai = human == 'x' ? 'o' : 'x';
    let startTime = Date.now();
    let algorithms = {1: basicAI, 2: advancedAI, 3: expertAI};
    let [r, c] = algorithms[level](board);
    let timeLimit = freeSquares(board).length == size ** 2 ? 0 : 200;
    let delay = timeLimit - (Date.now() - startTime);

    // [r, c] = moves.shift(); //

    await sleep(delay);

    placeMark(r, c, ai);
    updateBoard(board, r, c, ai);

    gameOver(board, ai) ? setTimeout(endGame, 200, ai) : setTimeout(enableTouch, 200);

    // human = human == 'x' ? 'o' : 'x'; //
    // setTimeout(aiTurn, 500); //
}

const humanTurn = (e) => {

    let square = e.currentTarget
    let index = Number(square.id.substring(1)) - 1;
    let [r, c] = indexToCoords(index);

    if (board[r][c] != '') return;

    disableTouch();
    placeMark(r, c, human);
    updateBoard(board, r, c, human);

    gameOver(board, human) ? setTimeout(endGame, 200, human) : setTimeout(aiTurn, 300);
}

const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
}

const init = () => {

    // registerServiceWorker();
    setBoardSize();
    preloadImages();
    initBoard();
    loadLevel();
    showBoard();
    disableTapZoom();
    enableTouch();
    enableLevels();

    // moves = moves5.shift(); //
    // human = 'o'; //
    // setTimeout(aiTurn, 2000); //
}

window.onload = () => document.fonts.ready.then(init);