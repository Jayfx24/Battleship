import topSecretImg from '../assets/images/top-secret.svg';

export const elements = {
    wrapper: document.querySelector('.wrapper'),
    boardContainer: document.querySelector('.board-container'),
    boardWrappers: document.querySelectorAll('.board__wrapper'),
    boardOne: document.querySelector('.board--one'),
    boardTwo: document.querySelector('.board--two'),
    boardOneWrapper: document.querySelector('.board__wrapper--one'),
    boardTwoWrapper: document.querySelector('.board__wrapper--two'),
    playerOne: {
        info: document.querySelector('.board__player-info--one'),
        name: document.querySelector('.player-info__name--one'),
    },
    playerTwo: {
        info: document.querySelector('.board__player-info--two'),
        name: document.querySelector('.player-info__name--two'),
    },
    instructions: document.querySelectorAll('.instructions'),
    playerTwoInfo: document.querySelector('.board__player-info--two'),
    randomizeBtns: document.querySelectorAll('.board__button--randomize'),
    resetBtns: document.querySelectorAll('.board__button--reset'),
    analytics: {
        parent: document.querySelector('.analytics'),
        ships: document.querySelector('.analytics__ships'),
        one: document.querySelector('.analytics__ships__one'),
        two: document.querySelector('.analytics__ships__two'),
        infoOne: document.querySelector('.analytics__ships__info--one'),
        infoTwo: document.querySelector('.analytics__ships__info--two'),
        currentPlayerOne: document.querySelector('.current-player--one'),
        currentPlayerTwo: document.querySelector('.current-player--two'),
        liveUpdate: document.querySelector('.live-update'),
    },
    boardPass: {
        all: document.querySelectorAll('.board-pass'),
        one: document.querySelector('.board-pass--one'),
        two: document.querySelector('.board-pass--two'),
    },
    boardOpp: {
        all: document.querySelectorAll('.board__opponent'),
        one: document.querySelector('.board__opponent--one'),
        two: document.querySelector('.board__opponent--two'),
    },

    volumeState: {
        parent: document.querySelector('.volume-state'),
        all: document.querySelectorAll('.volume-svg'),
    },

   
};
export const component = {
    form: document.createElement('form'),
    playerSetts: document.createElement('div'),
    placeHolder: document.createElement('div'),
    dragBoard: document.createElement('div'),
    confirmPlacement: {
        parent: document.createElement('div'),
        text: document.createElement('p'),
        confirmBtn: document.createElement('button'),

     
    },
    randSpan: document.createElement('span'),
    randomize: document.createElement('button'),
    authorization: {
        article: document.createElement('article'),
        title: document.createElement('h1'),
        body: document.createElement('p'),
        topSecret: document.createElement('span'),
        topSecretImg: document.createElement('img'),
        btn: document.createElement('button'),
    },
};

export const messages = {
    confirmPlacement: {
        title: `⚓ Attention Required!`,
        body: `Commander, please confirm that you are satisfied with the current deployment of your battle group.`,
        btn: `Pass the device`,
    },
    start: {
        title: `⚓ All Hands Ready!`,
        body: (name) =>
            `Admiral ${name}, confirm that your battle group is in position and ready for engagement.`,
        btn: `Start Game`,
    },
    nextPlacement: {
        title: `Authorization Needed`,
        body: (name) =>
            `<p>Admiral ${name},</p><p class="body-text">Authorize the placement of your carrier group before proceeding.</p>`,
        btn: `Authorize`,
    },
    nextTurn: {
        title: `Authorization Needed`,
        body: (name) =>
            `<p>Admiral ${name},</p><p class="body-text">Authorize the coordinates for your next strike.</p>`,
        btn: `Authorize Next Shot`,
    },
    winner: {
        title: (name) => `Mission Accomplished, Admiral ${name}!`,
        body: (name) =>
            `<p>Admiral ${name},</p>
         <p class="body-text">
            Your fleet has achieved total dominance at sea. All enemy vessels have been sunk, 
            and the battle is won. The crew salutes your brilliant strategy.
         </p>
         <p class="body-text">
            Stand by for your next mission.
         </p>`,
        btn: `⚓ Engage in Another Battle`,
    },
    AIwin: {
        title: (name) => `⚠ Defeat at Sea, Admiral ${name}!`,
        body: (name) =>
            `<p>Admiral ${name},</p>
     <p class="body-text">
        The AI fleet has overwhelmed our defenses and sent every last ship to the depths.
     </p>
     <p class="body-text">
        Is there still hope for humanity?.
     </p>`,
        btn: `Plan your revenge`,
    },
};
export function createBoardUI(board, parent) {
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
               
            }
            box.dataset.xCor = x;
            box.dataset.yCor = y;
            y++;

            parent.appendChild(box);
        });
    }
}

