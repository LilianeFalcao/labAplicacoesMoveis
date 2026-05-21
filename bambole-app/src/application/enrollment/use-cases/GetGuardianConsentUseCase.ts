import { IGuardianRepository } from '../../../domain/enrollment/repositories/IGuardianRepository';

export class GetGuardianConsentUseCase {
    constructor(private guardianRepository: IGuardianRepository) {}

    async execute(userId: string): Promise<boolean> {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const guardian = await this.guardianRepository.findByUserId(userId);
        return guardian ? guardian.imageConsent : false;
    }
}
