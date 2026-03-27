import { Role } from '@/domain/identity/value-objects/Role';

describe('Role Value Object', () => {
    it('should create a valid parent role', () => {
        const role = Role.create('parent');
        expect(role.value).toBe('parent');
    });

    it('should create a valid monitor role', () => {
        const role = Role.create('monitor');
        expect(role.value).toBe('monitor');
    });

    it('should create a valid admin role', () => {
        const role = Role.create('admin');
        expect(role.value).toBe('admin');
    });

    it('should throw error for invalid role', () => {
        expect(() => Role.create('invalid' as any)).toThrow('Invalid user role');
    });
});
