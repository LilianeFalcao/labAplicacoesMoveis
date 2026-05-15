import { IAuthService } from '../services/IAuthService';
import { IUserRepository } from '@/domain/identity/repositories/IUserRepository';
import { IGuardianRepository } from '@/domain/enrollment/repositories/IGuardianRepository';
import { User } from '@/domain/identity/entities/User';
import { Email } from '@/domain/identity/value-objects/Email';
import { Role } from '@/domain/identity/value-objects/Role';
import { Guardian } from '@/domain/enrollment/entities/Guardian';

export class SignUpParentUseCase {
    constructor(
        private readonly authService: IAuthService,
        private readonly userRepository: IUserRepository,
        private readonly guardianRepository: IGuardianRepository
    ) {}

    async execute(fullName: string, email: string, password: string): Promise<void> {
        // 1. Create account in Auth Service
        const authResult = await this.authService.signUp(email, password);

        try {
            // 2. Create User Profile
            const user = new User(
                authResult.id,
                Email.create(authResult.email),
                Role.create('parent'),
                fullName
            );
            await this.userRepository.create(user);

            // 3. Create Guardian Record
            const guardian = new Guardian(
                crypto.randomUUID(),
                authResult.id,
                false // Default image consent
            );
            await this.guardianRepository.save(guardian);
            
        } catch (error) {
            // Note: Ideally we would roll back auth creation here, 
            // but Supabase doesn't easily support deleting users from the client.
            // In a real app, this should be handled by a DB trigger or Edge Function.
            console.error('Error during profile creation after auth success:', error);
            throw new Error('Erro ao criar perfil de usuário. Por favor, tente novamente.');
        }
    }
}
