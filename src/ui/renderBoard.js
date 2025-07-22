import { Player } from '../modules/player.js';
import { gameBoard } from '../modules/gameBoard.js';
import { createShip } from '../modules/ship';
import { domController, createForm, component } from './domController.js';
import { gameUtils } from '../modules/gameUtils.js';

export function createBoardUI(board, parent, toDrag = false) {
    if (!Array.isArray(board)) return;

    for (let i = 0; i < board.length; i++) {
        let x = i;
        let y = 0;

        board[i].forEach((element, index) => {
            const box = document.createElement('div');
            box.classList.add('cor');

            if (element || element === 0) {
                let ship = document.createElement('div');
                if (element === 'X') ship.classList.add('ship-hit');
                else if (element === 0) ship.classList.add('missed');
                else {
                    ship.classList.add('ship');
                }
                ship.draggable = true;
                ship.dataset.xCor = x;
                ship.dataset.yCor = y;

                ship.dataset.index = index;
                // chap ship missed to box
                ship.dataset.type = element.name;
                box.appendChild(ship);
            }
            box.dataset.xCor = x;
            box.dataset.yCor = y;
            y++;

            parent.appendChild(box);
        });
    }
}

const utils = gameUtils();
const playerOneBoard = gameBoard();
const playerOne = new Player('Player One', playerOneBoard);

const playerTwoBoard = gameBoard();
const playerTwo = new Player('Adams', playerTwoBoard);
domController.playerOneInfo.textContent = playerOne.playerName;

function placeShip(player, status = '') {
    const ships = {
        Carrier: 5,
        Battleship: 4,
        Destroyer: 3,
        Submarine: 3,
        PatrolBoat: 3,
    };

    const defaultShipsLoc = {
        Carrier: { xCor: 1, yCor: 0 },
        Battleship: { xCor: 3, yCor: 0 },
        Destroyer: { xCor: 5, yCor: 0 },
        Submarine: { xCor: 7, yCor: 0 },
        PatrolBoat: { xCor: 9, yCor: 0 },
    };

    if (status === 'random') {
        Object.entries(ships).forEach(([key, value]) => {
            const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
            let ship = createShip(key, value);
            let { xCor, yCor } = utils.generateShipCor(value, orientation);
            const isHorizontal = orientation === 'vertical';
            player.gameBoard.placeShip(ship, xCor, yCor, isHorizontal);
        });
        utils.clearShipPos();
    } else if (status === 'drag') {
        Object.entries(ships).forEach(([key, value]) => {
            let ship = createShip(key, value);
            if (!(key in defaultShipsLoc)) return;
            else if (defaultShipsLoc[key])
                player.gameBoard.placeShip(
                    ship,
                    defaultShipsLoc[key].xCor,
                    defaultShipsLoc[key].yCor,
                    true,
                );
        });
    }
}

// placeShip(playerOne);
placeShip((playerTwo.random = 'random'));

let currentPlayer = playerOne;
let activeBoard;

export function game() {
    resetBoardUI();
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

function loadPrompt() {
    createForm();
    component.form.addEventListener('submit', SetPlayerPref);
}

function SetPlayerPref(e) {
    e.preventDefault();
    const formData = new FormData(component.form);
    const data = Object.fromEntries(formData.entries());
    const { playerChoice, playerOneName, playerTwoName } = data;

    if (playerOneName) {
        domController.playerOneInfo.textContent = playerOneName;
    }
    // playerTwo.type === 'real' ? playerTwo.playerName || 'Player Two' : 'AI';

    console.log(playerChoice);
    console.log(playerOneName);
    console.log(playerTwoName);
    component.form.reset();
    shipStorage();
}

function shipStorage() {
    component.playerSetts.innerHTML = '';
    component.placeHolder.classList.add('ship-holder');

    const ships = {
        Carrier: 5,
        Battleship: 4,
        Destroyer: 3,
        Submarine: 3,
        PatrolBoat: 3,
    };

    const shipStor = new Player('ship location', gameBoard());
    // const board = gameBoard();
    placeShip(shipStor, 'drag');
    createBoardUI(shipStor.gameBoard.getBoard(), component.placeHolder);

    component.playerSetts.appendChild(component.placeHolder);

    component.placeHolder.querySelectorAll('.ship').forEach((el) => {
        // el.addEventListener('dragstart', (ev) => {
        //     el.classList.add('beingDragged');
        //     const data = ev.target.dataset.type;
        //     // const dataType = ev.target.dataset.type;
        //     console.log(ev);
        //     let ship = document.querySelectorAll(`[data-type = "${data}"]`);
        //     ship.forEach((el) => {
        //         if (el.dataset.index !== ev.target.dataset.index)
        //             el.classList.add('hide');
        //     });

        //     ev.dataTransfer.setData('text/html', ship);

        //     ev.dataTransfer.dropEffect = 'move';
        // });

        // el.addEventListener('dragend', () => {
        //     el.classList.remove('beingDragged');
        //     el.classList.remove('ship');
        // });
        let isMoving = false;
        el.style.position = 'absolute'
        el.style.zIndex =  1000

        el.addEventListener('mousedown', (e) => {
            let shiftX = e.clientX - el.getBoundingClientRect().left;
            let shiftY = e.clientY - el.getBoundingClientRect().top;

            
            el.style.left = e.clientX - shiftX + 'px';
            el.style.top = e.clientY - shiftY + 'px';
            isMoving = true;

            domController.boardWrapper.addEventListener('mousemove', (e) => {
                if (isMoving) {
                    el.style.left = e.clientX - shiftX + 'px';
                    el.style.top = e.clientY - shiftY + 'px';
                }
            });
        });
    });
    // document.querySelectorAll('.board-one .cor').forEach((el) => {
    //     el.classList.add('dropZone');
    //     el.addEventListener('dragover', (e) => {
    //         e.preventDefault();
    //         el.classList.add('active');
    //         e.dataTransfer.dropEffect = 'move';
    //     });

    //     el.addEventListener('drop', (e) => {
    //         e.preventDefault();

    //         const data = e.dataTransfer.getData('text/html');
    //         if (data) {
    //             let ship = createShip(data, ships[data]);
    //             console.log(el);
    //             playerOne.gameBoard.placeShip(
    //                 ship,
    //                 el.dataset.xCor,
    //                 el.dataset.yCor,
    //             );
    //         }
    //         console.log(shipStor.gameBoard.getBoard());
    //         resetBoardUI();
    //     });
    // });
}

function resetBoardUI() {
    domController.boardOne.innerHTML = '';
    domController.boardTwo.innerHTML = '';

    createBoardUI(playerOne.gameBoard.getBoard(), domController.boardOne);
    createBoardUI(playerTwo.gameBoard.getBoard(), domController.boardTwo);
}
// still ion drag, trying to use the index and type to locate movable ship
function moveAt(event, pageX, pageY) {
    event.style.left = pageX - event.offsetWidth / 2 + 'px';
    event.style.top = pageY - event.offsetHeight / 2 + 'px';
}
