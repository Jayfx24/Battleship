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
    initiatePassing,
    messages,
    showLiveUpdates,
} from './domController.js';
import { gameUtils } from '../modules/gameUtils.js';
import { botPlay } from '../modules/botLogic.js';

export class createGame {
    constructor() {
        this.utils = gameUtils();
        this.playerOne = new Player('Player One', gameBoard());
        this.playerTwo = new Player('Player Two', gameBoard());
        this.receivingPlayer = this.playerTwo;
        this.receivingBoard = domController.boardTwo;
        this.currentPlayerPlacement = this.playerOne;
        this.currentPlayer = this.playerOne;
        this.activePlacementBoard = domController.boardOne;
        this.startX =
            this.startY =
            this.offsetX =
            this.offsetY =
            this.isDragging =
            this.botPlay =
            this.mousedownFired =
            this.gameStarted =
            this.prevPlayer =
            this.prevPBoard =
                false;
        this.currentDraggable = null;
        this.boundMouseMove = this.mouseMove.bind(this);
        this.boundMouseUp = this.mouseUp.bind(this);
        this.boundRotate = this.rotateShip.bind(this);
        this.boundOnBoard = this.dragOnBoard.bind(this);
        this.boundCorClick = this.#handleBoxClick.bind(this);
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
        // domController.playerOneInfo.textContent = this.playerOne.name;
    }

    createBoardUI(board, parent) {
        if (!Array.isArray(board)) return;

        const shipPartCount = {};
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

                    // chap ship missed to box
                    ship.dataset.type = element.name;
                    if (!shipPartCount[element.name])
                        shipPartCount[element.name] = 0;
                    shipPartCount[element.name]++;

                    ship.dataset.part = shipPartCount[element.name];
                    box.appendChild(ship);
                    // this.updateShipHealth(element.name,shipPartCount[element.name])
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
    resetShipPlacement(player) {
        const ships = this.#shipsInfo();
        Object.entries(ships).forEach((key) => {
            player.gameBoard.removeShip(key[0]);
        });
    }
    placeShip(player, status = 'random') {
        // needs refactoring
        const ships = this.#shipsInfo();

        if (status === 'random') {
            this.resetShipPlacement(player);
            Object.entries(ships).forEach(([key, value]) => {
                const isHorizontal = Math.random() < 0.5 ? true : false;

                let ship = createShip(key, value);
                let { xCor, yCor } = this.utils.generateShipCor(
                    value,
                    isHorizontal,
                );

                player.gameBoard.placeShip(ship, xCor, yCor, isHorizontal);

                this.resetBoardUI();
            });
            this.utils.clearShipPos();
            this.utils.resetShipCoord();
        }
    }

    #handleBoxClick(e) {
       
        if (this.currentPlayer === this.prevPlayer && !this.vsBot) return;
        if (this.currentPlayer === this.prevPBoard && !this.vsBot) return;

        const target = e.target;
        const cor = target.closest('.cor');
        if (!cor) return;
        const parent = cor.closest('.board');
        if (parent.classList.contains('disabled')) return;
        if (
            cor.querySelector('.ship-hit') ||
            cor.classList.contains('missed') ||
            cor.classList.contains('ship-hit')
        )
            return;
        // if (this.receivingBoard !== domController.boardOne) return;

        console.log(this.prevPlayer, this.currentPlayer);
        console.log(
            `player:${this.receivingPlayer.name} turn to shoot board: ${this.receivingBoard.className}`,
        );
        const shipEle = cor?.querySelector('.ship');
        console.log(shipEle);
        // send Cor

        const xCor = cor.dataset.xCor;
        const yCor = cor.dataset.yCor;
        let ship = this.receivingPlayer.gameBoard.getBoard()[xCor][yCor];
        this.sendShot(xCor, yCor);
        this.prevPlayer = this.currentPlayer;
        this.prevPBoard = this.receivingBoard;

        const invalid = ['', 0, 'X'];
        if (!invalid.includes(ship)) {
            shipEle.classList.add('ship-hit');
            shipEle.classList.remove('no-visibility');
            // temp
            showLiveUpdates(ship);
            const part = target.dataset.part || shipEle.dataset.part;
            const type = target.dataset.type || shipEle.dataset.type;
            this.updateShipHealth(type, part);
        } else if (invalid.includes(ship)) {
            cor.classList.add('missed');
            showLiveUpdates(false);
        }
        if (!this.vsBot) {
            this.passLogic();
            parent.classList.add('disabled');
        }
        this.gameTurn();

        if (this.vsBot && this.gameStarted) {
            this.botTurn();
        }
    }

