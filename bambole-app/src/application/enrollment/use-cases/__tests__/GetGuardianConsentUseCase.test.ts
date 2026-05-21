import { GetGuardianConsentUseCase } from '@/application/enrollment/use-cases/GetGuardianConsentUseCase';
import { IGuardianRepository } from '@/domain/enrollment/repositories/IGuardianRepository';
import { Guardian } from '@/domain/enrollment/entities/Guardian';

describe('GetGuardianConsentUseCase', () => {
    let mockGuardianRepo: jest.Mocked<IGuardianRepository>;
    let useCase: GetGuardianConsentUseCase;

    beforeEach(() => {
        mockGuardianRepo = {
            findById: jest.fn(),
            findByUserId: jest.fn(),
            findByUserEmail: jest.fn(),
            save: jest.fn(),
            linkToChild: jest.fn(),
        };

        useCase = new GetGuardianConsentUseCase(mockGuardianRepo);
    });

    it('should return imageConsent value of the guardian if found', async () => {
        const userId = 'user-123';
        const mockGuardian = new Guardian('guardian-123', userId, true, new Date());
        mockGuardianRepo.findByUserId.mockResolvedValue(mockGuardian);

        const result = await useCase.execute(userId);

        expect(result).toBe(true);
        expect(mockGuardianRepo.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should return false if guardian is not found', async () => {
        const userId = 'non-existent';
        mockGuardianRepo.findByUserId.mockResolvedValue(null);

        const result = await useCase.execute(userId);

        expect(result).toBe(false);
        expect(mockGuardianRepo.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should throw error if userId is empty', async () => {
        await expect(useCase.execute('')).rejects.toThrow('User ID is required');
    });
});
