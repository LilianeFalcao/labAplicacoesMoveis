import { ActivityPhoto } from "../entities/ActivityPhoto";

export interface IActivityRepository {
    savePhoto(photo: ActivityPhoto): Promise<void>;
    getFeedByClass(classId: string): Promise<ActivityPhoto[]>;
    getFeedByMonitor(monitorId: string): Promise<ActivityPhoto[]>;
    toggleLike(photoId: string, userId: string): Promise<string[]>;
    addComment(photoId: string, comment: { id: string; userId: string; userName: string; text: string; createdAt: string }): Promise<any[]>;
}
