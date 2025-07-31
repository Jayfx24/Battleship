export const domController = {
    boardWrapper: document.querySelector('.board-wrapper'),
    boardOne: document.querySelector('.board-one'),
    boardTwo: document.querySelector('.board-two'),
    boardOneWrapper: document.querySelector('.board__one__wrapper'),
    boardTwoWrapper: document.querySelector('.board__two__wrapper'),
    playerOneInfo: document.querySelector('.player__one__info'),
    playerTwoInfo: document.querySelector('.player__two__info'),
    randomizeBtns : document.querySelectorAll('.randomize')

    // cors : document.querySelectorAll('.cor')
};
export const component = {
    form: document.createElement('form'),
    playerSetts: document.createElement('div'),
    placeHolder: document.createElement('div'),
    dragBoard: document.createElement('div'),
    confirmPlacement: {
        parent: document.createElement('div'),
        text: document.createElement('span'),
        confirmBtn: document.createElement('button'),

        // parent : document.createElement('div'),
    },
    randSpan : document.createElement('span'),
    randomize : document.createElement('button')
};

export function createForm() {
    domController.boardTwoWrapper.style.display = 'none';

    component.playerSetts.className = 'player__settings';

    component.form.innerHTML = `<div class="">
                        <input
                            type="radio"
                            name="playerChoice"
                            id="singlePlayer"
                            value="1v1"      
                            class= "radio"   
                            checked

                        />
                        <label for="singlePlayer">1v1</label
                        >
                    </div>
                    <div class="">
                        <input
                            type="radio"
                            name="playerChoice"
                            id="twoPlayer"
                            value="vsBot"
                            class= "radio"                
                           
                        />
                        <label for="twoPlayer">1vBot</label
                        >
                    </div>
                     <div class="extra-form">
                    <div class="">
                        <label for="playerOne">Player One</label>
                        <input type="text" name="playerOneName" id="playerOne" />
                    </div>
                    <div class="player__two__input">
                        <label for="playerTwo">Player Two</label>
                        <input type="text" name="playerTwoName" id="playerTwo" />
                    </div>
                </div>   
                <button type="submit"> Start </button>
                    `;

    component.form.addEventListener('click', toggleInput);
    component.playerSetts.appendChild(component.form);
    domController.boardWrapper.appendChild(component.playerSetts);
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

    const text = component.confirmPlacement.text;
    const btn = component.confirmPlacement.confirmBtn;
    text.textContent =
        'Admiral, Confirm if you are pleased with the placement of the battle group';
    const btnTxt = playerOne ? 'Pass the device to Player 2': 'Start Game'
  
    btn.textContent = btnTxt;

    component.confirmPlacement.parent.appendChild(text);
    component.confirmPlacement.parent.appendChild(btn);
    component.playerSetts.appendChild(component.confirmPlacement.parent);
}

export function resetPlacementBoard() {
    domController.boardOneWrapper.style.display = 'none';
    domController.boardTwoWrapper.style.display = '';
    domController.boardTwoWrapper.style.order = 2;
    component.placeHolder.innerHTML = '';
    component.playerSetts.innerHTML = '';
}

export function afterPlacement() {
    component.playerSetts.style.display = 'none';
    domController.boardOneWrapper.style.display = '';
}
