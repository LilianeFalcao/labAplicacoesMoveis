import { Child } from '../entities/Child';

export interface IChildRepository {
    findById(id: string): Promise<Child | null>;
    findByClass(classId: string): Promise<Child[]>;
    save(child: Child): Promise<void>;
}
