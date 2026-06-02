import { TakeAttendanceUseCase } from '@/application/attendance/use-cases/TakeAttendanceUseCase';
import { IAttendanceRepository } from '@/domain/attendance/repositories/IAttendanceRepository';
import { IClassRepository } from '@/domain/activity/repositories/IClassRepository';
import { AttendanceRecord } from '@/domain/attendance/entities/AttendanceRecord';
import { Class, WeeklySchedule } from '@/domain/activity/entities/Class';
import { IAgendaRepository } from '@/domain/activity/repositories/IAgendaRepository';
import { AttendanceStatus } from '@/domain/attendance/value-objects/AttendanceStatus';

describe('TakeAttendanceUseCase', () => {
    let mockAttendanceRepo: jest.Mocked<IAttendanceRepository>;
    let mockClassRepo: jest.Mocked<IClassRepository>;
    let mockAgendaRepo: jest.Mocked<IAgendaRepository>;
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

        mockAgendaRepo = {
            findByClass: jest.fn(),
            save: jest.fn(),
            updateStatus: jest.fn(),
        } as any;

        useCase = new TakeAttendanceUseCase(mockAttendanceRepo, mockClassRepo, mockAgendaRepo);
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

    it('should throw error if outside schedule (spy overrides tolerance)', async () => {
        const mockClass = new Class('cl1', 'Turma A', new WeeklySchedule(['MON'], '14:00', '17:00'));
        // Mock returns false regardless of toleranceMinutes — keeps test hermetic
        jest.spyOn(mockClass, 'isCallAllowedNow').mockReturnValue(false);
        mockClassRepo.findById.mockResolvedValue(mockClass);

        await expect(useCase.execute('cl1', 'm1', new Date(), [])).rejects.toThrow('Attendance outside schedule');
    });

    it('should throw error if geolocation is missing for present student', async () => {
        const classId = 'cl1';
        const date = new Date('2026-03-23T15:00:00');
        const students = [{ childId: 'c1', status: 'present' as const }]; // missing geolocation

        const mockClass = new Class(classId, 'Turma A', new WeeklySchedule(['MON'], '14:00', '17:00'));
        mockClassRepo.findById.mockResolvedValue(mockClass);

        await expect(useCase.execute(classId, 'm1', date, students)).rejects.toThrow('Geolocation required for present student c1');
    });

    it('should take attendance successfully within a dynamically registered activity schedule', async () => {
        const classId = 'cl1';
        const monitorId = 'm1';
        const date = new Date('2026-03-23T10:15:00'); // 10:15 is within 10:00 - 11:00 schedule
        const students = [
            { childId: 'c1', status: 'present' as const, geolocation: { lat: 1, lng: 2 } },
        ];

        const mockClass = new Class(classId, 'Turma A', new WeeklySchedule(['MON'], '14:00', '17:00'));
        mockClassRepo.findById.mockResolvedValue(mockClass);

        const mockActivity = {
            id: 'act1',
            classId: 'cl1',
            startTime: '10:00',
            endTime: '11:00',
            title: 'Dynamic Activity',
            status: 'ongoing' as const,
            category: 'activity' as const
        };
        mockAgendaRepo.findByClass.mockResolvedValue([mockActivity]);

        await useCase.execute(classId, monitorId, date, students, 'act1');

        expect(mockAttendanceRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should throw error if outside the dynamically registered activity schedule', async () => {
        const classId = 'cl1';
        const monitorId = 'm1';
        const date = new Date('2026-03-23T12:00:00'); // 12:00 is outside 10:00 - 11:00 (even with 30-min buffer)
        const students = [
            { childId: 'c1', status: 'present' as const, geolocation: { lat: 1, lng: 2 } },
        ];

        const mockClass = new Class(classId, 'Turma A', new WeeklySchedule(['MON'], '14:00', '17:00'));
        mockClassRepo.findById.mockResolvedValue(mockClass);

        const mockActivity = {
            id: 'act1',
            classId: 'cl1',
            startTime: '10:00',
            endTime: '11:00',
            title: 'Dynamic Activity',
            status: 'ongoing' as const,
            category: 'activity' as const
        };
        mockAgendaRepo.findByClass.mockResolvedValue([mockActivity]);

        await expect(useCase.execute(classId, monitorId, date, students, 'act1')).rejects.toThrow('Attendance outside schedule');
    });

    it('should preserve pre_justified status and justification fields if not changed', async () => {
        const classId = 'cl1';
        const monitorId = 'm1';
        const date = new Date('2026-03-23T15:00:00');
        const students = [
            { childId: 'c1', status: 'pre_justified' as const }
        ];

        const mockClass = new Class(classId, 'Turma A', new WeeklySchedule(['MON'], '14:00', '17:00'));
        mockClassRepo.findById.mockResolvedValue(mockClass);

        const existingRecord = new AttendanceRecord(
            'record-id',
            'c1',
            classId,
            '',
            date,
            AttendanceStatus.create('pre_justified'),
            undefined,
            'Medical appointment',
            new Date('2026-03-23T10:00:00')
        );
        mockAttendanceRepo.findByChildAndDate.mockResolvedValue(existingRecord);

        await useCase.execute(classId, monitorId, date, students);

        expect(mockAttendanceRepo.save).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'record-id',
                childId: 'c1',
                classId: 'cl1',
                monitorId: 'm1',
                status: expect.objectContaining({ value: 'pre_justified' }),
                justificationNote: 'Medical appointment'
            })
        );
    });

    it('should clean justification note and justified date when student status is changed to present', async () => {
        const classId = 'cl1';
        const monitorId = 'm1';
        const date = new Date('2026-03-23T15:00:00');
        const students = [
            { childId: 'c1', status: 'present' as const, geolocation: { lat: 1, lng: 2 } }
        ];

        const mockClass = new Class(classId, 'Turma A', new WeeklySchedule(['MON'], '14:00', '17:00'));
        mockClassRepo.findById.mockResolvedValue(mockClass);

        const existingRecord = new AttendanceRecord(
            'record-id',
            'c1',
            classId,
            '',
            date,
            AttendanceStatus.create('pre_justified'),
            undefined,
            'Medical appointment',
            new Date('2026-03-23T10:00:00')
        );
        mockAttendanceRepo.findByChildAndDate.mockResolvedValue(existingRecord);

        await useCase.execute(classId, monitorId, date, students);

        expect(mockAttendanceRepo.save).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'record-id',
                childId: 'c1',
                classId: 'cl1',
                monitorId: 'm1',
                status: expect.objectContaining({ value: 'present' }),
                justificationNote: undefined,
                justifiedAt: undefined
            })
        );
    });
});
