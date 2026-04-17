import { ClassAccessRequest } from '../entities/ClassAccessRequest';

export interface IAccessRequestRepository {
    save(request: ClassAccessRequest): Promise<void>;
    update(request: ClassAccessRequest): Promise<void>;
    findById(id: string): Promise<ClassAccessRequest | null>;
    findByMonitorId(monitorId: string): Promise<ClassAccessRequest[]>;
    findPending(): Promise<ClassAccessRequest[]>;
    subscribe(callback: () => void): () => void;
}
