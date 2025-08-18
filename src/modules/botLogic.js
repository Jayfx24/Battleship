import { gameUtils } from './gameUtils';

export class botPlay {
    constructor() {
        this.utils = gameUtils();
        this.shots = new Set();
        this.firedShots = new Set();
        this.unfilteredShots = this.utils.possibleShots();
        this.validShots = this.unfilteredShots.filter(
            ({ xCor, yCor }) => (xCor + yCor) % 2 === 0,
        );

        this.shotDirection = [];
        this.initialHit = null;
        this.currentShot = null;
        this.dir =
            this.left =
            this.right =
            this.bottom =
            this.top =
            this.isAfloat =
            this.followUpHit =
            this.shipHit =
                null;
    }

    listener(shipHit, isSunk) {
        if (shipHit || this.isAfloat) {
            if (this.initialHit == null) this.initialHit = this.currentShot;
            // only turns afloat m followUpHit on first hit
            this.isAfloat = true;
            this.followUpHit = true;
            if (!shipHit) {
                // restore to initial point
                this.currentShot = this.initialHit;
                // change orientation to opposite e.g left - right
                this.shipHit = null;
                this.dir = this.orientation(this.dir);
                if (this.dir) this.shotDirection.push(this.dir);
            } else this.shipHit = true;
            if (isSunk) {
                this.resetTracking();
            }
            // this.isHit();
        }
    }
    nextShot() {
        if (this.followUpHit) {
            // activates for second hit
            // 3rd now

            const nextShot = this.isHit();

            if (nextShot) {
                this.firedShots.add(`${nextShot.xCor}:${nextShot.yCor}`);
                this.currentShot = nextShot;
                return nextShot;
            }
        }

        this.resetTracking();
        if (this.validShots) this.currentShot = this.validShots.pop();
        this.firedShots.add(
            `${this.currentShot.xCor}:${this.currentShot.yCor}`,
        );

        return this.currentShot;
    }

    isHit() {
        // for second shot
        // missed current = initial
        const { xCor, yCor } = this.currentShot;

        const moves = {
            left: [0, -1],
            right: [0, 1],
            top: [-1, 0],
            bottom: [1, 0],
        };

        const shuffledMove = this.utils.shuffle(Object.entries(moves));
        // if dir causes hit save and continue the direction

        if (this.dir) {
            const [x, y] = moves[this.dir];
            const newX = xCor + x;
            const newY = yCor + y;
            const nextShot = this.positionChecker(newX, newY);

            console.log(nextShot);

            if (!nextShot && this.shipHit) {
                this.currentShot = this.initialHit;
                this.dir = this.orientation(this.dir);
                this.shotDirection.push(this.dir);

                return this.isHit();
            }

            if (nextShot) return nextShot;
        }

        // check each dir
        if (this.shotDirection.length === 4) {
            this.resetTracking();
            return null;
        }
        for (const [direction, [x, y]] of shuffledMove) {
            if (!this.shotDirection.includes(direction)) {
                const newX = xCor + x;
                const newY = yCor + y;
                this.dir = direction;
                this.shotDirection.push(direction);
                const nextShot = this.positionChecker(newX, newY);

                if (nextShot) return nextShot;
            }
        }

        // right
        // top
        // bottom
        this.resetTracking();
        return null;
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

        let nextShot = { xCor, yCor };
        this.validShots = this.validShots.filter(
            (obj) =>
                !(obj.xCor === nextShot.xCor && obj.yCor === nextShot.yCor),
        );
        return nextShot;
    }

    orientation(dir) {
        const opposites = {
            right: 'left',
            left: 'right',
            top: 'bottom',
            bottom: 'top',
        };

        const nextDir = opposites[dir];
        if (nextDir && !this.shotDirection.includes(nextDir)) {
            return nextDir;
        }

        return null;
    }

    resetTracking() {
        this.isAfloat = null;
        this.followUpHit = null;
        this.initialHit = null;
        this.currentShot = null;
        this.dir = null;
        this.shipHit = null;
        this.shotDirection = [];
    }
}