    gameTurn() {
        this.receivingPlayer =
            this.receivingPlayer === this.playerOne
                ? this.playerTwo
                : this.playerOne;
        this.receivingBoard =
            this.receivingPlayer === this.playerOne
                ? domController.boardTwo
                : domController.boardOne;
        console.log('ere');

        this.currentPlayer =
            this.receivingPlayer === this.playerOne
                ? this.playerTwo
                : this.playerOne;

        console.log(
            `Current player: ${this.currentPlayer.name}, Targeting: ${this.receivingPlayer.name}`,
        );
    }

    playerTurn() {}

    #confirmShipsStatus(gameBoard) {
        if (gameBoard.isAllShipSunk()) {
        }
    }

    resetBoardUI() {
        domController.boardOne.innerHTML = '';
        domController.boardTwo.innerHTML = '';

        // test
        //   const msg = messages.nextPlacement;
        //         initiatePassing(msg.title,msg.body(this.currentPlayer.name),msg.btn) // temp for testing

        this.createBoardUI(
            this.playerOne.gameBoard.getBoard(),
            domController.boardOne,
        );
        this.createBoardUI(
            this.playerTwo.gameBoard.getBoard(),
            domController.boardTwo,
        );

        if (this.vsBot) {
            domController.boardTwoWrapper
                .querySelectorAll('.ship')
                .forEach((el) => el.classList.add('no-visibility'));
        }
        //  confirmPlacement(false); //for testing
    }

    shipStorage(parent, pClass = 'ship-holder', childClass = 'ship-layer') {
        component.playerSetts.innerHTML = '';
        parent.innerHTML = '';
        parent.classList.add(pClass);

        const ships = this.#shipsInfo();

        const shipPartCount = {};
        Object.entries(ships).forEach(([key, value]) => {
            let shipLayer = document.createElement('div');
            shipLayer.classList.add(childClass);
            shipLayer.classList.add(`${key}`);
            shipLayer.dataset.type = key;

            for (let i = 0; i < value; i++) {
                if (!shipPartCount[key]) shipPartCount[key] = 0;
                shipPartCount[key]++;
                let box = document.createElement('div');
                box.classList.add(key);
                box.classList.add('dock-ship');
                box.dataset.part = shipPartCount[key];
                shipLayer.appendChild(box);
            }

            parent.appendChild(shipLayer);
        });
    }

    dragStart() {
        document.querySelectorAll('.ship-layer').forEach((el) => {
            el.addEventListener('mousedown', (e) => {
                this.mouseDown(e);
                el.style.visibility = 'visible';
            });
        });
        // this.activePlacementBoard.addEventListener(
        //     'mousedown',
        //     this.boundOnBoard,
        // );
        domController.boardWrappers.forEach((el) =>
            el.addEventListener('click', this.boundRotate),
        );
    }

    mouseDown(e) {
        e.preventDefault();

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
            this.boundMouseMove,
        );

        domController.boardContainer.addEventListener(
            'mouseup',
            this.boundMouseUp,
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
        // if (this.startX === e.clientX &&  this.startY === e.clientY){
        //     return this.boundRotate(e)
        // }
        if (!this.isDragging) return;
        e.preventDefault();

        this.currentDraggable.style.cursor = 'move';
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

                this.resetBoardUI();
                // this.currentDraggable.style.visibility = 'visible';

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
        let initiateAuthorization = null;
        if (playerBoard.findAllShips().size === 5) {
            if (this.vsBot) {
                confirmPlacement(firstPlayer);
                (clickProcess = () => this.#handleAfterPlacement()),
                    this.placeShip(this.playerTwo);
                // return
            } else {
                if (this.currentPlayerPlacement === this.playerOne) {
                    firstPlayer = true;
                    const msg = messages.nextPlacement;
                    confirmPlacement(firstPlayer);

                    clickProcess = () => {
                        initiatePassing(
                            msg.title,
                            msg.body(this.receivingPlayer.name),
                            msg.btn,
                        );
                    };
                    initiateAuthorization = () => {
                        this.#handleConfirm();
                        component.authorization.btn.removeEventListener(
                            'click',
                            initiateAuthorization,
                        );
                    };
                } else {
                    confirmPlacement(firstPlayer);

                    clickProcess = () => {
                        const msg = messages.nextTurn;

                        initiatePassing(
                            msg.title,
                            msg.body(this.currentPlayer.name),
                            msg.btn,
                        );
                        console.log('here');
                        component.authorization.article.style.visibility =
                            'visible';
                    };

                    initiateAuthorization = () => {
                        this.#handleAfterPlacement();
                        component.authorization.btn.removeEventListener(
                            'click',
                            initiateAuthorization,
                        );
                    };
                }
            }

            component.confirmPlacement.confirmBtn.addEventListener(
                'click',
                clickProcess,
            );
            component.authorization.btn.addEventListener(
                'click',
                initiateAuthorization,
            );
        }
    }
    #handleConfirm() {
        resetPlacementBoard();
        component.authorization.article.style.visibility = 'hidden';
        console.log(component.authorization.article);
        this.currentPlayerPlacement = this.playerTwo;
        this.activePlacementBoard = domController.boardTwo;

        this.shipStorage(component.placeHolder);
        component.playerSetts.appendChild(component.placeHolder);
        this.dragStart();
    }
    #handleAfterPlacement() {
        domController.randomizeBtns.forEach((el) => el.parentNode.remove());
        // this.currentPlayerPlacement = this.playerTwo
        component.authorization.article.style.visibility = 'hidden';

        domController.analytics.parent.classList.remove('no-visibility');
        afterPlacement();
        this.resetBoardUI();
        this.shipStorage(
            domController.analytics.one,
            'analytics__ships__one',
            'analytics__ship',
        );
        this.shipStorage(
            domController.analytics.two,
            'analytics__ships__two',
            'analytics__ship',
        );

        this.gameStarted = true;

        this.receivingBoard
            .querySelectorAll('.ship')
            .forEach((el) => el.classList.add('no-visibility'));

        domController.boardWrappers.forEach((el) =>
            el.removeEventListener('click', this.boundRotate),
        );
        domController.boardContainer.removeEventListener(
            'mousedown',
            this.boundOnBoard,
        );
        if (this.vsBot) {
            domController.boardTwoWrapper.style.display = '';
            domController.boardTwo.addEventListener(
                'click',
                this.boundCorClick,
            );
            // this.boardControls()
        } else {
            this.receivingBoard.addEventListener('click', this.boundCorClick);
            domController.boardOne.classList.add('disabled');
        }

        // this.gameTurn();
    }
    setPlayerPref(e) {
        e.preventDefault();
        const formData = new FormData(component.form);
        const data = Object.fromEntries(formData.entries());
        const { playerChoice, playerOneName, playerTwoName } = data;
        const pOne = playerOneName ? playerOneName : 'Player One';
        let pTwo = playerTwoName ? playerTwoName : 'Player Two';
        if (playerChoice === 'vsBot') {
            this.vsBot = true;
            this.botPlay = new botPlay();
            pTwo = 'AI';
            this.playerTwo.type = 'AI';

            // this.botPlay.aiShots()
        }

        this.playerOne.name = domController.playerOne.name.textContent = pOne;
        this.playerTwo.name = domController.playerTwo.name.textContent = pTwo;
        // console.log(this.playerTwo.name);
        // playerTwo.type === 'real' ? playerTwo.name || 'Player Two' : 'AI';
        this.shipStorage(component.placeHolder);
        component.playerSetts.appendChild(component.placeHolder);
        this.dragStart();
        this.boardControls();
        component.form.reset();
    }

    checkIfValidDrop(ship, xCor, yCor, isHor) {
        if (!ship) return false;
        if (isHor && yCor + ship.length > 10) return false;
        if (!isHor && xCor + ship.length > 10) return false;

        const filled = this.currentPlayerPlacement.gameBoard.occupiedLocs();

        if (
            !this.utils.isEmpty(
                filled,
                xCor,
                yCor,
                ship.length,
                isHor,
                

            )
        ) {
            return false;
        }

        return true;
    }

    dragOnBoard(e) {
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
        // change dragged ship orientation

        
        if (this.checkIfValidDrop(ship, xCor, yCor, positioning)) {
            playerBoard.placeShip(ship, xCor, yCor, positioning);
            
            this.resetBoardUI();
        } else {
            playerBoard.placeShip(ship, xCor, yCor, !positioning);
        }
    }

    boardControls() {
        // change func name
        const rand = () => {
            this.placeShip(this.currentPlayerPlacement);
            component.playerSetts.innerHTML = '';
            this.#handlePlacement(this.currentPlayerPlacement.gameBoard);
        };
        const clearBoard = () => {
            // clear current board
            this.resetShipPlacement(this.currentPlayerPlacement);
            this.resetBoardUI();
            // render ship storage
            this.shipStorage(component.placeHolder);

            component.playerSetts.appendChild(component.placeHolder);
            this.dragStart();
        };

        domController.randomizeBtns.forEach((el) => {
            el.parentNode.classList.remove('no-visibility');
            el.addEventListener('click', rand);
        });

        domController.resetBtns.forEach((el) => {
            el.addEventListener('click', clearBoard);
        });
    }

    sendShot(xCor, yCor) {
        const hitLoc = { xCor, yCor };
        const receivingPlayer = this.receivingPlayer.gameBoard;
        const isValidShot = receivingPlayer.hitSpots();
        if (!isValidShot.has(hitLoc)) {
            receivingPlayer.receiveAttack(xCor, yCor);

            // this.resetBoardUI();
        }
        // Else show you cant;t hit the same spot twice
    }

    botTurn() {
        if (this.receivingPlayer !== this.playerOne) return;
        const { xCor, yCor } = this.botPlay.nextShot();
        const receivingPlayer =
            this.receivingPlayer.gameBoard.getBoard()[xCor][yCor];
        let ship = receivingPlayer;

        const invalid = ['', 0, 'X'];
        this.sendShot(xCor, yCor);
        let isSunk,
            shipHit = null;
        const cor = domController.boardOne.querySelector(
            `.cor[data-x-cor = "${xCor}"][data-y-cor = "${yCor}"]`,
        );

        if (!invalid.includes(ship)) {
            const activeShip = cor.querySelector(`.ship`);
            shipHit = true;
            isSunk = ship.isSunk();
            activeShip.classList.add('ship-hit');
            activeShip.classList.remove('no-visibility');
            console.log(activeShip);
            const part = activeShip.dataset.part;
            const type = activeShip.dataset.type;
            console.log(part, type);
            this.updateShipHealth(type, part);
        } else {
            cor.classList.add('missed');
        }
        this.prevPlayer = this.currentPlayer;
        this.prevPBoard = this.receivingBoard;

        console.log(shipHit);
        this.botPlay.listener(shipHit, isSunk);
        this.gameTurn();
    }

    updateShipHealth(type, part) {
        if (!type || !part) return;

        let hitPart = null;

        if (this.receivingPlayer === this.playerOne) {
            hitPart = domController.analytics.one.querySelector(
                `.${type}[data-part ="${part}"]`,
            );
        } else {
            hitPart = domController.analytics.two.querySelector(
                `.${type}[data-part ="${part}"]`,
            );
        }
        hitPart.classList.add('ship-hit');
        console.log(`.${type}[data-part ="${part}"]`);
        console.log(hitPart.parentNode.parentNode);
    }

    passLogic() {
        const initialPass = (e) => {
            const target = e.target;
            // hides pop up btn for passing
            target.classList.add('hide');
            const msg = messages.nextTurn;
            initiatePassing(
                msg.title,
                msg.body(this.currentPlayer.name),
                msg.btn,
            );
            this.receivingBoard.classList.add('disabled');

            let p1, p2;
            this.currentPlayer === this.playerOne
                ? ((p1 = 'Your Ship'), (p2 = 'Enemy ships'))
                : ((p2 = 'Your Ship'), (p1 = 'Enemy ships'));
            domController.analytics.currentPlayerOne.textContent = p1;
            domController.analytics.currentPlayerTwo.textContent = p2;

            const order = this.currentPlayer === this.playerOne ? 2 : -1;

            domController.analytics.infoTwo.style.order = order;
            domController.boardTwoWrapper.style.order = order;

            domController.analytics.liveUpdate.textContent = '';
            component.authorization.article.style.visibility = 'visible';
            component.authorization.btn.addEventListener(
                'click',
                afterApproval,
            );
        };

        const afterApproval = (e) => {
            component.authorization.article.style.visibility = 'hidden';

            this.receivingBoard.removeEventListener(
                'click',
                this.boundCorClick,
            );

            const nextBoard =
                this.receivingBoard === domController.boardOne
                    ? domController.boardTwo
                    : domController.boardOne;
            nextBoard.querySelectorAll('.ship').forEach((el) => {
                if (!el.classList.contains('ship-hit'))
                    el.classList.add('no-visibility');
            });
            this.receivingBoard
                .querySelectorAll('.ship')
                .forEach((el) => el.classList.remove('no-visibility'));
            nextBoard.addEventListener('click', this.boundCorClick);
            nextBoard.classList.remove('disabled');
            this.receivingBoard.classList.add('disabled');
        };

        const btn =
            this.receivingPlayer === this.playerOne
                ? domController.boardPass.one
                : domController.boardPass.two;
        const btnMsg =
            this.receivingPlayer === this.playerOne
                ? 'Pass device to Player Two'
                : 'Pass device to Player One';

        btn.textContent = btnMsg;
        btn.classList.remove('hide');
        btn.addEventListener('click', initialPass);
    }
}
// add orientation to ship
