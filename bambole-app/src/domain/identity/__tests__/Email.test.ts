import { Email } from '@/domain/identity/value-objects/Email';

describe('Email Value Object', () => {
    it('should create a valid email', () => {
        const emailStr = 'test@example.com';
        const email = Email.create(emailStr);
        expect(email.value).toBe(emailStr);
    });

    it('should throw error for invalid email', () => {
        expect(() => Email.create('invalid-email')).toThrow('Invalid email format');
        expect(() => Email.create('')).toThrow('Invalid email format');
    });
});
