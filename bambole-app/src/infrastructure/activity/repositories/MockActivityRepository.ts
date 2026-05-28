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

    async toggleLike(photoId: string, userId: string): Promise<string[]> {
        const photoIndex = this.photos.findIndex(p => p.id === photoId);
        if (photoIndex === -1) return [];

        const photo = this.photos[photoIndex];
        let likes = [...photo.likes];
        if (likes.includes(userId)) {
            likes = likes.filter(id => id !== userId);
        } else {
            likes.push(userId);
        }

        this.photos[photoIndex] = ActivityPhoto.create({
            id: photo.id,
            classId: photo.classId,
            monitorId: photo.monitorId,
            photoUri: photo.photoUri,
            timestamp: photo.timestamp,
            caption: photo.caption,
            isPending: photo.isPending,
            monitorName: photo.monitorName,
            monitorAvatar: photo.monitorAvatar,
            className: photo.className,
            likes,
            comments: photo.comments
        });

        return likes;
    }

    async addComment(photoId: string, comment: any): Promise<any[]> {
        const photoIndex = this.photos.findIndex(p => p.id === photoId);
        if (photoIndex === -1) return [];

        const photo = this.photos[photoIndex];
        const comments = [...photo.comments, comment];

        this.photos[photoIndex] = ActivityPhoto.create({
            id: photo.id,
            classId: photo.classId,
            monitorId: photo.monitorId,
            photoUri: photo.photoUri,
            timestamp: photo.timestamp,
            caption: photo.caption,
            isPending: photo.isPending,
            monitorName: photo.monitorName,
            monitorAvatar: photo.monitorAvatar,
            className: photo.className,
            likes: photo.likes,
            comments
        });

        return comments;
    }
}
