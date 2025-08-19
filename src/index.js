import { createGame } from './ui/renderBoard.js';
import './style.css';

function app() {
    
    const game = new createGame();
    game.game();
}

app()

window.addEventListener("DOMContentLoaded", () => {
document.body.style.visibility = "visible";
});

