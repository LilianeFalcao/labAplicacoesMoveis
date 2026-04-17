import { GetClassesWithoutMonitorUseCase } from '../GetClassesWithoutMonitorUseCase';
import { IClassRepository } from '../../../../domain/activity/repositories/IClassRepository';
import { Class, WeeklySchedule } from '../../../../domain/activity/entities/Class';

describe('GetClassesWithoutMonitorUseCase', () => {
    let useCase: GetClassesWithoutMonitorUseCase;
    let mockClassRepository: jest.Mocked<IClassRepository>;

    beforeEach(() => {
        mockClassRepository = {
            findById: jest.fn(),
            findAllWithoutMonitor: jest.fn(),
            save: jest.fn()
        };
        useCase = new GetClassesWithoutMonitorUseCase(mockClassRepository);
    });

    it('should return classes without monitor', async () => {
        const classes = [
            new Class('1', 'Turma A', new WeeklySchedule(['MON'], '08:00', '10:00')),
            new Class('2', 'Turma B', new WeeklySchedule(['TUE'], '10:00', '12:00'))
        ];
        mockClassRepository.findAllWithoutMonitor.mockResolvedValue(classes);

        const result = await useCase.execute();

        expect(result).toBe(classes);
        expect(mockClassRepository.findAllWithoutMonitor).toHaveBeenCalled();
    });
});
