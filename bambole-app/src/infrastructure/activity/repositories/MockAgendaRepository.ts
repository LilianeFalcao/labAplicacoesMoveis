export interface ClassActivity {
    id: string;
    classId: string;
    startTime: string;
    endTime: string;
    title: string;
    description?: string;
    status: 'pending' | 'ongoing' | 'completed';
    category: 'activity' | 'break' | 'meal';
}

export class MockAgendaRepository {
    private static instance: MockAgendaRepository;
    private activities: ClassActivity[] = [];

    private constructor() {
        this.activities = [
            // Class 101 - Today
            {
                id: 'a1',
                classId: '101',
                startTime: '08:00',
                endTime: '09:00',
                title: 'Recepção e Jogos Livres',
                status: 'completed',
                category: 'activity'
            },
            {
                id: 'a2',
                classId: '101',
                startTime: '09:00',
                endTime: '10:00',
                title: 'Oficina de Slime Colorido',
                status: 'ongoing',
                category: 'activity'
            },
            {
                id: 'a3',
                classId: '101',
                startTime: '10:00',
                endTime: '10:30',
                title: 'Lanche da Manhã',
                status: 'pending',
                category: 'meal'
            },
            {
                id: 'a4',
                classId: '101',
                startTime: '10:30',
                endTime: '12:00',
                title: 'Caça ao Tesouro no Pátio',
                status: 'pending',
                category: 'activity'
            },
            {
                id: 'a5',
                classId: '101',
                startTime: '12:00',
                endTime: '13:00',
                title: 'Almoço e Descanso',
                status: 'pending',
                category: 'meal'
            },
        ];
    }

    public static getInstance(): MockAgendaRepository {
        if (!MockAgendaRepository.instance) {
            MockAgendaRepository.instance = new MockAgendaRepository();
        }
        return MockAgendaRepository.instance;
    }

    async findByClass(classId: string): Promise<ClassActivity[]> {
        return this.activities.filter(a => a.classId === classId);
    }

    async updateStatus(id: string, status: 'pending' | 'ongoing' | 'completed'): Promise<void> {
        const index = this.activities.findIndex(a => a.id === id);
        if (index >= 0) {
            this.activities[index] = { ...this.activities[index], status };
        }
    }
}
