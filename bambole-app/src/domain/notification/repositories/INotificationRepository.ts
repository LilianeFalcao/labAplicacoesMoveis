import { Notification } from '../entities/Notification';

export interface INotificationRepository {
    save(notification: Notification): Promise<void>;
    findByRecipientId(recipientId: string): Promise<Notification[]>;
    countUnreadByRecipientId(recipientId: string): Promise<number>;
    markAsRead(id: string): Promise<void>;
}
