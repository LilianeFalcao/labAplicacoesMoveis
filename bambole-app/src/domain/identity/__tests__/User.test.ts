import { User } from '@/domain/identity/entities/User';
import { Email } from '@/domain/identity/value-objects/Email';
import { Role } from '@/domain/identity/value-objects/Role';

describe('User Entity', () => {
    it('should create a valid user', () => {
        const id = 'uuid-123';
        const email = Email.create('user@test.com');
        const role = Role.create('parent');
        const user = new User(id, email, role);

        expect(user.id).toBe(id);
        expect(user.email.value).toBe('user@test.com');
        expect(user.role.value).toBe('parent');
    });
});
