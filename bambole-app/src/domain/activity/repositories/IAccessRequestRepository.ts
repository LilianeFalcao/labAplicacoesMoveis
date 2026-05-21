import { ClassAccessRequest } from '../entities/ClassAccessRequest';

export interface IAccessRequestRepository {
    findPending(): Promise<ClassAccessRequest[]>;
    findById(id: string): Promise<ClassAccessRequest | null>;
    findByMonitorId(monitorId: string): Promise<ClassAccessRequest[]>;
    save(request: ClassAccessRequest): Promise<void>;
    update(request: ClassAccessRequest): Promise<void>;
    subscribe(callback: () => void): () => void;
}
