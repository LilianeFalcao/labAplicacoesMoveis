import { LinkGuardianToChildUseCase } from '@/application/enrollment/use-cases/LinkGuardianToChildUseCase';
import { IGuardianRepository } from '@/domain/enrollment/repositories/IGuardianRepository';
import { IChildRepository } from '@/domain/enrollment/repositories/IChildRepository';
import { Guardian } from '@/domain/enrollment/entities/Guardian';
import { Child } from '@/domain/enrollment/entities/Child';
import { ChildName } from '@/domain/enrollment/value-objects/ChildName';

describe('LinkGuardianToChildUseCase', () => {
    let mockGuardianRepo: jest.Mocked<IGuardianRepository>;
    let mockChildRepo: jest.Mocked<IChildRepository>;
    let useCase: LinkGuardianToChildUseCase;

    beforeEach(() => {
        mockGuardianRepo = {
            findById: jest.fn(),
            findByUserId: jest.fn(),
            save: jest.fn(),
            linkToChild: jest.fn(),
        } as any;

        mockChildRepo = {
            findById: jest.fn(),
            findByClassId: jest.fn(),
            save: jest.fn(),
        } as any;

        useCase = new LinkGuardianToChildUseCase(mockGuardianRepo, mockChildRepo);
    });

    it('should link guardian to child successfully', async () => {
        const guardianId = 'g1';
        const childId = 'c1';

        mockGuardianRepo.findById.mockResolvedValue(new Guardian(guardianId, 'u1', true));
        mockChildRepo.findById.mockResolvedValue(new Child(childId, ChildName.create('João'), undefined, 'class-1'));

        await useCase.execute(guardianId, childId);

        expect(mockGuardianRepo.linkToChild).toHaveBeenCalledWith(guardianId, childId);
    });

    it('should throw error if guardian not found', async () => {
        mockGuardianRepo.findById.mockResolvedValue(null);
        await expect(useCase.execute('g1', 'c1')).rejects.toThrow('Guardian not found');
    });

    it('should throw error if child not found', async () => {
        mockGuardianRepo.findById.mockResolvedValue(new Guardian('g1', 'u1', true));
        mockChildRepo.findById.mockResolvedValue(null);
        await expect(useCase.execute('g1', 'c1')).rejects.toThrow('Child not found');
    });
});
