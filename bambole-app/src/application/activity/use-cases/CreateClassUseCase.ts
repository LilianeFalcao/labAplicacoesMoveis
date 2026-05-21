import { IClassRepository } from '@/domain/activity/repositories/IClassRepository';
import { Class, WeeklySchedule, DayOfWeek } from '@/domain/activity/entities/Class';
import { generateUUID } from '@/infrastructure/utils/uuid';

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
            generateUUID(),
            input.name,
            schedule,
            input.description,
            input.ageRange
        );

        await this.classRepo.save(newClass);
    }
}
