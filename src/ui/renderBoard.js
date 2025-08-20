import { Player } from '../modules/player.js';
import { gameBoard } from '../modules/gameBoard.js';
import { createShip } from '../modules/ship';
import {
    elements,
    createForm,
    component,
    confirmPlacement,
    resetPlacementBoard,
    afterPlacement,
    initiatePassing,
    messages,
    showLiveUpdates,
    createBoardUI,
    changeVolumeState,
} from './domController.js';
import { gameUtils } from '../modules/gameUtils.js';
import { botPlay } from '../modules/botLogic.js';
import { audio, setAudio } from '../modules/audio.js';
export class createGame {
    constructor() {
        this.utils = gameUtils();
        this.playerOne = new Player('Player One', gameBoard());
        this.playerTwo = new Player('Player Two', gameBoard());
        this.targetPlayer = this.playerTwo;
        this.targetBoard = elements.boardTwo;
        this.currentPlayerPlacement = this.playerOne;
        this.currentPlayer = this.playerOne;
        this.activePlacementBoard = elements.boardOne;
        this.nextBoard = elements.boardOne;
        this.startX =
            this.startY =
            this.isDragging =
            this.botPlay =
            this.gameStarted =
            this.prevPlayer =
            this.prevPBoard =
                false;
        this.currentDraggable = null;
        this.boundMouseMove = this.mouseMove.bind(this);
        this.boundMouseUp = this.mouseUp.bind(this);
        this.boundRotate = this.rotateShip.bind(this);
        this.boundCorClick = this.#handleBoxClick.bind(this);
        this.boundApproval = this.afterApproval.bind(this);
        this.orientation = true;

        this.vsBot = null;
    }

    game() {
        this.#resetBoardUI();
        this.loadPrompt();

        // volume state
        let soundOn = true;
        setAudio(true, 0.5);

        const handleVol = () => {
            soundOn = !soundOn;
            setAudio(soundOn);
            changeVolumeState();
        };
        elements.volumeState.parent.addEventListener('click', handleVol);
    }

    loadPrompt() {
        createForm();
        component.form.addEventListener(
            'submit',
            this.#setPlayerPref.bind(this),
        );
    }

