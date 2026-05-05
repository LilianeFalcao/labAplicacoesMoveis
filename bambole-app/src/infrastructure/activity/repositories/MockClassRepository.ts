import { IClassRepository } from '../../../domain/activity/repositories/IClassRepository';
import { Class, WeeklySchedule } from '../../../domain/activity/entities/Class';

export class MockClassRepository implements IClassRepository {
    private static instance: MockClassRepository;
    private classes: Class[] = [];

    private constructor() {
        // Initial mock data
        const allDays: any[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
        const alwaysOpen = new WeeklySchedule(allDays, '00:00', '23:59');

        this.classes = [
            new Class('101', 'Futebol Juvenil', alwaysOpen, 'Treino de futebol para jovens', '10-14 anos'),
            new Class('102', 'Pintura a Óleo', alwaysOpen, 'Aula de pintura', '8-12 anos'),
            new Class('103', 'Dança Criativa', alwaysOpen, 'Aula de dança', '6-9 anos'),
            new Class('104', 'Robótica Básica', alwaysOpen, 'Introdução à robótica', '10-14 anos', 'pedro.monitor@bambole.app'),
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

    async findByIds(ids: string[]): Promise<Class[]> {
        return this.classes.filter(c => ids.includes(c.id));
    }

    async findByMonitorId(monitorId: string): Promise<Class[]> {
        return this.classes.filter(c => c.monitorId === monitorId);
    }

    async findAllWithoutMonitor(): Promise<Class[]> {
        // In this mock, classes without monitorId are considered available
        return this.classes.filter(c => !c.monitorId);
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
