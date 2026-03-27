export type ActivityCategory = 'Esporte' | 'Arte' | 'Música' | 'Brincadeira Livre' | 'Passeio' | 'Outros';
export type Recurrence = 'none' | 'weekly';

export class Schedule {
    constructor(
        public readonly id: string | undefined,
        public readonly classId: string,
        public readonly title: string,
        public readonly description: string | undefined,
        public readonly scheduledAt: Date,
        public readonly category: ActivityCategory,
        public readonly recurrence: Recurrence = 'none'
    ) { }
}
