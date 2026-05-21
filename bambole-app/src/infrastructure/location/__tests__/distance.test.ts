import { getDistanceHaversine } from '../distance';

describe('getDistanceHaversine', () => {
    it('should return 0 for the same coordinates', () => {
        const lat = -23.5505;
        const lon = -46.6333;
        const distance = getDistanceHaversine(lat, lon, lat, lon);
        expect(distance).toBeCloseTo(0, 1);
    });

    it('should calculate correct distance for known coordinates', () => {
        // Distance between Sé Cathedral (-23.5505, -46.6333) and Republica Square (-23.5428, -46.6422) is approx 1250 meters
        const lat1 = -23.5505;
        const lon1 = -46.6333;
        const lat2 = -23.5428;
        const lon2 = -46.6422;
        
        const distance = getDistanceHaversine(lat1, lon1, lat2, lon2);
        
        // Assert distance is roughly 1250 meters +/- 50m
        expect(distance).toBeGreaterThan(1200);
        expect(distance).toBeLessThan(1300);
    });
});
