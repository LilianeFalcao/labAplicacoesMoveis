import { IGuardianRepository } from '../../../domain/enrollment/repositories/IGuardianRepository';
import { Guardian } from '../../../domain/enrollment/entities/Guardian';

export class UpdateGuardianConsentUseCase {
    constructor(private guardianRepository: IGuardianRepository) {}

    async execute(userId: string, consent: boolean): Promise<void> {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const guardian = await this.guardianRepository.findByUserId(userId);
        if (!guardian) {
            throw new Error('Guardian profile not found');
        }

        const updatedGuardian = new Guardian(
            guardian.id,
            guardian.userId,
            consent,
            new Date()
        );

        await this.guardianRepository.save(updatedGuardian);
    }
}
