import { Player } from '../src/modules/player';
import { gameBoard } from '../src/modules/gameBoard';
import { createShip } from '../src/modules/ship';

describe('Player class test', () => {
    beforeEach(() => {
        aiBoard = gameBoard();
        realBoard = gameBoard();
        realPlayer = new Player('James', realBoard);
        aiPlayer = new Player('Test1', aiBoard, 'computer');
    });

    test('initialize valid Player instance', () => {
        expect(aiPlayer.gameBoard).toBeInstanceOf(gameBoard);
        expect(aiPlayer.type).toBe('computer');
        expect(aiPlayer.playerName).toBe('Test1');
    });

    test('initialize real type of Player instance', () => {
        expect(realPlayer.gameBoard).toBeInstanceOf(gameBoard);
        expect(realPlayer.type).toBe('real');
        expect(realPlayer.playerName).toBe('James');
    });

    test('each player a unique instance', () => {
        expect(realPlayer).not.toBe(aiPlayer);
        expect(realPlayer.gameBoard).not.toBe(aiPlayer.gameBoard);
    });
});
