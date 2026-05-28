import { IAgendaRepository, ClassActivity } from '@/domain/activity/repositories/IAgendaRepository';
import { SupabaseAgendaRepository } from './SupabaseAgendaRepository';

export { ClassActivity };

export class MockAgendaRepository implements IAgendaRepository {
    private static instance: MockAgendaRepository;
    private useMock = false;
    private activities: ClassActivity[] = [];
    private delegate = SupabaseAgendaRepository.getInstance();

    private constructor() {}

    public static getInstance(): MockAgendaRepository {
        if (!MockAgendaRepository.instance) {
            MockAgendaRepository.instance = new MockAgendaRepository();
        }
        return MockAgendaRepository.instance;
    }

    /**
     * Toggles whether this repository should use in-memory mock data or persist to the DB.
     * Useful for isolating behaviors during integration testing.
     */
    public setUseMock(value: boolean): void {
        this.useMock = value;
    }

    async findByClass(classId: string): Promise<ClassActivity[]> {
        return await this.delegate.findByClass(classId);
    }

    async save(activity: ClassActivity): Promise<void> {
        await this.delegate.save(activity);
    }

    async updateStatus(id: string, status: 'pending' | 'ongoing' | 'completed'): Promise<void> {
        await this.delegate.updateStatus(id, status);
    }
}
