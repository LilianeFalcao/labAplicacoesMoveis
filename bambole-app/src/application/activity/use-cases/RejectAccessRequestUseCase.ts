import { IAccessRequestRepository } from '../../../domain/activity/repositories/IAccessRequestRepository';
import { IClassRepository } from '../../../domain/activity/repositories/IClassRepository';
import { INotificationRepository } from '../../../domain/notification/repositories/INotificationRepository';
import { Notification } from '../../../domain/notification/entities/Notification';
import { NotificationService } from '../../../infrastructure/notification/services/NotificationService';

export class RejectAccessRequestUseCase {
    constructor(
        private accessRequestRepository: IAccessRequestRepository,
        private classRepository: IClassRepository,
        private notificationRepository: INotificationRepository,
        private notificationService: NotificationService
    ) { }

    async execute(requestId: string): Promise<void> {
        const request = await this.accessRequestRepository.findById(requestId);
        if (!request) {
            throw new Error('Access request not found');
        }

        const cls = await this.classRepository.findById(request.classId);
        const className = cls ? cls.name : 'Desconhecida';

        request.reject();
        await this.accessRequestRepository.update(request);

        // Send Notification
        const title = 'Acesso Negado';
        const message = `Sua solicitação de acesso temporário à turma ${className} foi rejeitada.`;

        const notification = Notification.create(request.monitorId, title, message);
        await this.notificationRepository.save(notification);
        await this.notificationService.sendPushNotification(title, message, { requestId });
    }
}
