export function createShip(name, length, orientation = true){
    let hitCount = 0
   
    return{
        name,
        length,
        orientation,
        hit: () => hitCount++,
        isSunk: () => hitCount === length ? true: false,
        getHits: () => hitCount


    }
}