    #shipsInfo() {
        return {
            Carrier: 5,
            Battleship: 4,
            Destroyer: 3,
            Submarine: 3,
            PatrolBoat: 2,
        };
    }
    #resetShipPlacement(player) {
        const ships = this.#shipsInfo();
        Object.entries(ships).forEach((key) => {
            player.gameBoard.removeShip(key[0]);
        });
    }
    #placeShip(player) {
        const ships = this.#shipsInfo();
        this.#resetShipPlacement(player);
        Object.entries(ships).forEach(([key, value]) => {
            const isHorizontal = Math.random() < 0.5 ? true : false;

            let ship = createShip(key, value);
            let { xCor, yCor } = this.utils.generateShipCor(
                value,
                isHorizontal,
            );

            player.gameBoard.placeShip(ship, xCor, yCor, isHorizontal);

            this.#resetBoardUI();
        });
        this.utils.clearShipPos();
    }

    #handleBoxClick(e) {
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

        const shipEle = cor?.querySelector('.ship');

        // send Cor

        const xCor = cor.dataset.xCor;
        const yCor = cor.dataset.yCor;
        let ship = this.targetPlayer.gameBoard.getBoard()[xCor][yCor];

        this.sendShot(xCor, yCor);
        this.prevPlayer = this.currentPlayer;
        this.prevPBoard = this.targetBoard;

        const invalid = ['', 0, 'X'];
        const isValidTarget = !invalid.includes(ship);
        if (isValidTarget) {
            const isSunk = ship.isSunk();

            if (isSunk) audio.sunk();
            else audio.hit();

            shipEle.classList.add('ship-hit');
            shipEle.classList.remove('no-visibility');

            showLiveUpdates(ship);
            const part = target.dataset.part || shipEle.dataset.part;
            const type = target.dataset.type || shipEle.dataset.type;
            this.updateShipHealth(type, part, ship.isSunk());
            this.#isGameOver(this.targetPlayer);
        } else {
            cor.classList.add('missed');
            audio.miss();
            this.targetBoard.classList.add('disabled');
            showLiveUpdates(false);
            if (!this.vsBot) {
                this.passLogic();
            }else{
                this.#gameTurn()

            }
        }

        if (this.vsBot && this.gameStarted && this.targetPlayer === this.playerOne) {
            elements.boardTwo.removeEventListener('click', this.boundCorClick);
            setTimeout(() => {
                this.botTurn();
            }, 2000);
        }
    }

    #gameTurn() {
        this.targetPlayer =
            this.targetPlayer === this.playerOne
                ? this.playerTwo
                : this.playerOne;
        this.targetBoard =
            this.targetPlayer === this.playerOne
                ? elements.boardOne
                : elements.boardTwo;

        // toggle again to set current player
        this.currentPlayer =
            this.targetPlayer === this.playerOne
                ? this.playerTwo
                : this.playerOne;

        this.nextBoard =
            this.targetBoard === elements.boardOne
                ? elements.boardTwo
                : elements.boardOne;

       
    }

    #isGameOver(player) {
        const isAllSunk = player.gameBoard.isAllShipSunk();
        if (!isAllSunk) return;

        const winner = this.currentPlayer;
        this.gameStarted = false;

        const isOver = () => {
            if (this.vsBot && player.type == 'real') {
                audio.defeat();
                const msg = messages.AIwin;

                initiatePassing(
                    msg.title(player.name),
                    msg.body(player.name),
                    msg.btn,
                );
            } else {
                audio.victory();
                const msg = messages.winner;
                initiatePassing(
                    msg.title(winner.name),
                    msg.body(winner.name),
                    msg.btn,
                );
            }

            elements.analytics.parent.classList.add('hide');
            const startOver = () => {
                location.reload(true);
            };
            component.authorization.btn.addEventListener('click', startOver);
        };
        setTimeout(isOver, 1000);
    }

    #resetBoardUI() {
        elements.boardOne.innerHTML = '';
        elements.boardTwo.innerHTML = '';

        createBoardUI(this.playerOne.gameBoard.getBoard(), elements.boardOne);
        createBoardUI(this.playerTwo.gameBoard.getBoard(), elements.boardTwo);

        if (this.vsBot) {
            elements.boardTwoWrapper
                .querySelectorAll('.ship')
                .forEach((el) => el.classList.add('no-visibility'));
        }
    }

    #shipStorage(parent, pClass = 'ship-holder', childClass = 'ship-layer') {
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

    #dragStart() {
        document.querySelectorAll('.ship-layer').forEach((el) => {
            el.addEventListener('mousedown', (e) => {
                this.mouseDown(e);
                el.style.visibility = 'visible';
            });
        });

        elements.boardWrappers.forEach((el) =>
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

        this.isDragging = true;

        elements.boardContainer.addEventListener(
            'mousemove',
            this.boundMouseMove,
        );

        elements.boardContainer.addEventListener('mouseup', this.boundMouseUp);
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
        this.dragTarget(e);

        this.currentDraggable = null;
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

            const ship = createShip(type, ships[type]);
            const validDrop = this.#checkIfValidDrop(
                ship,
                xCor,
                yCor,
                ship.orientation,
            );

            if (validDrop == true) {
                playerBoard.placeShip(ship, xCor, yCor, ship.orientation);

                if (e.clientX < board.left || e.centerY > board.top)
                    handleInvalidDrop();

                this.#resetBoardUI();

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
                    this.#placeShip(this.playerTwo);
            } else {
                if (this.currentPlayerPlacement === this.playerOne) {
                    firstPlayer = true;
                    const msg = messages.nextPlacement;
                    confirmPlacement(firstPlayer);

                    clickProcess = () => {
                        initiatePassing(
                            msg.title,
                            msg.body(this.targetPlayer.name),
                            msg.btn,
                        );
                    };
                    initiateAuthorization = () => {
                        elements.boardContainer.classList.remove(
                            'no-visibility',
                        );
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

                        component.authorization.article.style.visibility =
                            'visible';
                    };

                    initiateAuthorization = () => {
                        elements.boardContainer.classList.remove(
                            'no-visibility',
                        );

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

        this.currentPlayerPlacement = this.playerTwo;
        this.activePlacementBoard = elements.boardTwo;

        this.#shipStorage(component.placeHolder);
        component.playerSetts.appendChild(component.placeHolder);
        this.#dragStart();
    }
    #handleAfterPlacement() {
        elements.randomizeBtns.forEach((el) => el.parentNode.remove());

        component.authorization.article.style.visibility = 'hidden';

        elements.analytics.parent.classList.remove('no-visibility');
        afterPlacement();
        this.#resetBoardUI();
        this.#shipStorage(
            elements.analytics.one,
            'analytics__ships__one',
            'analytics__ship',
        );
        this.#shipStorage(
            elements.analytics.two,
            'analytics__ships__two',
            'analytics__ship',
        );

        this.gameStarted = true;

        this.targetBoard
            .querySelectorAll('.ship')
            .forEach((el) => el.classList.add('no-visibility'));

        elements.boardWrappers.forEach((el) =>
            el.removeEventListener('click', this.boundRotate),
        );
        elements.boardContainer.removeEventListener(
            'mousedown',
            this.boundOnBoard,
        );
        this.targetBoard.style.cursor = 'crosshair';
        if (this.vsBot) {
            elements.boardTwoWrapper.style.display = '';
            elements.boardTwo.addEventListener('click', this.boundCorClick);
        } else {
            this.targetBoard.addEventListener('click', this.boundCorClick);
            elements.boardOne.classList.add('disabled');
            this.updateBoardOpp();
         
            this.nextBoard.style.cursor = 'crosshair';
        }
    }
    #setPlayerPref(e) {
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
        }

        this.playerOne.name = elements.playerOne.name.textContent = pOne;
        this.playerTwo.name = elements.playerTwo.name.textContent = pTwo;
        const instruction = 'Click ship on board to rotate';
        elements.instructions.forEach((el) => (el.textContent = instruction));
        component.playerSetts.style.order = 1;
        this.#shipStorage(component.placeHolder);
        component.playerSetts.appendChild(component.placeHolder);
        this.#dragStart();
        this.boardControls();
        component.form.reset();
    }

    #checkIfValidDrop(ship, xCor, yCor, isHor) {
        if (!ship) return false;
        if (isHor && yCor + ship.length > 10) return false;
        if (!isHor && xCor + ship.length > 10) return false;

        const filled = this.currentPlayerPlacement.gameBoard.occupiedLocs();

        if (!this.utils.isEmpty(filled, xCor, yCor, ship.length, isHor)) {
            return false;
        }

        return true;
    }

    rotateShip(e) {
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

        const ship = createShip(shipType, ships[shipType], positioning);
        playerBoard.removeShip(child.dataset.type);
        // change dragged ship orientation

        if (this.#checkIfValidDrop(ship, xCor, yCor, positioning)) {
            playerBoard.placeShip(ship, xCor, yCor, positioning);

            this.#resetBoardUI();
        } else {
            playerBoard.placeShip(ship, xCor, yCor, !positioning);
        }
    }

    boardControls() {
        // change func name
        const rand = () => {
            this.#placeShip(this.currentPlayerPlacement);
            component.playerSetts.innerHTML = '';
            this.#handlePlacement(this.currentPlayerPlacement.gameBoard);
        };
        const clearBoard = () => {
            // clear current board
            this.#resetShipPlacement(this.currentPlayerPlacement);
            this.#resetBoardUI();
            // render ship storage
            this.#shipStorage(component.placeHolder);

            component.playerSetts.appendChild(component.placeHolder);
            this.#dragStart();
        };

        elements.randomizeBtns.forEach((el) => {
            el.parentNode.classList.remove('no-visibility');
            el.addEventListener('click', rand);
        });

        elements.resetBtns.forEach((el) => {
            el.addEventListener('click', clearBoard);
        });
    }

    sendShot(xCor, yCor) {
        const hitLoc = { xCor, yCor };
        const targetPlayer = this.targetPlayer.gameBoard;
        const isValidShot = targetPlayer.hitSpots();
        if (!isValidShot.has(hitLoc)) {
            targetPlayer.receiveAttack(xCor, yCor);
        }
    }

    botTurn() {
        if (this.targetPlayer !== this.playerOne || !this.gameStarted) return;
        const { xCor, yCor } = this.botPlay.nextShot();
        const tPlayer = this.targetPlayer.gameBoard.getBoard()[xCor][yCor];
        let ship = tPlayer;

        const invalid = ['', 0, 'X'];
        this.sendShot(xCor, yCor);
        let isSunk,
            shipHit = null;
        const cor = elements.boardOne.querySelector(
            `.cor[data-x-cor = "${xCor}"][data-y-cor = "${yCor}"]`,
        );

        if (invalid.includes(ship)) {
            audio.miss();
            cor.classList.add('missed');
            this.nextBoard.classList.remove('disabled');
           
            this.#gameTurn();

            elements.boardTwo.addEventListener('click', this.boundCorClick);

            this.prevPlayer = this.currentPlayer;
            this.prevPBoard = this.targetBoard;
            this.botPlay.listener(shipHit, isSunk);
        } else {
            shipHit = true;
            isSunk = ship.isSunk();
            const activeShip = cor.querySelector(`.ship`);
            if (isSunk) audio.sunk();
            else audio.hit();
            

            activeShip.classList.add('ship-hit');
            activeShip.classList.remove('no-visibility');

            const part = activeShip.dataset.part;
            const type = activeShip.dataset.type;

            this.updateShipHealth(type, part, isSunk);

            this.#isGameOver(this.targetPlayer);
            this.botPlay.listener(shipHit, isSunk);
            setTimeout(() => {
                this.botTurn();
            }, 2000);
        }
    }

    updateShipHealth(type, part, isSSunk = false) {
        if (!type || !part) return;

        let hitPart = null;
        // updates analytics

        if (this.targetPlayer === this.playerOne) {
            hitPart = elements.analytics.one.querySelector(
                `.${type}[data-part ="${part}"]`,
            );
        } else {
            hitPart = elements.analytics.two.querySelector(
                `.${type}[data-part ="${part}"]`,
            );
        }

        // if isSunk

        if (isSSunk)
            this.targetBoard
                .querySelectorAll(`[data-type ="${type}"]`)
                .forEach((el) => el.classList.add('sunk'));

        hitPart.classList.add('ship-hit');
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
            this.targetBoard.classList.add('disabled');

            elements.analytics.liveUpdate.textContent = '';
            component.authorization.article.style.visibility = 'visible';
        };

        const btn =
            this.targetPlayer === this.playerOne
                ? elements.boardPass.one
                : elements.boardPass.two;
        const btnMsg =
            this.currentPlayer === this.playerOne
                ? 'Pass device to Player Two'
                : 'Pass device to Player One';

        btn.textContent = btnMsg;
        setTimeout(() => {
            btn.classList.remove('hide');
            btn.addEventListener('click', initialPass);
            component.authorization.btn.addEventListener(
                'click',
                this.boundApproval,
            );
        }, 1000);
    }
    afterApproval() {
        component.authorization.btn.removeEventListener(
            'click',
            this.boundApproval,
        );

        //

        component.authorization.article.style.visibility = 'hidden';
        elements.boardContainer.classList.remove('no-visibility');
        this.updateBoardOpp();
        this.targetBoard.removeEventListener('click', this.boundCorClick);

        this.nextBoard.querySelectorAll('.ship').forEach((el) => {
            if (!el.classList.contains('ship-hit'))
                el.classList.add('no-visibility');
        });

        this.targetBoard
            .querySelectorAll('.ship')
            .forEach((el) => el.classList.remove('no-visibility'));
        this.nextBoard.addEventListener('click', this.boundCorClick);
        this.nextBoard.classList.remove('disabled');
        this.targetBoard.classList.add('disabled');

        //
       
        this.#gameTurn();

        let p1, p2;
        this.currentPlayer === this.playerOne
            ? ((p1 = 'Your Ship'), (p2 = 'Enemy ships'))
            : ((p2 = 'Your Ship'), (p1 = 'Enemy ships'));
        elements.analytics.currentPlayerOne.textContent = p1;
        elements.analytics.currentPlayerTwo.textContent = p2;

        const order = this.currentPlayer === this.playerOne ? 2 : -1;
       
        elements.analytics.infoTwo.style.order = order;
    }

    updateBoardOpp() {
        const currentTurn = this.targetPlayer === this.playerOne;
        const { one, two } = elements.boardOpp;

        one.textContent = currentTurn ? 'Enemy Board' : 'Your Board';
        two.textContent = currentTurn ? 'Your Board' : 'Enemy Board';

        one.classList.toggle('active-enemy-board', currentTurn);
        two.classList.toggle('active-enemy-board', !currentTurn);
    }
}
