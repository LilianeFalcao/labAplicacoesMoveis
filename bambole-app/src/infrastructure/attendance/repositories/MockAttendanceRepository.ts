import { IAttendanceRepository } from '../../../domain/attendance/repositories/IAttendanceRepository';
import { AttendanceRecord } from '../../../domain/attendance/entities/AttendanceRecord';
import { GeolocationProof } from '../../../domain/attendance/value-objects/AttendanceStatus';
import { SqliteStorageService } from '../../storage/SqliteStorageService';
import { SyncQueueRepository } from '../../sync/SyncQueueRepository';

export class MockAttendanceRepository implements IAttendanceRepository {
    private static instance: MockAttendanceRepository;
    private storage: SqliteStorageService;
    private syncQueue: SyncQueueRepository;
    private listeners: (() => void)[] = [];

    private constructor() {
        this.storage = SqliteStorageService.getInstance();
        this.syncQueue = SyncQueueRepository.getInstance();
    }

    public static getInstance(): MockAttendanceRepository {
        if (!MockAttendanceRepository.instance) {
            MockAttendanceRepository.instance = new MockAttendanceRepository();
        }
        return MockAttendanceRepository.instance;
    }

    async findById(id: string): Promise<AttendanceRecord | null> {
        const rows = await this.storage.query<any>('SELECT * FROM attendance WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        return this.mapRowToRecord(rows[0]);
    }

    async findByChildAndDate(childId: string, date: string): Promise<AttendanceRecord | null> {
        // Simplified for mock: childId is part of the student_ids blob in our attendance table
        // In a real DB we'd have an attendance_items table. 
        // For the mock, we'll return null or the first matching record.
        return null; 
    }

    async save(record: AttendanceRecord): Promise<void> {
        if (!record.id) {
            (record as any).id = Math.random().toString(36).substr(2, 9);
        }

        const sql = `INSERT INTO attendance (id, class_id, date, student_ids, status, activity_id) VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [
            record.id,
            record.classId,
            record.date.toISOString(),
            JSON.stringify([record.childId]), // Simplified
            'pending',
            record.activityId || null
        ];

        await this.storage.run(sql, params);
        
        // Push to Sync Queue
        await this.syncQueue.push('SAVE_ATTENDANCE', {
            id: record.id,
            classId: record.classId,
            childId: record.childId,
            status: record.status,
            date: record.date.toISOString(),
            activityId: record.activityId
        });

        this.notifyListeners();
    }

    async findByClassAndDate(classId: string, date: string): Promise<AttendanceRecord[]> {
        const d = new Date(date).toISOString().split('T')[0];
        const sql = `SELECT * FROM attendance WHERE class_id = ? AND date LIKE ?`;
        const rows = await this.storage.query<any>(sql, [classId, `${d}%`]);
        return rows.map(row => this.mapRowToRecord(row));
    }

    async findByClassId(classId: string): Promise<AttendanceRecord[]> {
        const sql = `SELECT * FROM attendance WHERE class_id = ?`;
        const rows = await this.storage.query<any>(sql, [classId]);
        return rows.map(row => this.mapRowToRecord(row));
    }

    subscribe(callback: () => void): () => void {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notifyListeners(): void {
        this.listeners.forEach(callback => callback());
    }

    private mapRowToRecord(row: any): AttendanceRecord {
        // Simplified mapping for the mock
        return AttendanceRecord.createPresent(
            JSON.parse(row.student_ids)[0],
            row.class_id,
            'monitor-id',
            new Date(row.date),
            { lat: 0, lng: 0 },
            row.activity_id || undefined
        );
    }

    async clear(): Promise<void> {
        await this.storage.run('DELETE FROM attendance');
        this.notifyListeners();
    }
}
