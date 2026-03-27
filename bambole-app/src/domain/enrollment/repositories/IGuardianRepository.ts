import { Guardian } from '../entities/Guardian';

export interface IGuardianRepository {
    findById(id: string): Promise<Guardian | null>;
    findByUserId(userId: string): Promise<Guardian | null>;
    save(guardian: Guardian): Promise<void>;
    linkToChild(guardianId: string, childId: string): Promise<void>;
}
