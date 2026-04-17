import { IAccessRequestRepository } from '../../../domain/activity/repositories/IAccessRequestRepository';
import { ClassAccessRequest } from '../../../domain/activity/entities/ClassAccessRequest';

export class MockAccessRequestRepository implements IAccessRequestRepository {
    private static instance: MockAccessRequestRepository;
    private requests: ClassAccessRequest[] = [];
    private listeners: (() => void)[] = [];

    private constructor() { }

    public static getInstance(): MockAccessRequestRepository {
        if (!MockAccessRequestRepository.instance) {
            MockAccessRequestRepository.instance = new MockAccessRequestRepository();
        }
        return MockAccessRequestRepository.instance;
    }

    async save(request: ClassAccessRequest): Promise<void> {
        this.requests.push(request);
        this.notifyListeners();
    }

    async update(request: ClassAccessRequest): Promise<void> {
        const index = this.requests.findIndex(r => r.id === request.id);
        if (index >= 0) {
            this.requests[index] = request;
        } else {
            this.requests.push(request);
        }
        this.notifyListeners();
    }

    async findById(id: string): Promise<ClassAccessRequest | null> {
        return this.requests.find(r => r.id === id) || null;
    }

    async findByMonitorId(monitorId: string): Promise<ClassAccessRequest[]> {
        return this.requests.filter(r => r.monitorId === monitorId);
    }

    async findPending(): Promise<ClassAccessRequest[]> {
        return this.requests.filter(r => r.status === 'PENDING');
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

    // Helper for tests
    clear(): void {
        this.requests = [];
        this.listeners = [];
    }
}
