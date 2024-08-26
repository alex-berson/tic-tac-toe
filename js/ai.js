const randomAI = (board) => {

    let moves = freeSquares(board);

    return moves[Math.floor(Math.random() * moves.length)];
}

const basicAI = (board) => {

    let ai = human == 'x' ? 'o' : 'x';
    let players = [ai, human];
    let lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
   
    for (let player of players) {
        for (let line of lines) {

            let move, nMarks = 0;

            for (let square of line) {

                let [r, c] = indexToCoords(square);
                let mark = board[r][c];

                if (mark == player) {
                    nMarks++;
                } else if (!mark) {
                    move = [r, c];
                }
            }

            if (nMarks == size - 1 && move) return move;
        }
    }

    return randomAI(board);
}

const advancedAI = (board) => {

    const countMarks = (line) => {

        let nMarks = {'ai': 0, 'human': 0, 'empty': 0};

        line.forEach(square => {

            let [r, c] = indexToCoords(square);
            let cell = board[r][c];

            nMarks[cell == ai ? 'ai' : cell == human ? 'human' : 'empty']++;
        });
    
        return nMarks;
    }

    let ai = human == 'x' ? 'o' : 'x';
    let squares = Array(size ** 2).fill(0);
    let lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

    for(let r = 0; lessThan3(r); r++) { 

        for(let c = 0; lessThan3(c); c++) {

            if (board[r][c] != '') continue;

            let i = r * size + c;

            if (squares[i] == 0) squares[i] = 1;

            for (let line of lines) {

                if (line.includes(i)) {

                    let nMarks = countMarks(line);

                    if (nMarks['ai'] == 2 && nMarks['empty'] == 1) squares[i] += 100;
                    if (nMarks['human'] == 2 && nMarks['empty'] == 1) squares[i] += 40;
                    if (nMarks['ai'] == 1 && nMarks['empty'] == 2) squares[i] += 10;
                    if (nMarks['human'] == 1 && nMarks['empty'] == 2) squares[i] += 4;
                }
            }
        }
    }

    let maxValue = Math.max(...squares); 
    let maxIndexes = squares.reduce((acc, val, i) => val == maxValue ? [...acc, i] : acc, []);
    let index = maxIndexes[Math.trunc(Math.random() * maxIndexes.length)];
    let move = indexToCoords(index);

    return move;
}

const expertAI = (board) => {

    if (freeSquares(board).length == size ** 2) {
        
        let squares = [0,4,2,4,6,4,8,4];
        let square = squares[Math.floor(Math.random() * squares.length)];

        return indexToCoords(square);
    }

    let [move, _] = minimax(board);

    return move;
}

const minimax = (board, alpha = -Infinity, beta = Infinity, maximizingPlayer = true) => {

    let bestMove;
    let moves = freeSquares(board);
    let ai = human == 'x' ? 'o' : 'x';
    let sign = maximizingPlayer ? -1 : 1;
    let opponent = maximizingPlayer ? human : ai;

    if (win(board, opponent)) return [null, sign * 100 * (moves.length + 1)];
    if (moves.length == 0) return [null, 0];

    if (maximizingPlayer) {
        
        let bestScore = -Infinity;
        
        for (let [r, c] of moves) {

            let tempBoard = board.map(arr => arr.slice());
    
            updateBoard(tempBoard, r, c, ai);
    
            let [_, score] = minimax(tempBoard, alpha, beta, false);

            if (score > bestScore) [bestScore, bestMove] = [score, [r, c]];

            alpha = Math.max(alpha, score);

            if (alpha >= beta) break;
        }

        return [bestMove, bestScore];

    } else {

        let bestScore = Infinity;
        
        for (let [r, c] of moves) {

            let tempBoard = board.map(arr => arr.slice());
    
            updateBoard(tempBoard, r, c, human);

            let [_, score] = minimax(tempBoard, alpha, beta, true);
    
            if (score < bestScore) [bestScore, bestMove] = [score, [r, c]];

            beta = Math.min(beta, score);

            if (beta <= alpha) break;
        }

        return [bestMove, bestScore];
    }
}