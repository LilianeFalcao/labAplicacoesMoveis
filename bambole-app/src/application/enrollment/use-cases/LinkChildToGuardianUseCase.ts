import { IGuardianRepository } from '../../../domain/enrollment/repositories/IGuardianRepository';
import { IChildRepository } from '../../../domain/enrollment/repositories/IChildRepository';

export class LinkChildToGuardianUseCase {
    constructor(
        private guardianRepository: IGuardianRepository,
        private childRepository: IChildRepository
    ) {}

    async execute(guardianEmail: string, childId: string): Promise<void> {
        const guardian = await this.guardianRepository.findByUserEmail(guardianEmail);
        if (!guardian) {
            throw new Error('Responsável não encontrado com este e-mail.');
        }

        const child = await this.childRepository.findById(childId);
        if (!child) {
            throw new Error('Aluno não encontrado.');
        }

        await this.guardianRepository.linkToChild(guardian.id, child.id);
    }
}
