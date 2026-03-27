import { Schedule } from '../entities/Schedule';

export interface IScheduleRepository {
    findById(id: string): Promise<Schedule | null>;
    findByClass(classId: string): Promise<Schedule[]>;
    save(schedule: Schedule): Promise<void>;
}
