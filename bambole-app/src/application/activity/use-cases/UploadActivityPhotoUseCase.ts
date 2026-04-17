import { ActivityPhoto } from "../../../domain/activity/entities/ActivityPhoto";
import { IActivityRepository } from "../../../domain/activity/repositories/IActivityRepository";

interface UploadActivityPhotoRequest {
    classId: string;
    photoUri: string;
    caption?: string;
}

export class UploadActivityPhotoUseCase {
    constructor(private activityRepository: IActivityRepository) { }

    async execute(request: UploadActivityPhotoRequest): Promise<ActivityPhoto> {
        const photo = ActivityPhoto.create({
            classId: request.classId,
            photoUri: request.photoUri,
            caption: request.caption,
        });

        await this.activityRepository.savePhoto(photo);
        return photo;
    }
}
