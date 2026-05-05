import { Class } from '../entities/Class';

export interface IClassRepository {
    findById(id: string): Promise<Class | null>;
    findByIds(ids: string[]): Promise<Class[]>;
    findByMonitorId(monitorId: string): Promise<Class[]>;
    findAllWithoutMonitor(): Promise<Class[]>;
    save(cls: Class): Promise<void>;
}
