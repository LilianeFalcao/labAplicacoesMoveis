import { OfflineSyncService } from '../infrastructure/offline/OfflineSyncService';
import { SqliteStorageService } from '../infrastructure/storage/SqliteStorageService';
import { supabase } from '../infrastructure/supabase/client';
import * as FileSystem from 'expo-file-system/legacy';
import { NotificationService } from '../infrastructure/notification/services/NotificationService';

// Mock supabase client
jest.mock('../infrastructure/supabase/client', () => {
    const uploadFn = jest.fn().mockResolvedValue({ data: {}, error: null });
    const getPublicUrlFn = jest.fn().mockReturnValue({ data: { publicUrl: 'https://supabase.co/photo.jpg' } });
    return {
        supabase: {
            auth: {
                getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
            },
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            single: jest.fn(),
            upsert: jest.fn().mockResolvedValue({ error: null }),
            update: jest.fn().mockReturnThis(),
            insert: jest.fn().mockResolvedValue({ error: null }),
            storage: {
                from: jest.fn().mockReturnValue({
                    upload: uploadFn,
                    getPublicUrl: getPublicUrlFn,
                }),
            },
        },
    };
});

// Mock FileSystem
jest.mock('expo-file-system/legacy', () => ({
    readAsStringAsync: jest.fn().mockResolvedValue('fakeBase64DataString'),
}));

// Mock SQLite Storage
jest.mock('../infrastructure/storage/SqliteStorageService', () => ({
    SqliteStorageService: {
        getInstance: jest.fn().mockReturnValue({
            run: jest.fn().mockResolvedValue(undefined),
            query: jest.fn().mockResolvedValue([]),
        })
    }
}));

// Mock Notification Service
jest.mock('../infrastructure/notification/services/NotificationService', () => ({
    NotificationService: {
        getInstance: jest.fn().mockReturnValue({
            sendPushNotification: jest.fn().mockResolvedValue(undefined),
        })
    }
}));

// Mock Notification Repository
jest.mock('../infrastructure/notification/repositories/MockNotificationRepository', () => ({
    MockNotificationRepository: {
        getInstance: jest.fn().mockReturnValue({
            save: jest.fn().mockResolvedValue(undefined),
        })
    }
}));

describe('OfflineSyncService', () => {
    let service: OfflineSyncService;
    let mockStorage: any;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new OfflineSyncService();
        mockStorage = SqliteStorageService.getInstance();
    });

    it('should successfully sync a pending POST_PHOTO action from sync_queue to Supabase Storage and DB', async () => {
        const photoPayload = {
            id: 'a1b2c3d4-e5f6-7a8b-9c0d-1234567890ab',
            classId: 'class-A',
            monitorId: 'monitor-99',
            photoUri: 'file://local/path/to/image.jpg',
            caption: 'Brincadeira no parquinho',
            timestamp: '2026-05-28T22:00:00.000Z'
        };

        const mockQueue = [
            {
                id: 42,
                action_type: 'POST_PHOTO',
                payload: JSON.stringify(photoPayload),
                timestamp: Date.now(),
                retry_count: 0,
                status: 'pending'
            }
        ];

        // Mock count before sync having 1 item in queue, 0 legacy items
        mockStorage.query
            .mockResolvedValueOnce([{ count: 1 }]) // pendingQueueBefore
            .mockResolvedValueOnce([{ count: 0 }]) // pendingAttendanceBefore
            .mockResolvedValueOnce([{ count: 0 }]) // pendingActivitiesBefore
            .mockResolvedValueOnce(mockQueue)      // queue retrieval
            .mockResolvedValueOnce([])             // legacy unsynced attendance
            .mockResolvedValueOnce([])             // legacy unsynced activities
            .mockResolvedValueOnce([{ count: 0 }]) // pendingQueueAfter
            .mockResolvedValueOnce([{ count: 0 }]) // pendingAttendanceAfter
            .mockResolvedValueOnce([{ count: 0 }]);// pendingActivitiesAfter

        const insertSpy = jest.spyOn(supabase as any, 'insert').mockResolvedValue({ error: null } as any);

        await service.syncUp();

        // Should read local file
        expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith('file://local/path/to/image.jpg', { encoding: 'base64' });

        // Retrieve the mock upload function from mocked supabase
        const mockUpload = (supabase.storage.from as jest.Mock)().upload;

        // Should upload to bucket 'children-photos'
        expect(mockUpload).toHaveBeenCalledWith(
            expect.stringContaining('activity_'),
            expect.any(ArrayBuffer),
            expect.objectContaining({ contentType: 'image/jpeg' })
        );

        // Should save photo metadata to the database table activity_photos
        expect(supabase.from).toHaveBeenCalledWith('activity_photos');
        expect(insertSpy).toHaveBeenCalledWith(expect.objectContaining({
            id: 'a1b2c3d4-e5f6-7a8b-9c0d-1234567890ab',
            class_id: 'class-A',
            url: 'https://supabase.co/photo.jpg',
            uploaded_by: 'monitor-99',
            caption: 'Brincadeira no parquinho',
        }));

        // Should update local sync_queue status to completed
        expect(mockStorage.run).toHaveBeenCalledWith(
            "UPDATE sync_queue SET status = 'completed' WHERE id = ?",
            [42]
        );

        // Silent sync should not trigger any intrusive push notifications
        const notificationService = NotificationService.getInstance();
        expect(notificationService.sendPushNotification).not.toHaveBeenCalled();
    });
});
