let board = [];
let player = 'o';

const showBoard = () => document.body.style.opacity = 1;

const touchScreen = () => matchMedia('(hover: none)').matches;

const initBoard = () => {

    board = [
        [0,0,0],
        [0,0,0],
        [0,0,0]
    ];
}

const fillBoard = () => {

    let cells = document.querySelectorAll('.cell');

    cells.forEach(cell => cell.firstChild.innerText = '');
}

const setBoardSize = () => {

    let boardSize;

    if (screen.height > screen.width) {
        boardSize = Math.ceil(screen.width * parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--board-size')) / 3) * 3;
    } else {
        boardSize = Math.ceil(window.innerHeight * parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--board-size')) / 3) * 3;
    }

    document.documentElement.style.setProperty('--board-size', boardSize + 'px');
}

const humanTurn = (e) => {

    let cell = e.currentTarget
    let cells = document.querySelectorAll('.cell');

    if (cell.firstChild.innerText != '') return;

    player == 'x' ? cell.classList.add('cross') : cell.classList.add('nought');

    cell.firstChild.innerText = player.toUpperCase();
    // cell.firstChild.classList.add('display');
}

const disableTapZoom = () => {
    const preventDefault = (e) => e.preventDefault();
    document.body.addEventListener('touchstart', preventDefault, {passive: false});
    document.body.addEventListener('mousedown', preventDefault, {passive: false});
}

const enableTouch = () => {

    let cells = document.querySelectorAll('.cell');

    for (let cell of cells) {
        if (touchScreen()) {
            cell.addEventListener("touchstart", humanTurn);
        } else {
            cell.addEventListener("mousedown", humanTurn);
        }
    }
}

const disableTouch = () => {

    let cells = document.querySelectorAll('.cell');

    for (let cell of cells) {
        if (touchScreen()) {
            cell.removeEventListener("touchstart", humanTurn);
        } else {
            cell.removeEventListener("mousedown", humanTurn);
        }
    }
}


const init = () => {

    setBoardSize();
    initBoard();
    fillBoard();
    showBoard();
    disableTapZoom();
    enableTouch();
}

window.onload = () => document.fonts.ready.then(init());