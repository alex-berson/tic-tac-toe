let board = [];
let player = 'x';
let level = 2;

const showBoard = () => document.body.style.opacity = 1;

const touchScreen = () => matchMedia('(hover: none)').matches;

const initBoard = () => {

    board = [
        ['','',''],
        ['','',''],
        ['','','']
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

    for (let [i, c] of cells.entries()) {
        if (cell == c) board[Math.floor(i / 8)][i % 8] = player;
    }
}

const selectLevel = (e) => {

    let star = e.currentTarget;
    let stars = document.querySelectorAll('.star');
    let filled = true;

    for (let [i, s] of stars.entries()) {

        filled ? s.innerText = '★' :  s.innerText = '☆';
        if (star == s && filled) {
            level = i + 1;
            filled = false;
        }
    }
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

const enableLevels = () => {

    let stars = document.querySelectorAll('.star');

    for (let star of stars) {
        if (touchScreen()) {
            star.addEventListener("touchstart", selectLevel);
        } else {
            star.addEventListener("mousedown", selectLevel);
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
    enableLevels();
}

window.onload = () => document.fonts.ready.then(init());