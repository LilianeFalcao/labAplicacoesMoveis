import { IAttendanceRepository } from '@/domain/attendance/repositories/IAttendanceRepository';
import { IClassRepository } from '@/domain/activity/repositories/IClassRepository';
import { AttendanceRecord } from '@/domain/attendance/entities/AttendanceRecord';
import { GeolocationProof } from '@/domain/attendance/value-objects/AttendanceStatus';

interface AttendanceInput {
    childId: string;
    status: 'present' | 'absent';
    geolocation?: GeolocationProof;
}

export class TakeAttendanceUseCase {
    constructor(
        private readonly attendanceRepo: IAttendanceRepository,
        private readonly classRepo: IClassRepository
    ) { }

    async execute(
        classId: string,
        monitorId: string,
        date: Date,
        students: AttendanceInput[]
    ): Promise<void> {
        const cls = await this.classRepo.findById(classId);
        if (!cls) {
            throw new Error('Class not found');
        }

        if (!cls.isCallAllowedNow(date)) {
            throw new Error('Attendance outside schedule');
        }

        for (const student of students) {
            let record: AttendanceRecord;
            if (student.status === 'present') {
                if (!student.geolocation) throw new Error(`Geolocation required for present student ${student.childId}`);
                record = AttendanceRecord.createPresent(student.childId, classId, monitorId, date, student.geolocation);
            } else {
                record = AttendanceRecord.createAbsent(student.childId, classId, monitorId, date);
            }
            await this.attendanceRepo.save(record);
        }
    }
}
