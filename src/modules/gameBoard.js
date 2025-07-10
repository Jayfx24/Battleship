export function gameBoard() {
    let [row, col] = [10, 10];

    let board = Array.from({ length: row }, () => Array(col).fill(''));
    return {
        placeShip: (name, length, xCor, yCor, isVertical) => {
            const alignmentY = isVertical;
            let count = 0;
            for (let i = 0; i < length; i++) {
                if (xCor < 0 || xCor > 9 || yCor < 0 || yCor > 9)
                    throw new Error('Out of bound');
                if (board[xCor][yCor] !== '') {
                    throw new Error(
                        'Can not place ship, if the position is occupied',
                    );
                }

                // board[xCor][yCor] = `${name} placement ${count}`;
                board[xCor][yCor] = name;
                count++;

                if (alignmentY) yCor++;
                else xCor++;
            }
        },
        getBoard: () => board,

        receiveAttack: (xCor, yCor) => {
            if (xCor < 0 || xCor > 9 || yCor < 0 || yCor > 9)
                throw new Error('Out of bound');
            board[xCor][yCor] = 'X'
            console.log(board)
        },
        missedAttack: () => {},
        isAllShipSUnk: () => {},
    };
}


