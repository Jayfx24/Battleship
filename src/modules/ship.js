export function createShip(name, length){
    let hitCount = 0
   
    return{
        name,
        length,
        hit: () => hitCount++,
        isSunk: () => hitCount === length ? true: false,
        getHits: () => hitCount

    }
}