import { gameUtils } from './gameUtils';

export class botPlay {
    constructor() {
        this.utils = gameUtils();
        this.shots = new Set();
    }

    play() {
        let xCor = this.utils.generateRandInt();
        let yCor = this.utils.generateRandInt();

        let key = `${xCor},${yCor}`;

        if (!this.shots.has(key)) {
            this.shots.add(key);
            return {xCor,yCor};
        } else return this.play();
    }
}
