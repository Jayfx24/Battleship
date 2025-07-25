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
        this.newX = this.newY = this.startX = this.startY = 0;
        this.offsetX = this.offsetY = this.isDragging = false;
        this.currentDraggable = null;
        this.bondMouseMove = this.mouseMove.bind(this);
        this.bondMouseUp = this.mouseUp.bind(this);
        this.dragStartLoc = null;
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
            console.log(count);

            if (!(key in defaultShipsLoc)) return;
            else if (defaultShipsLoc[key]) {
                let shipLayer = document.createElement('div');
                shipLayer.classList.add('ship-layer');
                shipLayer.classList.add(`${key}`);
                shipLayer.dataset.type = key;
                shipLayer.draggable = true;
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

        console.log(component.placeHolder.querySelector('.ship-layer'));

        this.dragStart();
    }

    dragStart() {
        component.placeHolder.addEventListener('mousedown', (e) => {
            let shipLayer = e.target.closest('.ship-layer');
            if (!shipLayer) return;
            this.currentDraggable = shipLayer;
            this.mouseDown(e);
        });
    }

    mouseDown(e) {
        e.preventDefault();
        // const draggable = e.target
        const rect = this.currentDraggable.getBoundingClientRect();
        const parentRect = component.placeHolder.getBoundingClientRect();
        this.dragStartLoc = [
            rect.left - parentRect.left,
            rect.top - parentRect.top,
        ];
        this.currentDraggable.style.position = 'absolute';
        this.currentDraggable.style.zIndex = 100;
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
            console.log('here');
            this.currentDraggable.style.left = e.clientX - this.offsetX + 'px';
            this.currentDraggable.style.top = e.clientY - this.offsetY + 'px';
        }
    }

    mouseUp(e) {
        e.preventDefault();

        // this.currentDraggable.style.cursor = 'move'
        console.log(e.target);
        this.dragTarget(e), (this.isDragging = false);

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
        this.currentDraggable.style.display = 'none';

        const below = document.elementFromPoint(e.clientX, e.clientY);
        const shipLayer = e.target.closest('.ship-layer');

        const ships = this.#shipsInfo();
        const target = below.closest('.cor');

        console.log(shipLayer);
        if (target) {
            const type = shipLayer.dataset.type;
            const xCor = parseInt(target.dataset.xCor);
            const yCor = parseInt(target.dataset.yCor);
            console.log(xCor, yCor);
            const ship = createShip(type, ships[type]);

            if (this.checkIfValidDrop(ship, xCor, yCor, false)) {
                this.playerOne.gameBoard.placeShip(ship, xCor, yCor, false);
                this.resetBoardUI();
                return;
            }
        } else {
            this.currentDraggable.style.display = '';
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

        console.log(playerChoice);
        console.log(playerOneName);
        console.log(playerTwoName);
        this.shipStorage();

        component.form.reset();
    }

    checkIfValidDrop(ship, xCor, yCor, isHorizontal) {
        // console.log(1.10);

        console.log(yCor + ship.length);
        if (!ship) return;
        if (isHorizontal && yCor + ship.length > 10) return;
        if (!isHorizontal && xCor + ship.length > 10) return;
        return true;
    }
}
