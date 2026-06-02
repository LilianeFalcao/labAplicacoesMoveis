import { IAttendanceRepository } from '@/domain/attendance/repositories/IAttendanceRepository';
import { IClassRepository } from '@/domain/activity/repositories/IClassRepository';
import { AttendanceRecord } from '@/domain/attendance/entities/AttendanceRecord';
import { AttendanceStatus, GeolocationProof } from '@/domain/attendance/value-objects/AttendanceStatus';
import { IAgendaRepository } from '@/domain/activity/repositories/IAgendaRepository';

interface AttendanceInput {
    childId: string;
    status: 'present' | 'absent' | 'pre_justified' | 'justified';
    geolocation?: GeolocationProof;
}

export class TakeAttendanceUseCase {
    constructor(
        private readonly attendanceRepo: IAttendanceRepository,
        private readonly classRepo: IClassRepository,
        private readonly agendaRepo: IAgendaRepository
    ) { }

    async execute(
        classId: string,
        monitorId: string,
        date: Date,
        students: AttendanceInput[],
        activityId?: string
    ): Promise<void> {
        const cls = await this.classRepo.findById(classId);
        if (!cls) {
            throw new Error('Class not found');
        }

        // Validate schedule
        if (activityId) {
            const activities = await this.agendaRepo.findByClass(classId);
            const activity = activities.find(a => a.id === activityId);
            if (!activity) {
                throw new Error('Activity not found in this class agenda');
            }

            // Parse start and end times (HH:MM)
            const [startH, startM] = activity.startTime.split(':').map(Number);
            const [endH, endM] = activity.endTime.split(':').map(Number);

            const currentH = date.getHours();
            const currentM = date.getMinutes();

            const currentTotal = currentH * 60 + currentM;
            const startTotal = startH * 60 + startM;
            const endTotal = endH * 60 + endM;

            // Allow 30 minutes tolerance buffer before and after the activity
            const bufferBefore = 30;
            const bufferAfter = 30;

            const isAllowed = currentTotal >= (startTotal - bufferBefore) && currentTotal <= (endTotal + bufferAfter);

            if (!isAllowed) {
                throw new Error('Attendance outside schedule');
            }
        } else {
            // General call (no specific activity) — allow 60-minute tolerance window
            if (!cls.isCallAllowedNow(date, 60)) {
                throw new Error('Attendance outside schedule');
            }
        }

        const dateString = date.toISOString().split('T')[0];

        for (const student of students) {
            const existingRecord = await this.attendanceRepo.findByChildAndDate(student.childId, dateString);
            let record: AttendanceRecord;

            if (student.status === 'present') {
                if (!student.geolocation) throw new Error(`Geolocation required for present student ${student.childId}`);
                record = new AttendanceRecord(
                    existingRecord?.id,
                    student.childId,
                    classId,
                    monitorId,
                    date,
                    AttendanceStatus.create('present'),
                    student.geolocation,
                    undefined,
                    undefined,
                    activityId
                );
            } else if (student.status === 'pre_justified' || student.status === 'justified') {
                record = new AttendanceRecord(
                    existingRecord?.id,
                    student.childId,
                    classId,
                    monitorId,
                    date,
                    AttendanceStatus.create(student.status),
                    undefined,
                    existingRecord?.justificationNote,
                    existingRecord?.justifiedAt || new Date(),
                    activityId
                );
            } else {
                record = new AttendanceRecord(
                    existingRecord?.id,
                    student.childId,
                    classId,
                    monitorId,
                    date,
                    AttendanceStatus.create('absent'),
                    undefined,
                    undefined,
                    undefined,
                    activityId
                );
            }
            await this.attendanceRepo.save(record);
        }
    }
}
