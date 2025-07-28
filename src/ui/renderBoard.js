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
        this.offsetX = this.offsetY = this.isDragging = false;
        this.currentDraggable = null;
        this.bondMouseMove = this.mouseMove.bind(this);
        this.bondMouseUp = this.mouseUp.bind(this);
        this.dragStartLoc = null;
        this.orientation = true;
        this.isDragging = false;
        this.rect = null;
        this.parentRect = null;
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
        component.form.addEventListener(
            'submit',
            this.setPlayerPref.bind(this),
        );
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
                    // ship.draggable = true;
                    ship.dataset.xCor = x;
                    ship.dataset.yCor = y;
                    ship.dataset.positioning = element.orientation;
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
    placeShip(player, status = 'random') {
        // needs refactoring
        const ships = this.#shipsInfo();
        const defaultShipsLoc = {
            Carrier: { xCor: 0, yCor: 0 },
            Battleship: { xCor: 1, yCor: 0 },
            Destroyer: { xCor: 2, yCor: 0 },
            Submarine: { xCor: 3, yCor: 0 },
            PatrolBoat: { xCor: 4, yCor: 0 },
        };

        if (status === 'random') {
            Object.entries(ships).forEach(([key, value]) => {
                const isHorizontal = Math.random() < 0.5 ? true : false;
                let ship = createShip(key, value);
                let { xCor, yCor } = this.utils.generateShipCor(
                    value,
                    isHorizontal,
                );
                // const isHorizontal = orientation === 'vertical';
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
        if (!cor.closest(`.${this.activeBoard.className}`)) return;
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

        // this.dragEnd()
    }

    shipStorage() {
        component.playerSetts.innerHTML = '';
        component.placeHolder.classList.add('ship-holder');

        const ships = this.#shipsInfo();
        const board = gameBoard(6, 6);
        const defaultShipsLoc = {
            Carrier: { xCor: 0, yCor: 0 },
            Battleship: { xCor: 1, yCor: 0 },
            Destroyer: { xCor: 2, yCor: 0 },
            Submarine: { xCor: 3, yCor: 0 },
            PatrolBoat: { xCor: 4, yCor: 0 },
        };
        let count = 0;
        Object.entries(ships).forEach(([key, value]) => {
            count++;

            if (!(key in defaultShipsLoc)) return;
            else if (defaultShipsLoc[key]) {
                let shipLayer = document.createElement('div');
                shipLayer.classList.add('ship-layer');
                shipLayer.classList.add(`${key}`);
                shipLayer.dataset.type = key;
                // shipLayer.draggable = true;
                for (let i = 0; i < value; i++) {
                    let box = document.createElement('div');
                    box.classList.add('dock-ship');

                    shipLayer.appendChild(box);
                }

                component.placeHolder.appendChild(shipLayer);
            }
        });
        // this.placeShip(shipStor, 'drag',false);

        component.playerSetts.appendChild(component.placeHolder);

        this.dragStart();
    }

    dragStart() {
        domController.boardWrapper.addEventListener('mousedown', (e) => {
            const target = e.target.closest('.ship-layer');
            if (!target) return;
            this.currentDraggable = target;

            this.mouseDown(e);
        });
        // document.querySelectorAll('.ship-layer').forEach((el) => {
        //     el.addEventListener('mousedown', (e) => {
        //         this.currentDraggable = el;

        //         this.mouseDown(e);
        //     });
        // });
        this.rotateShip();
    }

    mouseDown(e) {
        e.preventDefault();
        // const draggable = e.target
        this.rect = this.currentDraggable.getBoundingClientRect();
        this.parentRect = component.placeHolder.getBoundingClientRect();
        this.dragStartLoc = [
            this.rect.left - this.parentRect.left,
            this.rect.top - this.parentRect.top,
        ];
        this.currentDraggable.style.zIndex = 1000;
        this.currentDraggable.style.position = 'absolute';
        this.offsetX = e.clientX - this.currentDraggable.offsetLeft;
        this.offsetY = e.clientY - this.currentDraggable.offsetTop;
        this.isDragging = true;

        this.currentDraggable.style.cursor = 'grabbing';
        domController.boardWrapper.addEventListener(
            'mousemove',
            this.bondMouseMove,
        );

        domController.boardWrapper.addEventListener(
            'mouseup',
            this.bondMouseUp,
        );
    }

    mouseMove(e) {
        e.preventDefault();

        if (this.isDragging) {
            this.currentDraggable.style.left = e.clientX - this.offsetX + 'px';
            this.currentDraggable.style.top = e.clientY - this.offsetY + 'px';
        }
    }

    mouseUp(e) {
        if (!this.isDragging) return;
        e.preventDefault();

        // this.currentDraggable.style.cursor = 'move'

        this.dragTarget(e);

        domController.boardWrapper.removeEventListener(
            'mousemove',
            this.bondMouseMove,
        );
        domController.boardWrapper.removeEventListener(
            'mouseup',
            this.bondMouseUp,
        );

        this.currentDraggable = null;
        // this.dragStart()
    }
    dragTarget(e) {
        e.preventDefault();
        if (!this.isDragging) return;
        this.isDragging = false;
        const shipEleRect =
            this.currentDraggable.firstElementChild.getBoundingClientRect();
        const dropZone = domController.boardOne.getBoundingClientRect();
        console.log(dropZone.left);
        console.log(shipEleRect.left);
        if (
            shipEleRect.right <= dropZone.right &&
            shipEleRect.left >= dropZone.left &&
            shipEleRect.top >= dropZone.top &&
            shipEleRect.bottom <= dropZone.bottom
        ) {
            this.currentDraggable.style.visibility = 'hidden';
            const centerX = shipEleRect.left + shipEleRect.width / 2;
            const centerY = shipEleRect.top + shipEleRect.height / 2;
            const below = document.elementFromPoint(e.clientX, e.clientY);
            const firstBelow = document.elementFromPoint(centerX, centerY);

            // console.log(below, firstBelow);
            const ships = this.#shipsInfo();

            // use first ele of ship to find loc or curs
            const target = firstBelow?.closest('.cor') || below.closest('.cor');

            if (target) {
                const type = this.currentDraggable.dataset.type;
                const xCor = parseInt(target.dataset.xCor);
                const yCor = parseInt(target.dataset.yCor);

                const ship = createShip(type, ships[type]);

                if (this.checkIfValidDrop(ship, xCor, yCor, this.orientation)) {
                    this.playerOne.gameBoard.placeShip(
                        ship,
                        xCor,
                        yCor,
                        this.orientation,
                    );

                    this.resetBoardUI();
                    // this.currentDraggable.style.visibility = 'visible';
                    // this.dragOnBoard()

                    return;
                } else {
                    this.currentDraggable.style.visibility = 'visible';
                    this.currentDraggable.style.left =
                        this.dragStartLoc[0] + 'px';
                    this.currentDraggable.style.top =
                        this.dragStartLoc[1] + 'px';
                    return;
                }
            }
        } else {
            this.currentDraggable.style.visibility = 'visible';
            this.currentDraggable.style.left = this.dragStartLoc[0] + 'px';
            this.currentDraggable.style.top = this.dragStartLoc[1] + 'px';
            return;
        }
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

        // console.log(playerChoice);
        // console.log(playerOneName);
        // console.log(playerTwoName);
        this.shipStorage();

        component.form.reset();
    }

    checkIfValidDrop(ship, xCor, yCor, isHorizontal) {
        if (!ship) return false;
        if (isHorizontal && yCor + ship.length > 10) return false;
        if (!isHorizontal && xCor + ship.length > 10) return false;

        const filled = this.playerOne.gameBoard.occupiedLocs();
        if (filled.has(`${xCor},${yCor}`)) filled.delete(`${xCor},${yCor}`);
        if (
            !this.utils.isEmpty(filled, xCor, yCor, ship.length, isHorizontal)
        ) {
            console.log('workinh');
            return false;
        }

        return true;
    }

    dragOnBoard() {
        domController.boardOne.addEventListener('mousedown', (e) => {
            const target = e.target.closest('.cor');

            if (!target) return;
            const child = target.querySelector('.ship');
            if (!child) return;
            const ship = document.querySelector(
                `.ship-layer[data-type="${child.dataset.type}"]`,
            );
            // console.log(target.closest('.ship-layer'));
            ship.style.visibility = 'visible';

            ship.style.left = ship.style.left - e.clientX + 'px';
            ship.style.top = ship.style.top - e.clientY + 'px';

            this.playerOne.gameBoard.removeShip(child.dataset.type);
            this.resetBoardUI();
        });
    }

    rotateShip() {
        const ships = this.#shipsInfo();
        domController.boardOne.addEventListener('click', (e) => {
            const target = e.target.closest('.cor');

            if (!target) return;
            const child = target.querySelector('.ship');
            // const firstChild =
            if (!child) return;
            const shipType = child.dataset.type;
            const currentShipLoc = document.querySelectorAll(
                `.ship[data-type="${shipType}"]`,
            );
            const firstChild = currentShipLoc[0];
            const shipHead = firstChild.closest('.cor');

            const positioning =
                child.dataset.positioning === 'true' ? false : true;
            // this.orientation = positioning;
            const xCor = parseInt(shipHead.dataset.xCor);
            const yCor = parseInt(shipHead.dataset.yCor);
            const ship = createShip(shipType, ships[shipType], positioning);

            if (this.checkIfValidDrop(ship, xCor, yCor, positioning)) {
                this.playerOne.gameBoard.removeShip(child.dataset.type);
                this.playerOne.gameBoard.placeShip(
                    ship,
                    xCor,
                    yCor,
                    positioning,
                );

                this.resetBoardUI();
            }
        });
    }
}
// add orientation to ship
