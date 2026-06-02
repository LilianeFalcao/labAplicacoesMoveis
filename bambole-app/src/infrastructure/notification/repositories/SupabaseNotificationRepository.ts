import { supabase } from '../../supabase/client';
import { Notification } from '@/domain/notification/entities/Notification';
import { INotificationRepository } from '@/domain/notification/repositories/INotificationRepository';
import { generateUUID } from '@/infrastructure/utils/uuid';

export class SupabaseNotificationRepository implements INotificationRepository {
    private static instance: SupabaseNotificationRepository;

    private constructor() {}

    public static getInstance(): SupabaseNotificationRepository {
        if (!SupabaseNotificationRepository.instance) {
            SupabaseNotificationRepository.instance = new SupabaseNotificationRepository();
        }
        return SupabaseNotificationRepository.instance;
    }

    async save(notification: Notification): Promise<void> {
        const payload = {
            id: notification.id || generateUUID(),
            recipient_id: notification.recipientId,
            title: notification.title,
            message: notification.message,
            read: notification.read,
            created_at: notification.createdAt.toISOString()
        };

        const { error } = await supabase.from('notifications').upsert(payload);
        if (error) throw error;
        
        if (!notification.id) {
            (notification as any).id = payload.id;
        }
    }

    async findByRecipientId(recipientId: string): Promise<Notification[]> {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('recipient_id', recipientId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(item => this.mapToEntity(item));
    }

    async countUnreadByRecipientId(recipientId: string): Promise<number> {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', recipientId)
            .eq('read', false);

        if (error) throw error;
        return count || 0;
    }

    async markAsRead(id: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);

        if (error) throw error;
    }

    subscribe(callback: () => void): () => void {
        const channel = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications'
                },
                () => {
                    callback();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }

    private mapToEntity(data: any): Notification {
        const notification = Notification.create(
            data.recipient_id,
            data.title,
            data.message
        );
        (notification as any).id = data.id;
        (notification as any).createdAt = new Date(data.created_at);
        if (data.read) {
            notification.markAsRead();
        }
        return notification;
    }
}
