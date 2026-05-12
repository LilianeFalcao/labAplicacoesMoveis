import { ClassAccessRequest } from '../entities/ClassAccessRequest';

export interface IAccessRequestRepository {
    findPending(): Promise<ClassAccessRequest[]>;
    findById(id: string): Promise<ClassAccessRequest | null>;
    save(request: ClassAccessRequest): Promise<void>;
    update(request: ClassAccessRequest): Promise<void>;
    subscribe(callback: () => void): () => void;
}
