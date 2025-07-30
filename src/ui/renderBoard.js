import { Player } from '../modules/player.js';
import { gameBoard } from '../modules/gameBoard.js';
import { createShip } from '../modules/ship';
import {
    domController,
    createForm,
    component,
    confirmPlacement,
    resetPlacementBoard,
    afterPlacement,
} from './domController.js';
import { gameUtils } from '../modules/gameUtils.js';

export class createGame {
    constructor() {
        this.utils = gameUtils();
        this.playerOne = new Player('Player One', gameBoard());
        this.playerTwo = new Player('Adams', gameBoard());
        this.currentPlayer = this.playerOne;
        this.activeBoard = domController.boardTwo;
        this.currentPlayerPlacement = this.playerOne;
        this.activePlacementBoard = domController.boardOne;
        this.startX =
            this.startY =
            this.offsetX =
            this.offsetY =
            this.isDragging =
            this.mousedownFired =
                false;
        this.currentDraggable = null;
        this.bondMouseMove = this.mouseMove.bind(this);
        this.bondMouseUp = this.mouseUp.bind(this);
        this.boundRotate = this.rotateShip.bind(this);
        this.dragStartLoc = null;
        this.orientation = true;
        this.rect = null;
        this.parentRect = null;
        // this.iRotate = false
    }

