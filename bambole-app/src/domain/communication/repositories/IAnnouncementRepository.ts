import { Announcement } from '../entities/Announcement';

export interface IAnnouncementRepository {
    findRelevantForClasses(classIds: string[]): Promise<Announcement[]>;
    save(announcement: Announcement): Promise<void>;
}
