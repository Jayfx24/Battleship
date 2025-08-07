import topSecretImg from '../assets/images/top-secret.svg';

export const domController = {
    wrapper: document.querySelector('.wrapper'),
    boardContainer: document.querySelector('.board-container'),
    // boardWrapperOne: document.querySelector('.board__wrapper--one'),
    // boardWrapperTwo: document.querySelector('.board__wrapper--two'),
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
        all: document.querySelector('.board-pass'),
        one: document.querySelector('.board-pass--one'),
        two: document.querySelector('.board-pass--two'),
    },

    // cors : document.querySelectorAll('.cor')
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

        // parent : document.createElement('div'),
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

export function createForm() {
    domController.boardTwoWrapper.style.display = 'none';

    component.playerSetts.className = 'board__player_settings';

    component.form.innerHTML = `<div class ="form__radios">
                
                    <div class="form-group">
                        <input
                            type="radio"
                            name="playerChoice"
                            id="singlePlayer"
                            value="1v1"      
                            class= "radio"   
                            checked

                        />
                        <label for="singlePlayer">Two Players </label
                        >
                     </div>
                   
            
                    <div class="form-group">
                        <input
                            type="radio"
                            name="playerChoice"
                            id="twoPlayer"
                            value="vsBot"
                            class= "radio"                
                           
                        />
                        <label for="twoPlayer">Single Player</label
                        >
                   
                    </div>
                    </div>
                     <div class="form__extra">
                    <div class="form-group">
                        <label for="playerOne">Player One</label>
                        <input type="text" name="playerOneName" id="playerOne" placeholder="Player One" />
                    </div>
                    <div class="player__two__input">
                        <label for="playerTwo">Player Two</label>
                        <input type="text" name="playerTwoName" id="playerTwo" placeholder="Player Two" />
                    </div>
                </div>   
                <button type="submit" class= "form__button"> Start </button>
                    `;

    component.form.addEventListener('click', toggleInput);
    component.playerSetts.appendChild(component.form);
    domController.boardContainer.appendChild(component.playerSetts);
}

function toggleInput(e) {
    const target = e.target;
    const input = document.querySelector('.player__two__input');

    if (!target.classList.contains('radio')) return;
    if (target.value === 'vsBot') input.classList.add('hide');
    else input.classList.remove('hide');
}

export function confirmPlacement(playerOne) {
    component.playerSetts.innerText = '';
    const parent = component.confirmPlacement.parent;
    parent.classList.add('confirmation');
    const text = component.confirmPlacement.text;
    const btn = component.confirmPlacement.confirmBtn;
    text.textContent =
        'Admiral, Confirm if you are pleased with the placement of the battle group';
    const btnTxt = playerOne ? 'Pass device to Player 2' : 'Start Game';

    btn.textContent = btnTxt;
    btn.style.color = playerOne ? 'darkblue' : 'green';
    btn.style.backgroundColor = playerOne ? 'blue' : null;
    component.confirmPlacement.parent.appendChild(text);
    component.confirmPlacement.parent.appendChild(btn);
    component.playerSetts.appendChild(component.confirmPlacement.parent);
}

export function resetPlacementBoard() {
    domController.boardOneWrapper.style.display = 'none';
    domController.boardTwoWrapper.style.display = '';
    // domController.boardTwoWrapper.style.order = 2;
    component.placeHolder.innerHTML = '';
    component.playerSetts.innerHTML = '';
}

export function afterPlacement() {
    component.playerSetts.style.display = 'none';
    domController.boardOneWrapper.style.display = '';
    domController.analytics.currentPlayerOne.textContent = 'Your Ship';
    domController.analytics.currentPlayerTwo.textContent = 'Enemies Ship';
}

export function initiatePassing(title, body, btnTxt) {
    const passInfo = component.authorization;
    const article = passInfo.article;
    // article.innerHTML = '';

    article.classList.add('authorization');
    passInfo.title.classList.add('authorization__title');
    passInfo.body.classList.add('authorization__body');
    passInfo.btn.classList.add('authorization__btn');
    passInfo.topSecret.classList.add('authorization__secrets');
    passInfo.topSecretImg.classList.add('secrets__img');
    passInfo.topSecretImg.src = topSecretImg;
    //  console.log('../assets')
    passInfo.title.textContent = title;
    passInfo.body.innerHTML = body;
    passInfo.btn.textContent = btnTxt;

    passInfo.topSecret.appendChild(passInfo.topSecretImg);
    article.appendChild(passInfo.title);
    article.appendChild(passInfo.body);
    article.appendChild(passInfo.btn);
    article.appendChild(passInfo.topSecret);

    domController.boardContainer.appendChild(article);
}

export const messages = {
    confirmPlacement: {
        title: `ATTENTION NEEDED!!!`,
        body: (name) =>
            `Admiral ${name}  Confirm if you are pleased with the placement of the battle group'`,
        btn: `Pass the device to Player 2`,
    },
    start: {
        title: `ATTENTION NEEDED!!!`,
        body: (name) =>
            `Admiral ${name}  Confirm if you are pleased with the placement of the battle group'`,
        btn: `Start Game `,
    },

    nextPlacement: {
        title: `Authorization needed`,
        body: (name) =>
            ` <p>Admiral ${name},<p class= 'body-text'>Please authorize placement of carrier group`,
        btn: `Authorize`,
    },
    nextTurn: {
        title: `Authorization needed`,
        body: (name) =>
            ` <p>Admiral ${name},<p class= 'body-text'>Please authorize next Shot location`,
        btn: `Authorize next shot`,
    },
};

export function showLiveUpdates(ship) {
    let liveResponse;
    if (!ship) {
        liveResponse = 'We missed, Admiral';
    } else if (ship.isSunk()) {
        liveResponse = `Enemy ${ship.name} Sunk`;
    } else {
        liveResponse = `we have hit their ${ship.name}`;
    }

    domController.analytics.liveUpdate.textContent = liveResponse;
}
