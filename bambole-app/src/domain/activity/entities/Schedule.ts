export type ActivityCategory = 'Esporte' | 'Arte' | 'Música' | 'Brincadeira Livre' | 'Passeio' | 'Outros';
export type Recurrence = 'none' | 'weekly';

export class Schedule {
    public readonly id: string | undefined;
    public readonly classId: string;
    public readonly title: string;
    public readonly description: string | undefined;
    public readonly scheduledAt: Date;
    public readonly category: ActivityCategory;
    public readonly recurrence: Recurrence;

    constructor(
        id: string | undefined,
        classId: string,
        title: string,
        description: string | undefined,
        scheduledAt: Date,
        category: ActivityCategory,
        recurrence: Recurrence = 'none'
    ) {
        this.id = id;
        this.classId = classId;
        this.title = title;
        this.description = description;
        this.scheduledAt = scheduledAt;
        this.category = category;
        this.recurrence = recurrence;
    }
}
