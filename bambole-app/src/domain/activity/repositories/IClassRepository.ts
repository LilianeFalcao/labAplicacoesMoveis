import { Class } from '../entities/Class';

export interface IClassRepository {
    findById(id: string): Promise<Class | null>;
    findAllWithoutMonitor(): Promise<Class[]>;
    save(cls: Class): Promise<void>;
}
