import { IGuardianRepository } from '@/domain/enrollment/repositories/IGuardianRepository';
import { IChildRepository } from '@/domain/enrollment/repositories/IChildRepository';

export class LinkGuardianToChildUseCase {
    constructor(
        private readonly guardianRepo: IGuardianRepository,
        private readonly childRepo: IChildRepository
    ) { }

    async execute(guardianId: string, childId: string): Promise<void> {
        const guardian = await this.guardianRepo.findById(guardianId);
        if (!guardian) {
            throw new Error('Guardian not found');
        }

        const child = await this.childRepo.findById(childId);
        if (!child) {
            throw new Error('Child not found');
        }

        await this.guardianRepo.linkToChild(guardianId, childId);
    }
}
