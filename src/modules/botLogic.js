import { gameUtils } from './gameUtils';

export class botPlay {
    constructor() {
        this.utils = gameUtils();
        this.shots = new Set();
        this.firedShots = new Set();
        this.validShots = this.utils.possibleShots();
        this.hitCor = null;
        this.currentShot = null;
        this.left = this.right = this.bottom = this.top = null;
    }

    // play() {
    //     let xCor = this.utils.generateRandInt();
    //     let yCor = this.utils.generateRandInt();

    //     let key = `${xCor},${yCor}`;

    //     if (!this.shots.has(key)) {
    //         this.shots.add(key);
    //         return { xCor, yCor };
    //     } else return this.play();
    // }

    nextShot() {
        this.currentShot = this.validShots.pop();
        this.firedShots.add(`${this.currentShot[0]}:${this.currentShot[1]}`);
        console.log(this.firedShots);
        return this.currentShot;
    }

    isHit(hit) {
        if (!hit) return;

        this.hitCor = this.currentShot;
        const { xCor, yCor } = this.hitCor;

        const moves = {
            right: [xCor, yCor + 1],
            left: [xCor, yCor - 1],
            top: [xCor + 1, yCor],
            bottom: [xCor - 1, yCor],
        };
        for (m of moves) {
            if (this.positionChecker(m[0], m[1])) {
                let nextShot = { xCor: m[0], yCor: m[1] } 
                console.log(nextShot);
                this.validShots = this.validShots.filter(obj => !(obj.xCor === nextShot.xCor && obj.yCor === nextShot.yCor))
                return nextShot;
            }
        }
        // else if (this.positionChecker(xCor))

        // right
        // top
        // bottom
    }
    positionChecker(xCor, yCor) {
        if (
            xCor > 9 ||
            xCor < 0 ||
            yCor > 9 ||
            yCor < 0 ||
            this.firedShots.has(`${xCor}:${yCor}`)
        )
            return false;

        return true;
    }
}
