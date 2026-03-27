import { IUserRepository } from '@/domain/identity/repositories/IUserRepository';
import { IAuthService } from '@/application/identity/services/IAuthService';
import { Email } from '@/domain/identity/value-objects/Email';
import { User } from '@/domain/identity/entities/User';
import { Role } from '@/domain/identity/value-objects/Role';

export class SignUpUseCase {
    constructor(
        private readonly authService: IAuthService,
        private readonly userRepo: IUserRepository
    ) { }

    async execute(emailStr: string, password: string): Promise<User> {
        const email = Email.create(emailStr);

        const existing = await this.userRepo.findByEmail(email);
        if (existing) {
            throw new Error('Email already in use');
        }

        // Default role for SignUp in this app is 'parent'
        const authUser = await this.authService.signUp(emailStr, password);

        const user = new User(
            authUser.id,
            email,
            Role.create('parent')
        );

        await this.userRepo.save(user);
        return user;
    }
}
