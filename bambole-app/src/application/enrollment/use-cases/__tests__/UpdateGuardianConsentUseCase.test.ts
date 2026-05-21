import { UpdateGuardianConsentUseCase } from '@/application/enrollment/use-cases/UpdateGuardianConsentUseCase';
import { IGuardianRepository } from '@/domain/enrollment/repositories/IGuardianRepository';
import { Guardian } from '@/domain/enrollment/entities/Guardian';

describe('UpdateGuardianConsentUseCase', () => {
    let mockGuardianRepo: jest.Mocked<IGuardianRepository>;
    let useCase: UpdateGuardianConsentUseCase;

    beforeEach(() => {
        mockGuardianRepo = {
            findById: jest.fn(),
            findByUserId: jest.fn(),
            findByUserEmail: jest.fn(),
            save: jest.fn(),
            linkToChild: jest.fn(),
        };

        useCase = new UpdateGuardianConsentUseCase(mockGuardianRepo);
    });

    it('should update and save the consent when guardian is found', async () => {
        const userId = 'user-123';
        const mockGuardian = new Guardian('guardian-123', userId, false);
        mockGuardianRepo.findByUserId.mockResolvedValue(mockGuardian);
        mockGuardianRepo.save.mockResolvedValue(undefined);

        await useCase.execute(userId, true);

        expect(mockGuardianRepo.findByUserId).toHaveBeenCalledWith(userId);
        expect(mockGuardianRepo.save).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'guardian-123',
                userId: 'user-123',
                imageConsent: true,
                imageConsentAt: expect.any(Date)
            })
        );
    });

    it('should throw error when guardian is not found', async () => {
        const userId = 'non-existent';
        mockGuardianRepo.findByUserId.mockResolvedValue(null);

        await expect(useCase.execute(userId, true)).rejects.toThrow('Guardian profile not found');
    });

    it('should throw error if userId is empty', async () => {
        await expect(useCase.execute('', true)).rejects.toThrow('User ID is required');
    });
});
