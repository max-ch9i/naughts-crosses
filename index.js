let lev = 0;
let cells = 7;
class Node {
    constructor(board, children, level) {
        if (level === cells) {
            lev++;
            // console.log(`Created node: ${board} on ${level}`);
        }
        this.board = board;
        this.children = children;
        this.level = level;
    }
}

// Build the tree

function invert(figure) {
    return figure === 'cross' ? 'naught' : 'cross';
}

function checkWinner(board) {
    let strBoard = board.map(cell => {
        let char = null;
        switch(cell) {
            case 'cross':
                char = 'x';
                break;
            case 'naught':
                char = 'o';
                break;
            case null:
                char = 'n';
                break;
        }
        return char;
    });
    
    strBoard = strBoard.join('');
    if (strBoard.indexOf('ooo') > -1) {
        return 'naught';
    } else if (strBoard.indexOf('xxx') > -1) {
        return 'cross';
    }

    if (strBoard.indexOf('n') === -1) {
        return 'tie';
    }

    return null;
}

let nodes = 0;

function makeMoveOn(node, figure) {
    const board = node.board;
    const level = node.level;
    const newLevel = level + 1;
    const children = [];
    const winner = checkWinner(board);

    if (winner !== null) {
        // Assign a winner or a tie
        node.winner = winner;
        node.children = children;
        return;
    }
    board.forEach((cell, i) => {
        if (cell === null) {
            // create a new node there
            const newBoard = board.slice();
            newBoard[i] = figure;
            nodes++;
            const move = new Node(newBoard, [], newLevel);
            children.push(move);
        }
    });
    node.children = children;

    node.children.forEach(child => {
        makeMoveOn(child, invert(figure));
    });
}

const game = new Node((new Array(cells).fill(null)), [], 0);

makeMoveOn(game, 'cross');

console.log('\x1b[36m%s\x1b[0m', `Games in the tree: ${lev}`);

function compareArrays(ar1, ar2) {
    if (ar1.length !== ar2.length) {
        return false;
    }

    for (let i = 0; i < ar1.length; i++) {
        if (ar1[i] !== ar2[i]) {
            return false;
        }
    }

    return true;
}

function flatten(ar) {
    return ar.reduce((acc, x) => acc.concat(x), []);
}
function findBoardInTree(game, board) {
    const level = board.filter(figure => figure !== null).length;
    const children = game.children;
    let matching = null;

    if (game.level !== level - 1) {
        // Go deeper
        matching = children.map(node => findBoardInTree(node, board));
        matching = flatten(matching);
    } else {
        matching = children.filter(state => compareArrays(state.board, board));
    }
    return matching;
}

function gamesFromBoard(game) {
    const children = game.children;

    if (children.length === 0) {
        // A leaf node
        const outcome = {
            cross: 0,
            naught: 0,
            tie: 0
        };
        outcome[game.winner] = 1;
        return [outcome];
    }

    const outcomes = children.map(node => gamesFromBoard(node).reduce((acc, x) => {
        acc.cross += x.cross;
        acc.naught += x.naught;
        acc.tie += x.tie;
        acc.node  = node;
        return acc;
    }, {
        cross: 0,
        naught: 0,
        tie: 0
    }));
    
    return outcomes;
}

function chooseBranch(outcomes, figure) {
    return outcomes.reduce((acc, x) => {
        if (acc === null) {
            return x;
        }

        if (acc[figure] + acc.tie < x[figure] + x.tie) {
            return x
        }

        return acc;
    }, null);
}

// Find the best move
const board = ['cross', 'naught', null, null, null, null, null];
const boardGame = findBoardInTree(game, board).pop();
const outcomes = gamesFromBoard(boardGame);
const winningBranch = chooseBranch(outcomes, 'cross');

console.log(winningBranch.node.board);
