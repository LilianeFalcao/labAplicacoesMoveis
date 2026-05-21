import { Class } from '../entities/Class';

export interface MonitorClassAssignment {
    classId: string;
    isPrimary: boolean;
}

export interface IClassRepository {
    findById(id: string): Promise<Class | null>;
    findByIds(ids: string[]): Promise<Class[]>;
    findByMonitorId(monitorId: string): Promise<Class[]>;
    findAllWithoutMonitor(): Promise<Class[]>;
    findAll(): Promise<Class[]>;
    save(cls: Class): Promise<void>;
    assignClassesToMonitor(monitorId: string, assignments: MonitorClassAssignment[]): Promise<void>;
}
