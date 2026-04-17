import { ActivityPhoto } from "../../../domain/activity/entities/ActivityPhoto";
import { IActivityRepository } from "../../../domain/activity/repositories/IActivityRepository";

interface GetActivityFeedRequest {
    classIds: string[];
}

export class GetActivityFeedUseCase {
    constructor(private activityRepository: IActivityRepository) { }

    async execute(request: GetActivityFeedRequest): Promise<ActivityPhoto[]> {
        const allPhotos: ActivityPhoto[] = [];

        for (const classId of request.classIds) {
            const classPhotos = await this.activityRepository.getFeedByClass(classId);
            allPhotos.push(...classPhotos);
        }

        // Sort by timestamp descending
        return allPhotos.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
}
