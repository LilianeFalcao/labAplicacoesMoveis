import { AssignClassesToMonitorUseCase } from '../AssignClassesToMonitorUseCase';
import { IClassRepository, MonitorClassAssignment } from '@/domain/activity/repositories/IClassRepository';

describe('AssignClassesToMonitorUseCase', () => {
    let mockClassRepo: jest.Mocked<IClassRepository>;
    let useCase: AssignClassesToMonitorUseCase;

    beforeEach(() => {
        mockClassRepo = {
            findById: jest.fn(),
            findByIds: jest.fn(),
            findByMonitorId: jest.fn(),
            findAllWithoutMonitor: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
            assignClassesToMonitor: jest.fn(),
        };

        useCase = new AssignClassesToMonitorUseCase(mockClassRepo);
    });

    it('should assign classes to monitor with is_primary flag', async () => {
        const monitorId = 'monitor-1';
        const assignments: MonitorClassAssignment[] = [
            { classId: 'class-1', isPrimary: true },
            { classId: 'class-2', isPrimary: false },
        ];

        mockClassRepo.assignClassesToMonitor.mockResolvedValue(undefined);

        await useCase.execute(monitorId, assignments);

        expect(mockClassRepo.assignClassesToMonitor).toHaveBeenCalledWith(monitorId, assignments);
    });

    it('should throw error when monitorId is empty', async () => {
        await expect(
            useCase.execute('', [{ classId: 'class-1', isPrimary: true }])
        ).rejects.toThrow('Monitor ID is required');
    });

    it('should allow empty assignments (unlink all classes)', async () => {
        mockClassRepo.assignClassesToMonitor.mockResolvedValue(undefined);

        await useCase.execute('monitor-1', []);

        expect(mockClassRepo.assignClassesToMonitor).toHaveBeenCalledWith('monitor-1', []);
    });

    it('should throw error when more than one class is marked as primary', async () => {
        const assignments: MonitorClassAssignment[] = [
            { classId: 'class-1', isPrimary: true },
            { classId: 'class-2', isPrimary: true },
        ];

        await expect(
            useCase.execute('monitor-1', assignments)
        ).rejects.toThrow('Only one class can be marked as primary');
    });
});
