import { Child } from '@/domain/enrollment/entities/Child';
import { ChildName } from '@/domain/enrollment/value-objects/ChildName';
import { Guardian } from '@/domain/enrollment/entities/Guardian';

describe('Enrollment Domain', () => {
    describe('ChildName Value Object', () => {
        it('should create a valid child name', () => {
            const name = ChildName.create('João Silva');
            expect(name.value).toBe('João Silva');
        });

        it('should throw error for invalid names', () => {
            expect(() => ChildName.create('')).toThrow('Invalid child name');
            expect(() => ChildName.create('A')).toThrow('Invalid child name');
        });
    });

    describe('Child Entity', () => {
        it('should create a valid child', () => {
            const name = ChildName.create('Maria');
            const child = new Child('c1', name, undefined, 'class-1');
            expect(child.id).toBe('c1');
            expect(child.name.value).toBe('Maria');
        });
    });

    describe('Guardian Entity', () => {
        it('should create a valid guardian', () => {
            const guardian = new Guardian('g1', 'u1', true, new Date());
            expect(guardian.id).toBe('g1');
            expect(guardian.imageConsent).toBe(true);
        });
    });
});
