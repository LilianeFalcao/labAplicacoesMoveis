import { Notification } from '../../../domain/notification/entities/Notification';
import { INotificationRepository } from '../../../domain/notification/repositories/INotificationRepository';

export class MockNotificationRepository implements INotificationRepository {
    private notifications: Notification[] = [];
    private static instance: MockNotificationRepository;
    private listeners: (() => void)[] = [];

    private constructor() {}

    static getInstance(): MockNotificationRepository {
        if (!MockNotificationRepository.instance) {
            MockNotificationRepository.instance = new MockNotificationRepository();
        }
        return MockNotificationRepository.instance;
    }

    async save(notification: Notification): Promise<void> {
        // If it doesn't have an ID, it's new
        if (!notification.id) {
            (notification as any).id = Math.random().toString(36).substr(2, 9);
            this.notifications.push(notification);
        } else {
            const index = this.notifications.findIndex(n => n.id === notification.id);
            if (index !== -1) {
                this.notifications[index] = notification;
            }
        }
        this.notifyListeners();
    }

    async findByRecipientId(recipientId: string): Promise<Notification[]> {
        return this.notifications
            .filter(n => n.recipientId === recipientId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async countUnreadByRecipientId(recipientId: string): Promise<number> {
        return this.notifications.filter(n => n.recipientId === recipientId && !n.read).length;
    }

    async markAsRead(id: string): Promise<void> {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.markAsRead();
            this.notifyListeners();
        }
    }

    subscribe(listener: () => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener());
    }
}
