import { SignUpUseCase } from '@/application/identity/use-cases/SignUpUseCase';
import { IUserRepository } from '@/domain/identity/repositories/IUserRepository';
import { Email } from '@/domain/identity/value-objects/Email';
import { User } from '@/domain/identity/entities/User';
import { Role } from '@/domain/identity/value-objects/Role';

describe('SignUpUseCase', () => {
    let mockUserRepo: jest.Mocked<IUserRepository>;
    let mockAuthService: any;
    let useCase: SignUpUseCase;

    beforeEach(() => {
        mockUserRepo = {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            save: jest.fn(),
        } as any;

        mockAuthService = {
            signUp: jest.fn(),
        };

        useCase = new SignUpUseCase(mockAuthService, mockUserRepo);
    });

    it('should successfully sign up a parent', async () => {
        const emailStr = 'parent@test.com';
        const password = 'password123';
        const userId = 'uuid-123';

        mockUserRepo.findByEmail.mockResolvedValue(null);
        mockAuthService.signUp.mockResolvedValue({ id: userId, email: emailStr });

        await useCase.execute(emailStr, password);

        expect(mockAuthService.signUp).toHaveBeenCalledWith(emailStr, password);
        expect(mockUserRepo.save).toHaveBeenCalled();
        const savedUser = mockUserRepo.save.mock.calls[0][0];
        expect(savedUser.id).toBe(userId);
        expect(savedUser.role.value).toBe('parent');
    });

    it('should throw error if email is already in use', async () => {
        const emailStr = 'existing@test.com';
        mockUserRepo.findByEmail.mockResolvedValue({} as User);

        await expect(useCase.execute(emailStr, 'pw')).rejects.toThrow('Email already in use');
    });
});
