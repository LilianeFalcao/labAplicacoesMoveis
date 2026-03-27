import { Class } from '../entities/Class';

export interface IClassRepository {
    findById(id: string): Promise<Class | null>;
    save(cls: Class): Promise<void>;
}
