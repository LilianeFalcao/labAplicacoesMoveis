import { IAccessRequestRepository } from '../../../domain/activity/repositories/IAccessRequestRepository';
import { ClassAccessRequest } from '../../../domain/activity/entities/ClassAccessRequest';

export class GetPendingAccessRequestsUseCase {
    constructor(private accessRequestRepository: IAccessRequestRepository) { }

    async execute(): Promise<ClassAccessRequest[]> {
        return this.accessRequestRepository.findPending();
    }
}
