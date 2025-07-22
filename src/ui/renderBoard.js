import { Player } from '../modules/player.js';
import { gameBoard } from '../modules/gameBoard.js';
import { createShip } from '../modules/ship';
import { domController, createForm, component } from './domController.js';
import { gameUtils } from '../modules/gameUtils.js';

export class createGame {
    constructor() {
        this.utils = gameUtils();
        this.playerOne = new Player('Player One', gameBoard());
        this.playerTwo = new Player('Adams', gameBoard());
        this.currentPlayer = this.playerOne;
        this.activeBoard = null;
    }

    game() {
        this.resetBoardUI();
        this.loadPrompt(); // temp location
        this.gameTurn();
        domController.boardWrapper.addEventListener(
            'click',
            this.#handleBoxClick.bind(this),
        );
    }

    loadPrompt() {
        createForm();
        component.form.addEventListener('submit',  this.setPlayerPref.bind(this));
    }

    createPlayers() {
        // const playerOneBoard = gameBoard();
        // const playerTwoBoard = gameBoard();
        // domController.playerOneInfo.textContent = this.playerOne.playerName;
    }

    createBoardUI(board, parent) {
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

    #shipsInfo() {
        return {
            Carrier: 5,
            Battleship: 4,
            Destroyer: 3,
            Submarine: 3,
            PatrolBoat: 3,
        };
    }
    placeShip(player, status = '') {
        // needs refactoring
        const ships = this.#shipsInfo();
        const defaultShipsLoc = {
            Carrier: { xCor: 1, yCor: 0 },
            Battleship: { xCor: 3, yCor: 0 },
            Destroyer: { xCor: 5, yCor: 0 },
            Submarine: { xCor: 7, yCor: 0 },
            PatrolBoat: { xCor: 9, yCor: 0 },
        };

        if (status === 'random') {
            Object.entries(ships).forEach(([key, value]) => {
                const orientation =
                    Math.random() < 0.5 ? 'horizontal' : 'vertical';
                let ship = createShip(key, value);
                let { xCor, yCor } = this.utils.generateShipCor(
                    value,
                    orientation,
                );
                const isHorizontal = orientation === 'vertical';
                player.gameBoard.placeShip(ship, xCor, yCor, isHorizontal);
            });
            this.utils.clearShipPos();
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

    #handleBoxClick(e) {
        const target = e.target;
        const cor = target.closest('.cor');
        if (!cor) return;
        if (cor.querySelector('.missed') || cor.querySelector('.ship-hit'))
            return;
        if (!cor.closest(`.${activeBoard.className}`)) return;
        // send Cor
        const xCor = target.dataset.xCor;
        const yCor = target.dataset.yCor;
        let ship = this.currentPlayer.gameBoard.getBoard()[xCor][yCor];

        this.currentPlayer.gameBoard.receiveAttack(xCor, yCor);
        if (ship)
            console.log(`${ship.name}: ${ship.isSunk() ? 'sunk' : 'Not Sunk'}`);
        this.resetBoardUI();
    }

    gameTurn() {
        this.currentPlayer =
            this.currentPlayer === this.playerOne
                ? this.playerTwo
                : this.playerOne;
        this.activeBoard =
            this.currentPlayer === this.playerOne
                ? domController.boardOne
                : domController.boardTwo;
        console.log(this.activeBoard.className);
        return;
    }

    #confirmShipsStatus(gameBoard) {
        if (gameBoard.isAllShipSunk()) {
        }
    }

    resetBoardUI() {
        domController.boardOne.innerHTML = '';
        domController.boardTwo.innerHTML = '';

        this.createBoardUI(
            this.playerOne.gameBoard.getBoard(),
            domController.boardOne,
        );
        this.createBoardUI(
            this.playerTwo.gameBoard.getBoard(),
            domController.boardTwo,
        );
    }

    shipStorage() {
        component.playerSetts.innerHTML = '';
        component.placeHolder.classList.add('ship-holder');

        const ships = this.#shipsInfo();
        const shipStor = new Player('ship location', gameBoard());
        // const board = gameBoard();
        this.placeShip(shipStor, 'drag');
        this.createBoardUI(
            shipStor.gameBoard.getBoard(),
            component.placeHolder,
        );

        component.playerSetts.appendChild(component.placeHolder);

        // component.placeHolder.querySelectorAll('.ship').forEach((el) => {
        //     // el.addEventListener('dragstart', (ev) => {
        //     //     el.classList.add('beingDragged');
        //     //     const data = ev.target.dataset.type;
        //     //     // const dataType = ev.target.dataset.type;
        //     //     console.log(ev);
        //     //     let ship = document.querySelectorAll(`[data-type = "${data}"]`);
        //     //     ship.forEach((el) => {
        //     //         if (el.dataset.index !== ev.target.dataset.index)
        //     //             el.classList.add('hide');
        //     //     });

        //     //     ev.dataTransfer.setData('text/html', ship);

        //     //     ev.dataTransfer.dropEffect = 'move';
        //     // });

        //     // el.addEventListener('dragend', () => {
        //     //     el.classList.remove('beingDragged');
        //     //     el.classList.remove('ship');
        //     // });
        //     let isMoving = false;
        //     el.style.position = 'absolute';
        //     el.style.zIndex = 1000;

        //     el.addEventListener('mousedown', (e) => {
        //         let shiftX = e.clientX - el.getBoundingClientRect().left;
        //         let shiftY = e.clientY - el.getBoundingClientRect().top;

        //         el.style.left = e.clientX - shiftX + 'px';
        //         el.style.top = e.clientY - shiftY + 'px';
        //         isMoving = true;

        //         domController.boardWrapper.addEventListener('mousemove', (e) => {
        //             if (isMoving) {
        //                 el.style.left = e.clientX - shiftX + 'px';
        //                 el.style.top = e.clientY - shiftY + 'px';
        //             }
        //         });
        //     });
        // });
    }
    setPlayerPref(e) {
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
        this.shipStorage();

        component.form.reset();
    }
}

// placeShip(playerOne);
// placeShip((playerTwo.random = 'random'));

// turn logic
// and know if a ship is sunk

// still ion drag, trying to use the index and type to locate movable ship
