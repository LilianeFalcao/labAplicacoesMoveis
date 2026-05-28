import { IAccessRequestRepository } from '../../../domain/activity/repositories/IAccessRequestRepository';
import { ClassAccessRequest } from '../../../domain/activity/entities/ClassAccessRequest';
import { IUserRepository } from '../../../domain/identity/repositories/IUserRepository';
import { IPushService } from '../../communication/services/IPushService';

export class RequestTemporaryAccessUseCase {
    constructor(
        private accessRequestRepository: IAccessRequestRepository,
        private userRepository: IUserRepository,
        private pushService: IPushService
    ) { }

    async execute(monitorId: string, classId: string): Promise<void> {
        const request = ClassAccessRequest.create(monitorId, classId);
        await this.accessRequestRepository.save(request);

        try {
            const adminTokens = await this.userRepository.findAdminTokens();
            if (adminTokens.length > 0) {
                await this.pushService.send(
                    adminTokens,
                    'Nova Solicitação de Acesso',
                    `O monitor ${monitorId} solicitou acesso temporário à turma ${classId}.`
                );
            }
        } catch (error) {
            console.error('Failed to notify administrators of access request:', error);
        }
    }
}
