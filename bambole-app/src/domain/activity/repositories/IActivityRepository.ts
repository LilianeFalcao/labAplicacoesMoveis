import { ActivityPhoto } from "../entities/ActivityPhoto";

export interface IActivityRepository {
    savePhoto(photo: ActivityPhoto): Promise<void>;
    getFeedByClass(classId: string): Promise<ActivityPhoto[]>;
}
