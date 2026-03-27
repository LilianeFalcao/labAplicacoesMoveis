import { Announcement } from '../entities/Announcement';

export interface IAnnouncementRepository {
    findById(id: string): Promise<Announcement | null>;
    findByClass(classId: string): Promise<Announcement[]>;
    findAll(): Promise<Announcement[]>;
    save(announcement: Announcement): Promise<void>;
}
