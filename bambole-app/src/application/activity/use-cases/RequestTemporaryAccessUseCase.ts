import { IAccessRequestRepository } from '../../../domain/activity/repositories/IAccessRequestRepository';
import { ClassAccessRequest } from '../../../domain/activity/entities/ClassAccessRequest';

export class RequestTemporaryAccessUseCase {
    constructor(private accessRequestRepository: IAccessRequestRepository) { }

    async execute(monitorId: string, classId: string): Promise<void> {
        const request = ClassAccessRequest.create(monitorId, classId);
        await this.accessRequestRepository.save(request);
    }
}
