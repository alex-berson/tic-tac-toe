const showBoard = () => document.body.style.opacity = 1;

const setBoardSize = () => {

    let minSide = screen.height > screen.width ? screen.width : window.innerHeight;
    let cssBoardSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--board-size')) / 100;
    let boardSize = Math.ceil(minSide * cssBoardSize / size) * size;

    document.documentElement.style.setProperty('--board-size', boardSize + 'px');
}

const preloadImages = () => {

    let xoxo = ['x-regular','o-regular','x-bold','o-bold'];

    xoxo.forEach(mark => new Image().src = `images/xoxo/${mark}.svg`);
}

const placeMark = (r, c, mark) => {

    let squares = document.querySelectorAll('.square');
    let square = squares[r * size + c];
    let image = `images/xoxo/${mark}-regular.svg`;
    let imageEl = square.querySelector('.regular');

    imageEl.src = image;
    imageEl.classList.add(mark);
    square.classList.add('filled');
}

const clearBoard = () => {

    let images = document.querySelectorAll('img[src]:not([src=""])');

    document.querySelector('.board').removeEventListener('touchstart', newGame);
    document.querySelector('.board').removeEventListener('mousedown', newGame);

    images.forEach(image => {

        image.classList.add('reset');
        image.parentElement.parentElement.classList.remove('filled', 'win');

        image.addEventListener('transitionend', e => {
            
            let image = e.currentTarget;
            image.src = '';

            image.classList.remove('reset', 'x', 'o');

        }, {once: true})

    });
}

const endGame = (player) => {

    let line = win(board, player);
    let image = `images/xoxo/${player}-bold.svg`;
    let squares = document.querySelectorAll('.square');

    setTimeout(() => {
        document.querySelector('.board').addEventListener('touchstart', newGame);
        document.querySelector('.board').addEventListener('mousedown', newGame);
    }, 300);

    if (!line) return;

    for (let square of line) {

        let el = squares[square];
        let img = squares[square].querySelector('.bold');
        img.src = image;
        img.classList.add(player);

        el.classList.add('win');

        img.addEventListener('transitionend', () => {

            img.nextSibling.src = '';
            img.nextSibling.classList.remove('x', 'o');
            img.parentElement.parentElement.classList.remove('filled');

        }, {once: true});
    }

    // setTimeout(newGame, 1000); // 
}

const loadLevel = () => {

    let levels = document.querySelectorAll('.star');
    let savedLevel = JSON.parse(localStorage.getItem('level-xo'));
    level = savedLevel == null ? 2 : Number(savedLevel);

    levels.forEach((levelEl, i) => levelEl.innerText = i < level ? '★' : '☆');
}

const selectLevel = (e) => {

    let star = e.currentTarget;
    let levels = document.querySelectorAll('.star');
    let newLevel = Number(star.id.substring(1));

    if (newLevel == level) return;

    level = newLevel;

    levels.forEach((levelEl, i) => levelEl.innerText = i < level ? '★' : '☆');
    localStorage.setItem('level-xo', JSON.stringify(level));

    newGame({changeLevel: true});
}

const enableLevels = () => {

    let stars = document.querySelectorAll('.star');

    for (let star of stars) {
        star.addEventListener('touchstart', selectLevel);
        star.addEventListener('mousedown', selectLevel);
    }
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

const disableTapZoom = () => {

    const preventDefault = (e) => e.preventDefault();

    document.body.addEventListener('touchstart', preventDefault, {passive: false});
    document.body.addEventListener('mousedown', preventDefault, {passive: false});
}