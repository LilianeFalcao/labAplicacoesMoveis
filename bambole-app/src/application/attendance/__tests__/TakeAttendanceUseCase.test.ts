import { TakeAttendanceUseCase } from '@/application/attendance/use-cases/TakeAttendanceUseCase';
import { IAttendanceRepository } from '@/domain/attendance/repositories/IAttendanceRepository';
import { IClassRepository } from '@/domain/activity/repositories/IClassRepository';
import { AttendanceRecord } from '@/domain/attendance/entities/AttendanceRecord';
import { Class, WeeklySchedule } from '@/domain/activity/entities/Class';

describe('TakeAttendanceUseCase', () => {
    let mockAttendanceRepo: jest.Mocked<IAttendanceRepository>;
    let mockClassRepo: jest.Mocked<IClassRepository>;
    let useCase: TakeAttendanceUseCase;

    beforeEach(() => {
        mockAttendanceRepo = {
            save: jest.fn(),
            findById: jest.fn(),
            findByChildAndDate: jest.fn(),
            findByClassAndDate: jest.fn(),
        } as any;

        mockClassRepo = {
            findById: jest.fn(),
            save: jest.fn(),
        } as any;

        useCase = new TakeAttendanceUseCase(mockAttendanceRepo, mockClassRepo);
    });

    it('should take attendance successfully', async () => {
        const classId = 'cl1';
        const monitorId = 'm1';
        const date = new Date('2026-03-23T15:00:00'); // 2026-03-23 is Monday
        const students = [
            { childId: 'c1', status: 'present' as const, geolocation: { lat: 1, lng: 2 } },
            { childId: 'c2', status: 'absent' as const },
        ];

        const mockClass = new Class(classId, 'Turma A', new WeeklySchedule(['MON'], '14:00', '17:00'));
        mockClassRepo.findById.mockResolvedValue(mockClass);

        await useCase.execute(classId, monitorId, date, students);

        expect(mockAttendanceRepo.save).toHaveBeenCalledTimes(2);
    });

    it('should throw error if class not found', async () => {
        mockClassRepo.findById.mockResolvedValue(null);
        await expect(useCase.execute('cl1', 'm1', new Date(), [])).rejects.toThrow('Class not found');
    });

    it('should throw error if outside schedule', async () => {
        const mockClass = new Class('cl1', 'Turma A', new WeeklySchedule(['MON'], '14:00', '17:00'));
        jest.spyOn(mockClass, 'isCallAllowedNow').mockReturnValue(false);
        mockClassRepo.findById.mockResolvedValue(mockClass);

        await expect(useCase.execute('cl1', 'm1', new Date(), [])).rejects.toThrow('Attendance outside schedule');
    });
});
