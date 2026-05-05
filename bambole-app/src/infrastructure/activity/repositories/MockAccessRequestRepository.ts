import { IAccessRequestRepository } from '../../../domain/activity/repositories/IAccessRequestRepository';
import { ClassAccessRequest } from '../../../domain/activity/entities/ClassAccessRequest';

export class MockAccessRequestRepository implements IAccessRequestRepository {
    private static instance: MockAccessRequestRepository;
    private requests: ClassAccessRequest[] = [];
    private listeners: (() => void)[] = [];

    private constructor() {
        // Populando dados iniciais para facilitar o teste do fluxo de notificações
        // Essas solicitações estarão pendentes para aprovação do Administrador
        const req1 = ClassAccessRequest.create('pedro.monitor@bambole.app', '101'); // Futebol
        (req1 as any).id = 'req-1';
        const req2 = ClassAccessRequest.create('pedro.monitor@bambole.app', '102'); // Pintura a Óleo
        (req2 as any).id = 'req-2';
        
        // Simular um atraso na criação para ficar com datas diferentes
        this.requests = [req1, req2];
    }

    public static getInstance(): MockAccessRequestRepository {
        if (!MockAccessRequestRepository.instance) {
            MockAccessRequestRepository.instance = new MockAccessRequestRepository();
        }
        return MockAccessRequestRepository.instance;
    }

    async save(request: ClassAccessRequest): Promise<void> {
        if (!request.id) {
            (request as any).id = Math.random().toString(36).substr(2, 9);
        }
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
