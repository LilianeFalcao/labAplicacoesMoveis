import { IClassRepository } from '@/domain/activity/repositories/IClassRepository';
import { Class, WeeklySchedule, DayOfWeek } from '@/domain/activity/entities/Class';

interface CreateClassInput {
    name: string;
    description?: string;
    ageRange?: string;
    days: DayOfWeek[];
    startTime: string;
    endTime: string;
}

export class CreateClassUseCase {
    constructor(private readonly classRepo: IClassRepository) { }

    async execute(input: CreateClassInput): Promise<void> {
        if (!input.name || input.name.trim() === '') {
            throw new Error('Class name is required');
        }

        const schedule = new WeeklySchedule(
            input.days,
            input.startTime,
            input.endTime
        );

        const newClass = new Class(
            crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7), // Fallback if crypto not available in test
            input.name,
            schedule,
            input.description,
            input.ageRange
        );

        await this.classRepo.save(newClass);
    }
}