export function createForm() {
    elements.boardTwoWrapper.style.display = 'none';

    component.playerSetts.className = 'board__player_settings';

    component.form.innerHTML = `<div class ="form__radios">
                
                    <div class="form__checkbox ">
                        <input
                            type="radio"
                            name="playerChoice"
                            id="singlePlayer"
                            value="1v1"      
                            class= "radio"   
                            checked

                        />
                        <label class="checkbox__label active" for="singlePlayer">Two Players </label
                        >
                     </div>
                   
            
                    <div class="form__checkbox">
                        <input
                            type="radio"
                            name="playerChoice"
                            id="twoPlayer"
                            value="vsBot"
                            class= "radio"                
                           
                        />
                        <label class="checkbox__label" for="twoPlayer">Single Player</label
                        >
                   
                    </div>
                    </div>
                     <div class="form__extra">
                    <div class="form-group">
                        <label for="playerOne" class="name-input">Player One</label>
                        <input type="text" name="playerOneName" id="playerOne"  placeholder="e.g Joe" />
                    </div>
                    <div class="form-group player__two__input">
                        <label for="playerTwo" class="name-input">Player Two</label>
                        <input type="text" name="playerTwoName" id="playerTwo"  placeholder="Player Two" />
                    </div>
                </div>   
                <button type="submit" class= "form__button"> Start </button>
                    `;

    component.form.addEventListener('click', toggleInput);
    component.playerSetts.appendChild(component.form);
    elements.boardContainer.appendChild(component.playerSetts);
}

function toggleInput(e) {
    const target = e.target;
    const input = document.querySelector('.player__two__input');
    const form = target.closest('form');
    if (!target.classList.contains('radio')) return;

    form.querySelectorAll('.checkbox__label').forEach((el) =>
        el.classList.remove('active'),
    );
    target.nextElementSibling.classList.add('active');

    if (target.value === 'vsBot') input.classList.add('hide');
    else input.classList.remove('hide');
}

export function confirmPlacement(playerOne) {
    component.playerSetts.innerText = '';
    const parent = component.confirmPlacement.parent;
    parent.classList.add('confirmation');
    const text = component.confirmPlacement.text;
    const btn = component.confirmPlacement.confirmBtn;
    const msg = messages.confirmPlacement
        text.textContent = msg.body;
    const btnTxt = playerOne ? 'Pass device' : 'Start Game';

    btn.textContent = btnTxt;
    btn.style.color = playerOne ? 'darkblue' : 'white';
    btn.style.backgroundColor = playerOne ? 'blue' : 'hsla(119, 98%, 30%, 1)';
    component.confirmPlacement.parent.appendChild(text);
    component.confirmPlacement.parent.appendChild(btn);
    component.playerSetts.appendChild(component.confirmPlacement.parent);
}

export function resetPlacementBoard() {
    elements.boardOneWrapper.style.display = 'none';
    elements.boardTwoWrapper.style.display = '';
   
    component.placeHolder.innerHTML = '';
    component.playerSetts.innerHTML = '';
}

export function afterPlacement() {
    component.playerSetts.style.display = 'none';
    elements.boardOneWrapper.style.display = '';
    elements.analytics.currentPlayerOne.textContent = 'Your Ship';
    elements.analytics.currentPlayerTwo.textContent = 'Enemies Ship';
    elements.instructions.forEach((el) => el.classList.add('hide'));
}

export function initiatePassing(title, body, btnTxt) {
    const passInfo = component.authorization;
    const article = passInfo.article;
    elements.boardContainer.classList.add('no-visibility');

    article.classList.add('authorization');
    article.style.visibility = 'visible';

    passInfo.title.classList.add('authorization__title');
    passInfo.body.classList.add('authorization__body');
    passInfo.btn.classList.add('authorization__btn');
    passInfo.topSecret.classList.add('authorization__secrets');
    passInfo.topSecretImg.classList.add('secrets__img');
    passInfo.topSecretImg.src = topSecretImg;
   
    passInfo.title.textContent = title;
    passInfo.body.innerHTML = body;
    passInfo.btn.textContent = btnTxt;

    passInfo.topSecret.appendChild(passInfo.topSecretImg);
    article.appendChild(passInfo.title);
    article.appendChild(passInfo.body);
    article.appendChild(passInfo.btn);
    article.appendChild(passInfo.topSecret);

    elements.boardContainer.appendChild(article);
}

export function showLiveUpdates(ship) {
    let liveResponse;
    if (!ship) {
        liveResponse = 'We missed, Admiral';
    } else if (ship.isSunk()) {
        liveResponse = `Enemy ${ship.name} Sunk`;
    } else {
        liveResponse = `we have hit their ${ship.name}`;
    }

    elements.analytics.liveUpdate.textContent = liveResponse;
}

export function changeVolumeState() {
    elements.volumeState.all.forEach((state) =>
        state.classList.toggle('hide'),
    );
}
