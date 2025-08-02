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
import { botPlay } from '../modules/botLogic.js';

export class createGame {
    constructor() {
        this.utils = gameUtils();
        this.playerOne = new Player('Player One', gameBoard());
        this.playerTwo = new Player('Player Two', gameBoard());
        this.currentPlayer = this.playerOne;
        this.activeBoard = domController.boardTwo;
        this.currentPlayerPlacement = this.playerOne;
        this.activePlacementBoard = domController.boardOne;
        this.startX =
            this.startY =
            this.offsetX =
            this.offsetY =
            this.isDragging =
            this.botPlay =
            this.mousedownFired =
            this.gameStarted =
                false;
        this.currentDraggable = null;
        this.bondMouseMove = this.mouseMove.bind(this);
        this.bondMouseUp = this.mouseUp.bind(this);
        this.boundRotate = this.rotateShip.bind(this);
        this.boundOnBoard = this.dragOnBoard.bind(this);
        this.dragStartLoc = null;
        this.orientation = true;
        this.rect = null;
        this.parentRect = null;
        this.vsBot = null;
        // this.iRotate = false
    }

    game() {
        this.resetBoardUI();
        this.loadPrompt(); // temp location
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
            Object.entries(ships).forEach((key) => {
                player.gameBoard.removeShip(key[0]);
            });

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
        if (!this.activeBoard.contains(cor)) return;

        // send Cor
        const xCor = target.dataset.xCor;
        const yCor = target.dataset.yCor;
        let ship = this.currentPlayer.gameBoard.getBoard()[xCor][yCor];
        let isSunk,
            shipHit = null;
        this.sendShot(xCor, yCor);
        // if (ship) {
        //     console.log(`${ship.name}: ${ship.isSunk() ? 'sunk' : 'Not Sunk'}`);
        // }
        if (this.vsBot &&
            this.gameStarted &&
            this.currentPlayer === this.playerOne) {
            
            // let   eShip = this.currentPlayer.gameBoard.getBoard()[xCor][yCor];
            //  //  need a function that send cor and listen to changes
            // if (eShip) {
            //     isSunk = eShip.isSunk?.() ?? null;
            //     shipHit = eShip.getHits() > 0 ? true : false;
            //     console.log(typeof eShip)
            //     console.log(isSunk)
            //     console.log(shipHit)
            // }
            this.botTurn(shipHit, isSunk);
        }
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

        // if (this.vsBot) {
        //     domController.boardTwoWrapper
        //         .querySelectorAll('.ship')
        //         .forEach((el) => el.classList.add('hide'));
        // }
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

        this.dragStart();
    }

    dragStart() {
        document.querySelectorAll('.ship-layer').forEach((el) => {
            el.addEventListener('mousedown', (e) => {
                this.mouseDown(e);
            });
        });
        // this.activePlacementBoard.addEventListener(
        //     'mousedown',
        //     this.boundOnBoard,
        // );
        this.activePlacementBoard.addEventListener(
            'click',
            this.boundRotate,
        );
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

        domController.boardContainer.addEventListener(
            'mousemove',
            this.bondMouseMove,
        );

        domController.boardContainer.addEventListener(
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
            if (this.vsBot) {
                confirmPlacement(firstPlayer);
                (clickProcess = () => this.#handleAfterPlacement()),
                    this.placeShip(this.playerTwo);
                // return
            } else {
                if (this.currentPlayerPlacement === this.playerOne) {
                    firstPlayer = true;

                    confirmPlacement(firstPlayer);
                    clickProcess = () => this.#handleConfirm();
                } else {
                    confirmPlacement(firstPlayer);

                    clickProcess = () => this.#handleAfterPlacement();
                }
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

        this.shipStorage();
    }
    #handleAfterPlacement() {
        domController.randomizeBtns.forEach((el) => el.parentNode.remove());
        // this.currentPlayerPlacement = this.playerTwo
        afterPlacement();
        this.gameTurn();
        this.gameStarted = true;

        this.activePlacementBoard.removeEventListener(
            'click',
            this.boundRotate,
        );
        this.activePlacementBoard.removeEventListener(
            'mousedown',
            this.boundOnBoard,
        );
        if (this.vsBot) {
            domController.boardTwoWrapper.style.display = '';
            domController.boardTwo.addEventListener(
                'click',
                this.#handleBoxClick.bind(this),
            );
            // this.randomLogic()
        } else {
            domController.boardWrapper.addEventListener(
                'click',
                this.#handleBoxClick.bind(this),
            );
        }

        this.resetBoardUI();
    }
    setPlayerPref(e) {
        e.preventDefault();
        const formData = new FormData(component.form);
        const data = Object.fromEntries(formData.entries());
        const { playerChoice, playerOneName, playerTwoName } = data;
        if (playerChoice === 'vsBot') {
            this.vsBot = true;
            this.botPlay = new botPlay();
            // this.botPlay.aiShots()
        }

        if (playerOneName) {
            domController.playerOneInfo.textContent = playerOneName;
        }
        // playerTwo.type === 'real' ? playerTwo.playerName || 'Player Two' : 'AI';

        this.shipStorage();
        this.randomLogic();
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
        // console.log(ship);

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
        // console.log(xCor, yCor);
        const ship = createShip(shipType, ships[shipType], positioning);
        playerBoard.removeShip(child.dataset.type);

        if (this.checkIfValidDrop(ship, xCor, yCor, positioning)) {
            playerBoard.placeShip(ship, xCor, yCor, positioning);
            this.resetBoardUI();
        } else {
            playerBoard.placeShip(ship, xCor, yCor, !positioning);
        }
    }

    randomLogic() {
        // change func name
        const rand = () => {
            this.placeShip(this.currentPlayerPlacement);
            component.playerSetts.innerHTML = '';
            this.#handlePlacement(this.currentPlayerPlacement.gameBoard);
        };
        domController.randomizeBtns.forEach((el) => {
            el.parentNode.classList.remove('hide');
            el.addEventListener('click', rand);
        });
    }

    sendShot(xCor, yCor) {
        const hitLoc = { xCor, yCor };
        const receivingPlayer = this.currentPlayer.gameBoard;
        const isValidShot = receivingPlayer.hitSpots();
        if (!isValidShot.has(hitLoc)) {
            receivingPlayer.receiveAttack(xCor, yCor);

            this.resetBoardUI();
            this.gameTurn();
        }
        // Else show you cant;t hit the same spot twice
    }

    botTurn(shipHit, isSunk) {
        if (this.currentPlayer !== this.playerOne) return;

        if (isSunk) this.botPlay.isAfloat = null;
        const { xCor, yCor } = this.botPlay.nextShot(shipHit, isSunk);
        this.sendShot(xCor, yCor);
    }
}
// add orientation to ship
