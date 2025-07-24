export function gameBoard(row = 10, col = 10) {
    if (!Number(row) || !Number(col)) throw new Error('input numbers ');

    let board = Array.from({ length: row }, () => Array(col).fill(''));

    function findAllShips(arr = board, i = 0, shipSet = new Set()) {
        const invalid = ['', 0, 'X'];
        if (i === arr.length) return shipSet;

        for (let s of arr[i]) {
            if (!invalid.includes(s) && !shipSet.has(s)) {
                shipSet.add(s);
            }
        }

        return findAllShips(arr, i + 1, shipSet);
    }
    return {
        placeShip: (ship, xCor, yCor, isVertical) => {
            const alignmentX = isVertical;
            for (let i = 0; i < ship.length; i++) {
                if (xCor < 0 || xCor > row - 1 || yCor < 0 || yCor > col - 1)
                    throw new Error('Out of bound');
                if (board[xCor][yCor] !== '') {
                    throw new Error(
                        'Can not place ship, if the position is occupied',
                    );
                }
                board[xCor][yCor] = ship;
                if (alignmentX) yCor++;
                else xCor++;
            }
        },
        getBoard: () => board,

        receiveAttack: (xCor, yCor) => {
            if (xCor < 0 || xCor > 9 || yCor < 0 || yCor > 9)
                throw new Error('Out of bound');

            if (board[xCor][yCor] === 'X' || board[xCor][yCor] === 0)
                throw new Error('Can not hit the same coordinate twice');

            if (board[xCor][yCor] !== '') {
                let shipHit = board[xCor][yCor];
                shipHit.hit();
                board[xCor][yCor] = 'X';
            } else {
                board[xCor][yCor] = 0;
            }
        },

        isAllShipSunk: () => {
            return [...findAllShips()].every((ship) => ship.isSunk());
        },
    };
}
