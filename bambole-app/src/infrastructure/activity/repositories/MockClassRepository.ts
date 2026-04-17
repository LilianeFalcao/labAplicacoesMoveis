import { IClassRepository } from '../../../domain/activity/repositories/IClassRepository';
import { Class, WeeklySchedule } from '../../../domain/activity/entities/Class';

export class MockClassRepository implements IClassRepository {
    private static instance: MockClassRepository;
    private classes: Class[] = [];

    private constructor() {
        // Initial mock data
        this.classes = [
            new Class('101', 'Futebol Juvenil', new WeeklySchedule(['MON', 'WED'], '14:00', '16:00'), 'Treino de futebol para jovens', '10-14 anos'),
            new Class('102', 'Pintura a Óleo', new WeeklySchedule(['TUE', 'THU'], '09:00', '11:00'), 'Aula de pintura', '8-12 anos'),
            new Class('103', 'Dança Criativa', new WeeklySchedule(['FRI'], '15:00', '17:00'), 'Aula de dança', '6-9 anos'),
        ];
    }

    public static getInstance(): MockClassRepository {
        if (!MockClassRepository.instance) {
            MockClassRepository.instance = new MockClassRepository();
        }
        return MockClassRepository.instance;
    }

    async findById(id: string): Promise<Class | null> {
        return this.classes.find(c => c.id === id) || null;
    }

    async findAllWithoutMonitor(): Promise<Class[]> {
        // In this mock, we assume all these classes are currently without an assigned monitor
        // for the purpose of the temporary access request demonstration.
        return this.classes;
    }

    async save(cls: Class): Promise<void> {
        const index = this.classes.findIndex(c => c.id === cls.id);
        if (index >= 0) {
            this.classes[index] = cls;
        } else {
            this.classes.push(cls);
        }
    }

    setClasses(classes: Class[]): void {
        this.classes = classes;
    }
}
