import { SignInUseCase } from '@/application/identity/use-cases/SignInUseCase';
import { IUserRepository } from '@/domain/identity/repositories/IUserRepository';
import { Email } from '@/domain/identity/value-objects/Email';
import { User } from '@/domain/identity/entities/User';
import { Role } from '@/domain/identity/value-objects/Role';

describe('SignInUseCase', () => {
    let mockUserRepo: jest.Mocked<IUserRepository>;
    let mockAuthService: any;
    let useCase: SignInUseCase;

    beforeEach(() => {
        mockUserRepo = {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            save: jest.fn(),
        } as any;

        mockAuthService = {
            signIn: jest.fn(),
        };

        useCase = new SignInUseCase(mockAuthService, mockUserRepo);
    });

    it('should successfully sign in a user', async () => {
        const emailStr = 'user@test.com';
        const password = 'password123';
        const userId = 'uuid-123';
        const mockUser = new User(userId, Email.create(emailStr), Role.create('parent'));

        mockUserRepo.findByEmail.mockResolvedValue(mockUser);
        mockAuthService.signIn.mockResolvedValue({ id: userId, email: emailStr });

        const result = await useCase.execute(emailStr, password);

        expect(mockAuthService.signIn).toHaveBeenCalledWith(emailStr, password);
        expect(result).toBe(mockUser);
    });

    it('should throw error if user not found in database', async () => {
        mockUserRepo.findByEmail.mockResolvedValue(null);
        await expect(useCase.execute('none@test.com', 'pw')).rejects.toThrow('User not found');
    });
});
