import { IAttendanceRepository } from '../../../domain/attendance/repositories/IAttendanceRepository';
import { AttendanceRecord } from '../../../domain/attendance/entities/AttendanceRecord';
import { GeolocationProof } from '../../../domain/attendance/value-objects/AttendanceStatus';

export class MockAttendanceRepository implements IAttendanceRepository {
    private static instance: MockAttendanceRepository;
    private records: AttendanceRecord[] = [];
    private listeners: (() => void)[] = [];

    private constructor() {
        // Mock data para testes do dashboard
        const monitorId = 'pedro.monitor@bambole.app';
        const date = new Date();
        const proof: GeolocationProof = { lat: -23.55, lng: -46.63 };

        // Turma 101 - 3 presenças, 1 falta
        this.records.push(AttendanceRecord.createPresent('child-1', '101', monitorId, date, proof));
        this.records.push(AttendanceRecord.createPresent('child-2', '101', monitorId, date, proof));
        this.records.push(AttendanceRecord.createPresent('child-3', '101', monitorId, date, proof));
        this.records.push(AttendanceRecord.createAbsent('child-4', '101', monitorId, date));

        // Turma 102 - 2 presenças, 2 faltas justificadas (totalmente positivo)
        this.records.push(AttendanceRecord.createPresent('child-5', '102', monitorId, date, proof));
        this.records.push(AttendanceRecord.createPresent('child-6', '102', monitorId, date, proof));
        const justified1 = AttendanceRecord.createAbsent('child-7', '102', monitorId, date);
        justified1.justifyRetroactively('Atestado');
        this.records.push(justified1);
        const justified2 = AttendanceRecord.createAbsent('child-8', '102', monitorId, date);
        justified2.justifyRetroactively('Atestado');
        this.records.push(justified2);
    }

    public static getInstance(): MockAttendanceRepository {
        if (!MockAttendanceRepository.instance) {
            MockAttendanceRepository.instance = new MockAttendanceRepository();
        }
        return MockAttendanceRepository.instance;
    }

    async findById(id: string): Promise<AttendanceRecord | null> {
        return this.records.find(r => r.id === id) || null;
    }

    async findByChildAndDate(childId: string, date: string): Promise<AttendanceRecord | null> {
        const d = new Date(date);
        return this.records.find(r => 
            r.childId === childId && 
            r.date.toDateString() === d.toDateString()
        ) || null;
    }

    async save(record: AttendanceRecord): Promise<void> {
        if (!record.id) {
            (record as any).id = Math.random().toString(36).substr(2, 9);
        }
        this.records.push(record);
        this.notifyListeners();
    }

    async findByClassAndDate(classId: string, date: string): Promise<AttendanceRecord[]> {
        const d = new Date(date);
        return this.records.filter(r => 
            r.classId === classId && 
            r.date.toDateString() === d.toDateString()
        );
    }

    async findByClassId(classId: string): Promise<AttendanceRecord[]> {
        return this.records.filter(r => r.classId === classId);
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

    clear(): void {
        this.records = [];
        this.listeners = [];
    }
}
