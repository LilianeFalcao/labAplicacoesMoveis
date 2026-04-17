import { IAccessRequestRepository } from '../../../domain/activity/repositories/IAccessRequestRepository';
import { IClassRepository } from '../../../domain/activity/repositories/IClassRepository';

export class ApproveAccessRequestUseCase {
    constructor(
        private accessRequestRepository: IAccessRequestRepository,
        private classRepository: IClassRepository
    ) { }

    async execute(requestId: string): Promise<void> {
        const request = await this.accessRequestRepository.findById(requestId);
        if (!request) {
            throw new Error('Access request not found');
        }

        request.approve();
        await this.accessRequestRepository.update(request);

        // Optionally, we could link the monitor to the class here if the domain requires it
        // For now, the approval status is the source of truth for temporary access.
    }
}
