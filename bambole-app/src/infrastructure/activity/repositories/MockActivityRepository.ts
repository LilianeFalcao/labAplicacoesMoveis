import { ActivityPhoto } from "../../../domain/activity/entities/ActivityPhoto";
import { IActivityRepository } from "../../../domain/activity/repositories/IActivityRepository";

export class MockActivityRepository implements IActivityRepository {
    private static instance: MockActivityRepository;
    private photos: ActivityPhoto[] = [];

    private constructor() { }

    public static getInstance(): MockActivityRepository {
        if (!MockActivityRepository.instance) {
            MockActivityRepository.instance = new MockActivityRepository();
        }
        return MockActivityRepository.instance;
    }

    async savePhoto(photo: ActivityPhoto): Promise<void> {
        this.photos.push(photo);
    }

    async getFeedByClass(classId: string): Promise<ActivityPhoto[]> {
        return this.photos.filter((photo) => photo.classId === classId);
    }

    async getFeedByMonitor(monitorId: string): Promise<ActivityPhoto[]> {
        return this.photos.filter((photo) => photo.monitorId === monitorId);
    }

    // Helper for testing/mocking initial state
    setPhotos(photos: ActivityPhoto[]) {
        this.photos = photos;
    }
}
