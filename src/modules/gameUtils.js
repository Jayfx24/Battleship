// generate random coordinates

export function gameUtils() {
    let max = 10;
    let min = 0;
    let shipPos = new Set();
    let spaceContainer = new Set();

    function generateRandInt() {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function generateShipCor(length, position) {
        if (position == null || position === '')
            throw new Error('Orientation/direction not added');
        const maxRetries = 100;
        
        for ( let i = 1; i < maxRetries;i++) {
            const xCor = generateRandInt();
            const yCor = generateRandInt();

            const mainAxis = position ? yCor : xCor;
            const isRandom = true;
            if (mainAxis + length - 1 < max)
                if (isEmpty(shipPos, xCor, yCor, length, position, isRandom)) {
                    return { xCor, yCor };
                }
            
        }

        throw new Error('No valid ship coordinate found! Kindly refresh');
    }

    function isEmpty(set, xCor, yCor, length, position, isRandom = false) {
        let spacePos = [];
        
        for (let i = 0; i < length ; i++) {
            const x = position ? xCor : xCor + i;
            const y = position ? yCor + i : yCor;
            let OccupiedSpot = `${x},${y}`;

            if (isRandom) {
                if (set.has(OccupiedSpot) || spaceContainer.has(OccupiedSpot)) {
                    return false;
                }

                spacePos.push(OccupiedSpot);
                set.add(OccupiedSpot);

                let addSpacing = [];
                if (position) {
                    addSpacing = [`${x + 1},${y}`, `${x - 1},${y}`];
                    if (i === 0) addSpacing.push(`${x},${y - 1}`);
                    if (i === length - 1) addSpacing.push(`${x},${y + 1}`);
                } else {
                    addSpacing = [`${x},${y - 1}`, `${x},${y + 1}`];
                    if (i === 0) addSpacing.push(`${x - 1},${y}`);
                    if (i === length - 1) addSpacing.push(`${x + 1},${y}`);
                }

                addSpacing.forEach((cor) => {
                    if (!set.has(cor)) spaceContainer.add(cor);
                });
            } else {
                if (set.has(OccupiedSpot)) {
                    return false;
                }

                set.add(OccupiedSpot);
            }
        }
        if (isRandom) spacePos.forEach((cor) => spaceContainer.add(cor));

        
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
       
        return newArr;
    }
    return {
        possibleShots,
        shuffle,
        generateRandInt,
        generateShipCor,
        clearShipPos: () => {
            shipPos.clear();
            spaceContainer.clear();
        },
        isEmpty,
    };
}
