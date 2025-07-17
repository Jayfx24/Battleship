import { Player } from '../modules/player.js';
import { gameBoard } from '../modules/gameBoard.js';
import { createShip } from '../modules/ship';
import { domController,createForm,component } from './domController.js';
import { gameUtils } from '../modules/gameUtils.js';





export function createBoardUI(board, parent) {
    if (!Array.isArray(board)) return;

    for (let i = 0; i < board.length; i++) {
        let x = i;
        let y = 0;

        board[i].forEach((element) => {
            const box = document.createElement('div');
            box.classList.add('cor');
            // box.textContent = element;
            if (element || element === 0) {
                let ship = document.createElement('div');
                if (element === 'X') ship.classList.add('ship-hit');
                else if (element === 0) ship.classList.add('missed');
                else {
                    ship.classList.add('ship');
                }
                box.appendChild(ship);
            }
            box.dataset.xCor = x;
            box.dataset.yCor = y;
            box.dataset.type = element.name;
            y++;

            parent.appendChild(box);
        });
    }
}

const utils = gameUtils();
const players = {};
const playerOneBoard = gameBoard();
const playerOne = new Player('James', playerOneBoard);

const playerTwoBoard = gameBoard();
const playerTwo = new Player('Adams', playerTwoBoard);

// domController.playerOneInfo.textContent = playerOne.playerName || 'Player-One';
// domController.playerTwoInfo.textContent =
//     playerTwo.type === 'real' ? playerTwo.playerName || 'Player Two' : 'AI';

function placeShip(player) {
    const ships = {
        Battleship: 4,
        Destroyer: 3,
        Submarine: 3,
        Carrier: 5,
        'Patrol Boat': 3,
    };

    Object.entries(ships).forEach(([key, value]) => {
        const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        let ship = createShip(key, value);
        let { xCor, yCor } = utils.generateShipCor(value, orientation);
        const isVertical = orientation === 'vertical';
        player.gameBoard.placeShip(ship, xCor, yCor, isVertical);
    });
    utils.clearShipPos();
}

placeShip(playerOne);
placeShip(playerTwo);
// let battleShip = createShip('Battleship', 4);
// let carrier = createShip('Carrier', 5);
// let Destroyer = createShip('Destroyer', 3);
// let submarine = createShip('submarine', 3);
// let patrolBoat = createShip('Patrol bOat', 2);

// playerOne.gameBoard.placeShip(battleShip, 0, 0);
// playerOne.gameBoard.placeShip(carrier, 0, 1);
// playerOne.gameBoard.placeShip(Destroyer, 0, 2);
// playerOne.gameBoard.placeShip(submarine, 0, 3);
// playerOne.gameBoard.placeShip(patrolBoat, 0, 4);

let currentPlayer = playerOne;
let activeBoard;

export function game() {
    domController.boardOne.innerHTML = '';
    domController.boardTwo.innerHTML = '';
    createBoardUI(playerOne.gameBoard.getBoard(), domController.boardOne);
    createBoardUI(playerTwo.gameBoard.getBoard(), domController.boardTwo);
    loadPrompt(); // temp location
    gameTurn();
    domController.boardWrapper.addEventListener('click', handleBoxClick);
}

export function handleBoxClick(e) {
    const target = e.target;
    const cor = target.closest('.cor');
    if (!cor) return;
    if (cor.querySelector('.missed') || cor.querySelector('.ship-hit')) return;
    if (!cor.closest(`.${activeBoard.className}`)) return;
    // send Cor
    const xCor = target.dataset.xCor;
    const yCor = target.dataset.yCor;
    let ship = currentPlayer.gameBoard.getBoard()[xCor][yCor];

    currentPlayer.gameBoard.receiveAttack(xCor, yCor);
    if (ship)
        console.log(`${ship.name}: ${ship.isSunk() ? 'sunk' : 'Not Sunk'}`);
    game();
}
// turn logic
// and know if a ship is sunk
function gameTurn() {
    currentPlayer = currentPlayer === playerOne ? playerTwo : playerOne;
    activeBoard =
        currentPlayer === playerOne
            ? domController.boardOne
            : domController.boardTwo;
    console.log(activeBoard.className);
    return;
}

function confirmShipsStatus(gameBoard) {
    if (gameBoard.isAllShipSunk()) {
        // show who own and ask if user wants to play again
    }
}


function loadPrompt(){
    // createForm()
    component.form.addEventListener('submit', SetPlayerPref);
}

function SetPlayerPref(e){
    e.preventDefault()
    const formData = new FormData(component.form)
    const data = Object.fromEntries(formData.entries())
    const {playerChoice, playerOneName, playerTwoName} = data


    console.log(playerChoice)
    console.log(playerOneName)
    console.log(playerTwoName)
}