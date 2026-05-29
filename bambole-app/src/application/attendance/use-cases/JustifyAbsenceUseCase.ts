import { IAttendanceRepository } from '@/domain/attendance/repositories/IAttendanceRepository';
import { IChildRepository } from '@/domain/enrollment/repositories/IChildRepository';
import { AttendanceRecord } from '@/domain/attendance/entities/AttendanceRecord';
import { AttendanceStatus } from '@/domain/attendance/value-objects/AttendanceStatus';

export class JustifyAbsenceUseCase {
    constructor(
        private readonly attendanceRepo: IAttendanceRepository,
        private readonly childRepo: IChildRepository
    ) {}

    async execute(
        childId: string,
        date: Date,
        reason: string,
        isPreJustified: boolean
    ): Promise<void> {
        const child = await this.childRepo.findById(childId);
        if (!child) {
            throw new Error('Child not found');
        }

        const dateString = date.toISOString().split('T')[0];
        
        // Check if an attendance record already exists for this child and date
        let record = await this.attendanceRepo.findByChildAndDate(childId, dateString);

        if (record) {
            // Record exists, justify it
            if (isPreJustified) {
                record.preJustify(reason);
            } else {
                record.justifyRetroactively(reason);
            }
        } else {
            // Create a new record and apply the justification
            const classId = child.classId || '';
            
            // For parent justification, monitorId is set as empty string
            record = new AttendanceRecord(
                undefined,
                childId,
                classId,
                '', // No monitor associated directly with parent action
                date,
                AttendanceStatus.create(isPreJustified ? 'pre_justified' : 'justified'),
                undefined,
                reason,
                new Date()
            );
        }

        await this.attendanceRepo.save(record);
    }
}
