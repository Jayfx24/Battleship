import { createShip } from '../src/modules/ship';

console.log(createShip);


describe('test createShip methods', () => {
    
    test('increment hit count', () => {
        const ship = createShip('Destroyer', 3);
        ship.hit();
        ship.hit();
        expect(ship.getHits()).toBe(2);
    });

    test('returns turn if ship is sunk', () => {
        const ship = createShip('Destroyer', 3);
        ship.hit();
        ship.hit();
        ship.hit();
        expect(ship.isSunk()).toBe(true);
    });

    test('returns false if ship is not sunk', () => {
        const ship = createShip('Destroyer', 3);
        ship.hit();

        expect(ship.isSunk()).toBe(false);
    });
});
