import { CreateClassUseCase } from '@/application/activity/use-cases/CreateClassUseCase';
import { IClassRepository } from '@/domain/activity/repositories/IClassRepository';
import { Class } from '@/domain/activity/entities/Class';

describe('CreateClassUseCase', () => {
    let mockClassRepo: jest.Mocked<IClassRepository>;
    let useCase: CreateClassUseCase;

    beforeEach(() => {
        mockClassRepo = {
            findById: jest.fn(),
            save: jest.fn(),
        } as any;

        useCase = new CreateClassUseCase(mockClassRepo);
    });

    it('should create a class successfully', async () => {
        const input = {
            name: 'Pintura a Dedo',
            description: 'Artes visuais para crianças',
            ageRange: '4-6 anos',
            days: ['MON', 'WED'] as any,
            startTime: '14:00',
            endTime: '15:30'
        };

        await useCase.execute(input);

        expect(mockClassRepo.save).toHaveBeenCalled();
        const savedClass = mockClassRepo.save.mock.calls[0][0];
        expect(savedClass.name).toBe(input.name);
        expect(savedClass.weeklySchedule.days).toEqual(input.days);
    });

    it('should throw error if name is empty', async () => {
        const input = {
            name: '',
            days: ['MON'] as any,
            startTime: '10:00',
            endTime: '11:00'
        } as any;

        await expect(useCase.execute(input)).rejects.toThrow('Class name is required');
    });
});
