// Gameboards should be able to place ships at specific coordinates by calling the ship factory or class.
// Gameboards should have a receiveAttack function that takes a pair of coordinates,
//  determines whether or not the attack hit a ship and then
// Gameboards should keep track of missed attacks so they can display them properly.
// Gameboards should be able to report whether or not all of their ships have been sunk.

import { gameBoard } from '../src/modules/gameBoard';
import { createShip } from '../src/modules/ship';

describe('gameBoard and its methods', () => {
    beforeEach(() => {
        gb = gameBoard();
        board = gb.getBoard();
        ship = createShip('Destroyer', 3);
    });

    test('validate 2d board', () => {
        expect(board.length).toBe(10);
        expect(board[3].length).toBe(10);
    });

    describe('placement tests ', () => {
        test('reject placement if position is already filled', () => {
            let [xCor, yCor] = [0, 0];
            let isVertical = true;
            gb.placeShip(ship, xCor, yCor, isVertical);
            expect(() => gb.placeShip(ship, xCor, yCor, isVertical)).toThrow(
                new Error('Can not place ship, if the position is occupied'),
            );
        });

        test('reject placement if out of bound', () => {
            let [xCor, yCor] = [10, 0];
            let isVertical = true;
            expect(() => gb.placeShip(ship, xCor, yCor, isVertical)).toThrow(
                new Error('Out of bound'),
            );
        });

        test('place ships at specified coordinates in x-axis', () => {
            let [xCor, yCor] = [0, 0];
            let isVertical = false;

            gb.placeShip(ship, xCor, yCor, isVertical);
            expect(board[0][yCor]).toEqual(ship);
            expect(board[1][yCor]).toEqual(ship);
            expect(board[2][yCor]).toEqual(ship);
        });

        test('place ships at specified coordinates in y-axis', () => {
            let [xCor, yCor] = [0, 0];
            let isVertical = true;

            gb.placeShip(ship, xCor, yCor, isVertical);
            expect(board[xCor][0]).toEqual(ship);
            expect(board[xCor][1]).toEqual(ship);
            expect(board[xCor][2]).toEqual(ship);
        });
    });

    describe('receive attack on coordinates tests', () => {
        let [xCor, yCor] = [0, 0];
        let isVertical = false;

        test('Out of Bound', () => {
            expect(() => gb.receiveAttack(10, 0)).toThrow(
                new Error('Out of bound'),
            );
        });

        test('coordinate hit ship successfully', () => {
            let isVertical = false;

            gb.placeShip(ship, xCor, yCor, isVertical);
            expect(() => gb.receiveAttack(0, 0)).toBeTruthy();
        });

        test('hit ship reduces the hit', () => {
            gb.placeShip(ship, xCor, yCor, isVertical);
            gb.receiveAttack(0, 0);
            expect(ship.getHits()).toBe(1);
        });

        test('hit ship should not sink if hitScore < ship length', () => {
            gb.placeShip(ship, xCor, yCor, isVertical);
            gb.receiveAttack(0, 0);
            expect(ship.isSunk()).toBeFalsy();
        });

        test('hit ships should sink if hitScore is equal ship length', () => {
            gb.placeShip(ship, xCor, yCor, isVertical);

            for (let i = 0; i < ship.length; i++)
                gb.receiveAttack(xCor + i, yCor);

            expect(ship.isSunk()).toBeTruthy();
        });

        test('coordinate hit water successfully', () => {
            expect(() => gb.receiveAttack(1, 0)).toBeTruthy();
        });

        test('if coordinate hit more than once', () => {
            gb.receiveAttack(xCor, yCor);
            expect(() => gb.receiveAttack(xCor, yCor)).toThrow(
                new Error('Can not hit the same coordinate twice'),
            );
        });

        const boat = createShip('boat', 4);
        const carrier = createShip('Carrier', 7);

        test('returns true if all ships are sunk', () => {
            gb.placeShip(ship, 0, 0, false);
            gb.placeShip(boat, 0, 1, false);
            gb.placeShip(carrier, 0, 3, false);
            for (s of [ship, boat, carrier])
                for (let i = 0; i < s.length; i++) s.hit();
            let shipSunk = gb.isAllShipSunk()
            expect(shipSunk).toBeTruthy();
        });

        test('returns false if not all ships are sunk', () => {
            gb.placeShip(ship, 0, 0, false);
            gb.placeShip(boat, 0, 1, false);
            gb.placeShip(carrier, 0, 3, false);
            for (s of [ship, carrier])
                for (let i = 0; i < s.length; i++) s.hit();

            gb.receiveAttack(xCor, yCor);
            let shipSunk = gb.isAllShipSunk()
            expect(shipSunk).toBeFalsy();
        });
    });
});
