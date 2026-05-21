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
        if (this.useMock) {
            const existing = this.activities.filter(a => a.classId === classId);
            if (existing.length > 0) {
                return existing;
            }

            const now = new Date();
            const currentHour = now.getHours();

            const formatTime = (h: number, m: number = 0) => {
                const wrappedH = ((h % 24) + 24) % 24;
                return `${wrappedH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            };

            const generated: ClassActivity[] = [
                {
                    id: `act_${classId}_2`,
                    classId: classId,
                    startTime: formatTime(currentHour - 1),
                    endTime: formatTime(currentHour + 1),
                    title: 'Oficina de Slime Colorido',
                    status: 'ongoing',
                    category: 'activity'
                }
            ];

            this.activities.push(...generated);
            return generated;
        }

        return await this.delegate.findByClass(classId);
    }

    async save(activity: ClassActivity): Promise<void> {
        if (this.useMock) {
            this.activities.push(activity);
            return;
        }
        await this.delegate.save(activity);
    }

    async updateStatus(id: string, status: 'pending' | 'ongoing' | 'completed'): Promise<void> {
        if (this.useMock) {
            const index = this.activities.findIndex(a => a.id === id);
            if (index >= 0) {
                this.activities[index] = { ...this.activities[index], status };
            }
            return;
        }
        await this.delegate.updateStatus(id, status);
    }
}
