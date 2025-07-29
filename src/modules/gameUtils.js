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

    function generateShipCor(length, position) {
        if (!position) throw new Error('Orientation/direction not added');

        const xCor = generateRandInt();
        const yCor = generateRandInt();
        const mainAxis = position ? yCor : xCor;

        if (mainAxis + length - 1 >= max)
            return generateShipCor(length, position);

        // add ship occupied spots to shipPos
        if (!isEmpty(shipPos,xCor, yCor, length,position)) generateShipCor(length,position)
        // for (let i = 0; i < length; i++) {
        //     const x = position === 'vertical' ? xCor : xCor + i;
        //     const y = position === 'vertical' ? yCor + i : yCor;
        //     let OccupiedSpot = `${x},${y}`;
        //     if (shipPos.has(OccupiedSpot)) {
        //         return generateShipCor(length, position);
        //     }
        //     shipPos.add(OccupiedSpot);
        // }

        console.log(shipPos);
        return { xCor, yCor };
    }

    function isEmpty(set,xCor, yCor, length, position) {
        const holder = []
          
        for (let i = 0; i < length; i++) {
            const x = position ? xCor : xCor + i;
            const y = position ? yCor + i : yCor;
            let OccupiedSpot = `${x},${y}`;
            if (set.has(OccupiedSpot)) {
                console.log(OccupiedSpot)
                return false
            }
            
            holder.push(OccupiedSpot);
        }
        
        holder.forEach(cor => set.add(cor))
        return true
    }
    return {
        computerPlay,
        generateShipCor,
        clearShipPos: () => shipPos.clear(),
        isEmpty,
    };
}
