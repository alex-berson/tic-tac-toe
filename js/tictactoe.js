const setBoardSize = () => {

    let boardSize;

    if (screen.height > screen.width) {
        boardSize = Math.ceil(screen.width * parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--board-size')) / 3) * 3;
    } else {
        boardSize = Math.ceil(window.innerHeight * parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--board-size')) / 3) * 3;
    }

    document.documentElement.style.setProperty('--board-size', boardSize + 'px');
}

const init = () => {

    setBoardSize();
}

window.onload = () => document.fonts.ready.then(init());