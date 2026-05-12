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

        // 1. Authenticate first via Supabase Auth
        const authData = await this.authService.signIn(emailStr, password);

        // 2. Fetch the associated profile from public.users
        const user = await this.userRepo.findById(authData.id);
        
        if (!user) {
            throw new Error('Perfil de usuário não encontrado. Verifique se o cadastro foi concluído no banco de dados.');
        }

        return user;
    }
}
