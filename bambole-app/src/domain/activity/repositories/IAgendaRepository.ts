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

export interface IAgendaRepository {
    findByClass(classId: string): Promise<ClassActivity[]>;
    save(activity: ClassActivity): Promise<void>;
    updateStatus(id: string, status: 'pending' | 'ongoing' | 'completed'): Promise<void>;
}
