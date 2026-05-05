import { AttendanceRecord } from '../entities/AttendanceRecord';

export interface IAttendanceRepository {
    findById(id: string): Promise<AttendanceRecord | null>;
    findByChildAndDate(childId: string, date: string): Promise<AttendanceRecord | null>;
    save(record: AttendanceRecord): Promise<void>;
    findByClassAndDate(classId: string, date: string): Promise<AttendanceRecord[]>;
    findByClassId(classId: string): Promise<AttendanceRecord[]>;
}
