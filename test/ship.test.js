import { createShip } from '../src/modules/ship';




describe('test createShip methods', () => {
    beforeEach(()=>{
        ship = createShip('Destroyer', 3);

    })
    test('increment hit count', () => {
        ship.hit();
        ship.hit();
        expect(ship.getHits()).toBe(2);
    });

    test('returns turn if ship is sunk', () => {
        ship.hit();
        ship.hit();
        ship.hit();
        expect(ship.isSunk()).toBe(true);
    });

    test('returns false if ship is not sunk', () => {
        ship.hit();

        expect(ship.isSunk()).toBe(false);
    });
});