    game() {
        this.resetBoardUI();
        this.loadPrompt(); // temp location
        // this.gameTurn();
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
              

                this.resetBoardUI();
            });
            this.utils.clearShipPos();
        }
        // else if (status === 'drag') {
        //     Object.entries(ships).forEach(([key, value]) => {
        //         let ship = createShip(key, value);
        //         if (!(key in defaultShipsLoc)) return;
        //         else if (defaultShipsLoc[key])
        //             player.gameBoard.placeShip(
        //                 ship,
        //                 defaultShipsLoc[key].xCor,
        //                 defaultShipsLoc[key].yCor,
        //                 true,
        //             );
        //     });
        // }
    }

    #handleBoxClick(e) {
        console.log(
            `player:${this.currentPlayer.playerName} turn to shoot board: ${this.activeBoard.className}`,
        );

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
        this.gameTurn();
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

        console.log(this.currentPlayer, this.activeBoard);
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
        const defaultShipsLoc = {
            Carrier: { xCor: 0, yCor: 0 },
            Battleship: { xCor: 1, yCor: 0 },
            Destroyer: { xCor: 2, yCor: 0 },
            Submarine: { xCor: 3, yCor: 0 },
            PatrolBoat: { xCor: 4, yCor: 0 },
        };
        let count = 0;
        Object.entries(ships).forEach(([key, value]) => {
            if (!(key in defaultShipsLoc)) return;
            else if (defaultShipsLoc[key]) {
                let shipLayer = document.createElement('div');
                shipLayer.classList.add('ship-layer');
                shipLayer.classList.add(`${key}`);
                shipLayer.dataset.type = key;
                for (let i = 0; i < value; i++) {
                    let box = document.createElement('div');
                    box.classList.add('dock-ship');

                    shipLayer.appendChild(box);
                }

                component.placeHolder.appendChild(shipLayer);
            }
        });

        component.playerSetts.appendChild(component.placeHolder);
        component.randomize.textContent = 'randomize';
        this.activePlacementBoard.parentElement.appendChild(
            component.randomize,
        );
        // remove from here
        const rand = () => {
            Object.entries(ships).forEach(key => this.currentPlayerPlacement.gameBoard.removeShip(key[0]))
            console.log(this.currentPlayerPlacement.gameBoard.occupiedLocs())
            this.placeShip(this.currentPlayerPlacement);
        };
        component.randomize.addEventListener('click', rand);
        this.dragStart();
    }

    dragStart() {
        // component.playerSetts.addEventListener('mousedown', (e) => {
        //     this.mouseDown(e);
        // });
        // this.activePlacementBoard.addEventListener('mousedown', (e) => {
        //     this.mouseDown(e);
        // });
        document.querySelectorAll('.ship-layer').forEach((el) => {
            el.addEventListener('mousedown', (e) => {
                this.mouseDown(e);
            });
        });
        this.activePlacementBoard.addEventListener(
            'mousedown',
            this.dragOnBoard.bind(this),
        );
        // this.activePlacementBoard.addEventListener(
        //     'click',
        //     this.boundRotate,
        // );
    }

    mouseDown(e) {
        e.preventDefault();

        // this.rect = this.currentDraggable.getBoundingClientRect();
        // this.parentRect = component.placeHolder.getBoundingClientRect();
        // this.dragStartLoc = [
        //     this.rect.left - this.parentRect.left,
        //     this.rect.top - this.parentRect.top,
        // ];
        const target = e.target.closest('.ship-layer');
        if (!target) return;
        this.currentDraggable = target;

        this.startX =
            e.clientX - parseInt(this.currentDraggable.style.left || 0);
        this.startY =
            e.clientY - parseInt(this.currentDraggable.style.top || 0);
        // this.offsetX = e.clientX - this.rect.left;
        // this.offsetY = e.clientY - this.rect.top;
        this.isDragging = true;
        console.log(this.isDragging);
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
            const newX = e.clientX - this.startX;
            const newY = e.clientY - this.startY;

            this.currentDraggable.style.left = newX + 'px';
            this.currentDraggable.style.top = newY + 'px';
        }
    }

    mouseUp(e) {
        if (!this.isDragging) return;
        e.preventDefault();

        this.currentDraggable.style.cursor = 'move';
        domController.boardWrapper.removeEventListener(
            'mousemove',
            this.bondMouseMove,
        );
        domController.boardWrapper.removeEventListener(
            'mouseup',
            this.bondMouseUp,
        );
        this.dragTarget(e);

        this.currentDraggable = null;
        // this.dragStart()
    }
    dragTarget(e) {
        e.preventDefault();
        if (!this.isDragging) return;
        this.isDragging = false;

        const shipEleRect =
            this.currentDraggable.firstElementChild.getBoundingClientRect();

        this.currentDraggable.style.visibility = 'hidden';

        const centerX = shipEleRect.left + shipEleRect.width / 2;
        const centerY = shipEleRect.top + shipEleRect.height / 2;

        const below = document.elementFromPoint(e.clientX, e.clientY);
        const firstBelow = document.elementFromPoint(centerX, centerY);

        // console.log(below, firstBelow);
        const ships = this.#shipsInfo();

        // use first ele of ship to find loc or curs
        const target = firstBelow?.closest('.cor') || below.closest('.cor');

        const handleInvalidDrop = () => {
            console.log('here');
            this.currentDraggable.style.visibility = 'visible';
            this.currentDraggable.style.left = 0;
            this.currentDraggable.style.top = 0;
        };

        if (target) {
            const playerBoard = this.currentPlayerPlacement.gameBoard;
            const type = this.currentDraggable.dataset.type;
            const xCor = parseInt(target.dataset.xCor);
            const yCor = parseInt(target.dataset.yCor);
            const board = this.activePlacementBoard.getBoundingClientRect();
            this.mousedownFired = false;

            const ship = createShip(type, ships[type]);
            const validDrop = this.checkIfValidDrop(
                ship,
                xCor,
                yCor,
                ship.orientation,
            );

            if (validDrop == true) {
                playerBoard.placeShip(ship, xCor, yCor, ship.orientation);

                if (e.clientX < board.left || e.centerY > board.top)
                    handleInvalidDrop();
                this.currentDraggable.style.left = e.clientX - this.startX;
                // console.log(this.currentDraggable.style.left)
                this.currentDraggable.style.top = e.clientY - this.startY;
                this.resetBoardUI();

                this.#handlePlacement(playerBoard);
            } else {
                handleInvalidDrop();
            }
        } else {
            handleInvalidDrop();
        }
    }

    #handlePlacement(playerBoard) {
        let firstPlayer = false;

        let clickProcess = null;
        if (playerBoard.findAllShips().size === 5) {
            if (this.currentPlayerPlacement === this.playerOne) {
                firstPlayer = true;
                confirmPlacement(firstPlayer);
                clickProcess = () => this.#handleConfirm();
            } else {
                confirmPlacement(firstPlayer);

                clickProcess = () => this.#handleAfterPlacement();
            }

            component.confirmPlacement.confirmBtn.addEventListener(
                'click',
                clickProcess,
            );
        }
    }
    #handleConfirm() {
        resetPlacementBoard();
        this.currentPlayerPlacement = this.playerTwo;
        this.activePlacementBoard = domController.boardTwo;

        // this.gameTurn();
        this.shipStorage();
    }
    #handleAfterPlacement() {
        afterPlacement();
        this.gameTurn();

        this.activePlacementBoard.removeEventListener(
            'click',
            this.boundRotate,
        );

        domController.boardWrapper.addEventListener(
            'click',
            this.#handleBoxClick.bind(this),
        );
        // this.activePlacementBoard.removeEventListener(
        //     'mousedown',
        //     this.dragOnBoard.bind(this),
        // );
        this.resetBoardUI();
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

    checkIfValidDrop(ship, xCor, yCor, isHor) {
        if (!ship) return false;
        if (isHor && yCor + ship.length > 10) return false;
        if (!isHor && xCor + ship.length > 10) return false;

        const filled = this.currentPlayerPlacement.gameBoard.occupiedLocs();

        if (!this.utils.isEmpty(filled, xCor, yCor, ship.length, isHor)) {
            return false;
        }

        return true;
    }

    dragOnBoard(e) {
        this.mousedownFired = true;
        const target = e.target.closest('.cor');
        if (!target) return;
        const child = target.querySelector('.ship');
        // console.log(child.parentElement.parentElement)

        if (!child) return;

        const ship = document.querySelector(
            `.ship-layer[data-type="${child.dataset.type}"]`,
        );
        console.log(ship);

        ship.style.visibility = 'visible';

        ship.style.left = ship.style.left - e.clientX + 'px';
        ship.style.top = ship.style.top - e.clientY + 'px';

        this.currentPlayerPlacement.gameBoard.removeShip(child.dataset.type);
        this.resetBoardUI();
    }

    rotateShip(e) {
        if (this.mousedownFired) {
            this.mousedownFired = false;
            return;
        }
        const ships = this.#shipsInfo();

        const target = e.target.closest('.cor');
        const playerBoard = this.currentPlayerPlacement.gameBoard;
        if (!target) return;
        const child = target.querySelector('.ship');
        if (!child) return;
        const shipType = child.dataset.type;
        const currentShipLoc =
            this.activePlacementBoard.parentElement.querySelectorAll(
                `.ship[data-type="${shipType}"]`,
            );
        const firstChild = currentShipLoc[0];
        const shipHead = firstChild.closest('.cor');

        const positioning = child.dataset.positioning === 'true' ? false : true;
        const xCor = parseInt(shipHead.dataset.xCor);
        const yCor = parseInt(shipHead.dataset.yCor);
        console.log(xCor, yCor);
        const ship = createShip(shipType, ships[shipType], positioning);
        playerBoard.removeShip(child.dataset.type);

        if (this.checkIfValidDrop(ship, xCor, yCor, positioning)) {
            playerBoard.placeShip(ship, xCor, yCor, positioning);
            this.resetBoardUI();
        } else {
            playerBoard.placeShip(ship, xCor, yCor, !positioning);
        }
    }
}
// add orientation to ship
