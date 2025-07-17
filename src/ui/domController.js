export const domController = {
    boardWrapper: document.querySelector('.board-wrapper'),
    boardOne: document.querySelector('.board-one'),
    boardTwo: document.querySelector('.board-two'),
    boardOneWrapper: document.querySelector('.board__one__wrapper'),
    boardTwoWrapper: document.querySelector('.board__two__wrapper'),
    playerOneInfo: document.querySelector('.player_one_info'),
    playerTwoInfo: document.querySelector('.player_one_info'),
    // cors : document.querySelectorAll('.cor')
};
export const component = {
    form: document.createElement('form'),
};

export function createForm() {
    domController.boardTwoWrapper.style.display = 'none';

    const playerSetts = document.createElement('div');
    playerSetts.className = 'player__settings';

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
    playerSetts.appendChild(component.form);
    domController.boardWrapper.appendChild(playerSetts);
}

function toggleInput(e) {
    const target = e.target;
    const input = document.querySelector('.player__two__input');

    if (!target.classList.contains('radio')) return;
    if (target.value === 'vsBot') input.classList.add('hide');
    else input.classList.remove('hide');
}
