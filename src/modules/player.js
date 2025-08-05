export class Player {
    constructor(playerName = 'Player', gameBoard,type='real') {
        this.name = playerName;
        this.gameBoard = gameBoard;
        this.type = type
    }
}
