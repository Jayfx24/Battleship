// generate random coordinates

export function gameUtils() {
    let shipCoord = possibleShots();
    let max = 10;
    let min = 0;
    let shipPos = new Set();

    function generateRandInt() {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function generateShipCor(length, position) {
        if (position == null || position === '')
            throw new Error('Orientation/direction not added');
        console.log(shipCoord);
        let c = 0
        for (let cor of shipCoord) {
            console.log(c++)
            const { xCor, yCor } = cor;
            const mainAxis = position ? yCor : xCor;

            if (mainAxis + length - 1 < max)
                if (isEmpty(shipPos, xCor, yCor, length, position)) {
                    return { xCor, yCor };
                } else {
                    console.log({ xCor, yCor });
                }
        }

        throw new Error('No valid ship coordinate found! Kindly refresh');
    }

    function isEmpty(set, xCor, yCor, length, position) {
        const holder = [];

        for (let i =0; i < length ; i++) {
            const x = position ? xCor : xCor + i;
            const y = position ? yCor + i : yCor;
            let addSpacing = [];
            if (position) {
                
                addSpacing = [`${x},${y}`, `${x + 1},${y}`, `${x - 1},${y}`];
            } else {
                addSpacing = [`${x},${y}`, `${x},${y - 1}`, `${x},${y + 1}`];
            }

            // let OccupiedSpot = `${x},${y}`;
            console.log(addSpacing.length)
            for (const c of addSpacing) {
                if (set.has(c)) {
                    console.log(c)
                    return false;
                }
                holder.push(c);
            }
        }

        holder.forEach((cor) => set.add(cor));
        // console.log(holder)
        return true;
    }

    function possibleShots() {
        const arr1 = Array.from({ length: 10 }, (_, i) => i);
        const arr2 = Array.from({ length: 10 }, (_, i) => i);
        const validShots = [];
        for (let i = 0; i < arr1.length; i++) {
            for (let v = 0; v < arr2.length; v++) {
                const x = arr1[i];
                const y = arr2[v];
                if ((x + y) % 2 === 0)
                validShots.push({ xCor: x, yCor: y });
            }
        }
        return shuffle(validShots);
    }

    function shuffle(arr) {
        const newArr = [...arr];
        for (let i = newArr.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        // console.log(newArr);
        return newArr;
    }
    return {
        possibleShots,
        shuffle,
        generateRandInt,
        generateShipCor,
        clearShipPos: () => shipPos.clear(),
        resetShipCoord: () => (shipCoord = possibleShots()),
        isEmpty,
    };
}
