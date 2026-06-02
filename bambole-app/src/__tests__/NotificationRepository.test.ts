import { SupabaseNotificationRepository } from '../infrastructure/notification/repositories/SupabaseNotificationRepository';
import { supabase } from '../infrastructure/supabase/client';
import { Notification } from '../domain/notification/entities/Notification';

// Mock Supabase
jest.mock('../infrastructure/supabase/client', () => {
    const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        single: jest.fn(),
        upsert: jest.fn()
    };
    return { supabase: mockSupabase };
});

describe('SupabaseNotificationRepository', () => {
    let repository: SupabaseNotificationRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = SupabaseNotificationRepository.getInstance();
    });

    it('should save a notification successfully', async () => {
        const notification = Notification.create('user-123', 'Test Title', 'Test Message');
        
        const upsertSpy = jest.fn().mockResolvedValue({ error: null });
        jest.spyOn(supabase, 'from').mockReturnValue({
            upsert: upsertSpy
        } as any);

        await repository.save(notification);

        expect(upsertSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                recipient_id: 'user-123',
                title: 'Test Title',
                message: 'Test Message',
                read: false
            })
        );
        expect(notification.id).toBeDefined();
    });

    it('should find notifications by recipient ID sorted by date', async () => {
        const mockData = [
            {
                id: 'notif-1',
                recipient_id: 'user-123',
                title: 'Alert 1',
                message: 'Body 1',
                read: false,
                created_at: new Date().toISOString()
            },
            {
                id: 'notif-2',
                recipient_id: 'user-123',
                title: 'Alert 2',
                message: 'Body 2',
                read: true,
                created_at: new Date().toISOString()
            }
        ];

        jest.spyOn(supabase, 'from').mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockData, error: null })
        } as any);

        const list = await repository.findByRecipientId('user-123');

        expect(list).toHaveLength(2);
        expect(list[0].id).toBe('notif-1');
        expect(list[0].read).toBe(false);
        expect(list[1].id).toBe('notif-2');
        expect(list[1].read).toBe(true);
    });

    it('should count unread notifications correctly', async () => {
        jest.spyOn(supabase, 'from').mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            // Simulate count response
            eqSecondArg: jest.fn().mockResolvedValue({ count: 5, error: null })
        } as any);

        // Mock exact count query chain
        const selectMock = jest.fn().mockReturnThis();
        const eqMock1 = jest.fn().mockReturnThis();
        const eqMock2 = jest.fn().mockResolvedValue({ count: 5, error: null });

        jest.spyOn(supabase, 'from').mockReturnValue({
            select: selectMock
        } as any);
        selectMock.mockReturnValue({ eq: eqMock1 });
        eqMock1.mockReturnValue({ eq: eqMock2 });

        const count = await repository.countUnreadByRecipientId('user-123');

        expect(count).toBe(5);
        expect(selectMock).toHaveBeenCalledWith('*', { count: 'exact', head: true });
        expect(eqMock1).toHaveBeenCalledWith('recipient_id', 'user-123');
        expect(eqMock2).toHaveBeenCalledWith('read', false);
    });

    it('should mark notification as read successfully', async () => {
        const updateMock = jest.fn().mockReturnThis();
        const eqMock = jest.fn().mockResolvedValue({ error: null });

        jest.spyOn(supabase, 'from').mockReturnValue({
            update: updateMock
        } as any);
        updateMock.mockReturnValue({ eq: eqMock });

        await repository.markAsRead('notif-123');

        expect(updateMock).toHaveBeenCalledWith({ read: true });
        expect(eqMock).toHaveBeenCalledWith('id', 'notif-123');
    });
});
