import { SignUpParentUseCase } from '../use-cases/SignUpParentUseCase';
import { IAuthService } from '../services/IAuthService';
import { IUserRepository } from '@/domain/identity/repositories/IUserRepository';
import { IGuardianRepository } from '@/domain/enrollment/repositories/IGuardianRepository';
import { User } from '@/domain/identity/entities/User';
import { Guardian } from '@/domain/enrollment/entities/Guardian';

describe('SignUpParentUseCase', () => {
    let mockAuthService: jest.Mocked<IAuthService>;
    let mockUserRepo: jest.Mocked<IUserRepository>;
    let mockGuardianRepo: jest.Mocked<IGuardianRepository>;
    let useCase: SignUpParentUseCase;

    beforeEach(() => {
        mockAuthService = {
            signUp: jest.fn(),
            signIn: jest.fn(),
            signOut: jest.fn(),
            getCurrentUser: jest.fn(),
        } as any;

        mockUserRepo = {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        } as any;

        mockGuardianRepo = {
            findById: jest.fn(),
            findByUserId: jest.fn(),
            save: jest.fn(),
        } as any;

        useCase = new SignUpParentUseCase(mockAuthService, mockUserRepo, mockGuardianRepo);
    });

    it('should successfully sign up parent and create user and guardian profiles', async () => {
        const fullName = 'Mariana Silva';
        const email = 'mariana@test.com';
        const password = 'password123';
        const userId = 'auth-id-123';

        mockAuthService.signUp.mockResolvedValue({ id: userId, email });
        mockUserRepo.create.mockResolvedValue(undefined);
        mockGuardianRepo.save.mockResolvedValue(undefined);

        await useCase.execute(fullName, email, password);

        expect(mockAuthService.signUp).toHaveBeenCalledWith(email, password);
        
        expect(mockUserRepo.create).toHaveBeenCalled();
        const createdUser: User = mockUserRepo.create.mock.calls[0][0];
        expect(createdUser.id).toBe(userId);
        expect(createdUser.fullName).toBe(fullName);
        expect(createdUser.email.value).toBe(email);
        expect(createdUser.role.value).toBe('parent');

        expect(mockGuardianRepo.save).toHaveBeenCalled();
        const savedGuardian: Guardian = mockGuardianRepo.save.mock.calls[0][0];
        expect(savedGuardian.userId).toBe(userId);
        expect(savedGuardian.imageConsent).toBe(false);
    });

    it('should catch profile creation errors, log them, and throw a user-friendly error message', async () => {
        const fullName = 'Mariana Silva';
        const email = 'mariana@test.com';
        const password = 'password123';
        const userId = 'auth-id-123';

        mockAuthService.signUp.mockResolvedValue({ id: userId, email });
        mockUserRepo.create.mockRejectedValue(new Error('DB Connection Failed'));

        // Silence console.error for clean test output
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(useCase.execute(fullName, email, password)).rejects.toThrow(
            'Erro ao criar perfil de usuário. Por favor, tente novamente.'
        );

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
