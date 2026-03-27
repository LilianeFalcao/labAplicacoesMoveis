export type UserRole = 'parent' | 'monitor' | 'admin';

export class Role {
    private constructor(public readonly value: UserRole) { }

    static create(role: UserRole): Role {
        const validRoles: string[] = ['parent', 'monitor', 'admin'];
        if (!validRoles.includes(role)) {
            throw new Error('Invalid user role');
        }
        return new Role(role as UserRole);
    }
}
