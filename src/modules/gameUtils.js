// create a function that creates two players, either human v human or human v AI

// generate random coordinates

export function gameUtils() {
    let shots = new Set();
    let max = 10;
    let min = 0;
    let shipPos = new Set();
    function generateRandInt() {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function computerPlay() {
        let x = generateRandInt();
        let y = generateRandInt();
        let key = `${x},${y}`;
        if (!shots.has(key)) {
            shots.add(key);
            return key;
        } else return computerPlay();
    }

    function randomlyPlaceShip(length, position) {
        if (!position) throw new Error('Orientation/direction not added');

        const xCor = generateRandInt();
        const yCor = generateRandInt();
        const mainAxis = position === 'vertical' ? yCor : xCor;

        if (mainAxis + length -1 >= max )
            return randomlyPlaceShip(length, position);

        // add ship occupied spots to shipPos
        for (let i = 0; i < length; i++) {
            const x = position === 'vertical' ? xCor : xCor + i;
            const y = position === 'vertical' ? yCor + i : yCor;
            let OccupiedSpot = `${x},${y}`;
            if (shipPos.has(OccupiedSpot)) {
                return randomlyPlaceShip(length, position);
            }
            shipPos.add(OccupiedSpot);
        }
        console.log(name);

        console.log(shipPos);
        return { xCor, yCor };
    }

    return { computerPlay, randomlyPlaceShip };
}
