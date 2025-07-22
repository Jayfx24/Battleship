import { domController } from './ui/domController.js';
import { createGame } from './ui/renderBoard.js';
import './style.css';

function app() {
    const game = new createGame();
    game.game();
}

app();

// Ask if 1 v 1 or 1 v AI
// ALWAYS COMMIT
// drag and drop
// figure out how to the the div length of the side
