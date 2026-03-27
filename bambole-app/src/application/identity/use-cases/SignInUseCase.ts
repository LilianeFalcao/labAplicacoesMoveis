import { IUserRepository } from '@/domain/identity/repositories/IUserRepository';
import { IAuthService } from '@/application/identity/services/IAuthService';
import { Email } from '@/domain/identity/value-objects/Email';
import { User } from '@/domain/identity/entities/User';

export class SignInUseCase {
    constructor(
        private readonly authService: IAuthService,
        private readonly userRepo: IUserRepository
    ) { }

    async execute(emailStr: string, password: string): Promise<User> {
        const email = Email.create(emailStr);

        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        await this.authService.signIn(emailStr, password);

        return user;
    }
}
