// Gameboards should be able to place ships at specific coordinates by calling the ship factory or class.
// Gameboards should have a receiveAttack function that takes a pair of coordinates,
//  determines whether or not the attack hit a ship and then sends the ‘hit’ function to the correct ship,
//  or records the coordinates of the missed shot.
// Gameboards should keep track of missed attacks so they can display them properly.
// Gameboards should be able to report whether or not all of their ships have been sunk.

import { gameBoard } from '../src/modules/gameBoard';

describe('gameBoard and its methods', () => {
    beforeEach(() => {
        gb = gameBoard();
        board = gb.getBoard();
    });
    let shipName = 'Destroyer';

    test('validate 2d board', () => {
        expect(board.length).toBe(10);
        expect(board[3].length).toBe(10);
    });

    test('reject placement if position is already filled', () => {
        let [xCor, yCor] = [0, 0];
        let isVertical = true;
        gb.placeShip(shipName, 3, xCor, yCor, isVertical);
        expect(() => gb.placeShip(shipName, 3, xCor, yCor, isVertical)).toThrow(
            new Error('Can not place ship, if the position is occupied'),
        );
    });

    test('reject placement if out of bound', () => {
        let [xCor, yCor] = [10, 0];
        let isVertical = true;
        expect(() => gb.placeShip(shipName, 3, xCor, yCor, isVertical)).toThrow(
            new Error('Out of bound'),
        );
    });

    test('place ships at specified coordinates in x-axis', () => {
        let [xCor, yCor] = [0, 0];
        let isVertical = false;

        gb.placeShip(shipName, 3, xCor, yCor, isVertical);
        expect(board[0][yCor]).toBe(shipName);
        expect(board[1][yCor]).toBe(shipName);
        expect(board[2][yCor]).toBe(shipName);
    });

    test('place ships at specified coordinates in y-axis', () => {
        let [xCor, yCor] = [0, 0];
        let isVertical = true;

        gb.placeShip(shipName, 3, xCor, yCor, isVertical);
        expect(board[xCor][0]).toBe(shipName);
        expect(board[xCor][1]).toBe(shipName);
        expect(board[xCor][2]).toBe(shipName);
    });
});
