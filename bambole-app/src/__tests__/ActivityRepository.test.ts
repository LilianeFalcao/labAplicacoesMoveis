import { SupabaseActivityRepository } from '../infrastructure/activity/repositories/SupabaseActivityRepository';
import { SyncQueueRepository } from '../infrastructure/sync/SyncQueueRepository';
import { ActivityPhoto } from '../domain/activity/entities/ActivityPhoto';
import { SqliteStorageService } from '../infrastructure/storage/SqliteStorageService';
import { supabase } from '../infrastructure/supabase/client';

// Mock Supabase client
jest.mock('../infrastructure/supabase/client', () => {
    return {
        supabase: {
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            insert: jest.fn().mockRejectedValue(new Error('Network disconnected')), // default fail to simulate offline
            storage: {
                from: jest.fn().mockReturnValue({
                    upload: jest.fn().mockRejectedValue(new Error('Network disconnected')),
                }),
            },
        },
    };
});

// Mock FileSystem
jest.mock('expo-file-system/legacy', () => ({
    readAsStringAsync: jest.fn().mockResolvedValue('fakeBase64String'),
}));

// Mock SQLite Storage
jest.mock('../infrastructure/storage/SqliteStorageService', () => {
    const mockQuery = jest.fn().mockResolvedValue([]);
    const mockRun = jest.fn().mockResolvedValue(undefined);
    return {
        SqliteStorageService: {
            getInstance: jest.fn().mockReturnValue({
                query: mockQuery,
                run: mockRun,
            }),
        },
    };
});

describe('SupabaseActivityRepository Offline Fallback', () => {
    let repository: SupabaseActivityRepository;
    let mockStorage: any;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = SupabaseActivityRepository.getInstance();
        mockStorage = SqliteStorageService.getInstance();
    });

    it('should intercept network failure in savePhoto, enqueue it in SQLite and throw OFFLINE_ENQUEUED error', async () => {
        const photo = ActivityPhoto.create({
            id: 'photo-1111',
            classId: 'class-X',
            monitorId: 'monitor-77',
            photoUri: 'file://some/image.jpg',
            caption: 'Aula de artes',
        });

        await expect(repository.savePhoto(photo)).rejects.toThrow('OFFLINE_ENQUEUED');

        // Should have pushed a sync queue item in local database
        expect(mockStorage.run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO sync_queue'),
            expect.arrayContaining([
                'POST_PHOTO',
                expect.stringContaining('"classId":"class-X"')
            ])
        );
    });

    it('should query both local queue and remote database in getFeedByClass, prepending pending items', async () => {
        const mockPendingRows = [
            {
                id: 10,
                action_type: 'POST_PHOTO',
                payload: JSON.stringify({
                    id: 'photo-pending-1',
                    classId: 'class-X',
                    monitorId: 'monitor-77',
                    photoUri: 'file://local/pending.jpg',
                    caption: 'Local item enfileirado',
                    timestamp: '2026-05-28T22:10:00.000Z'
                }),
                timestamp: Date.now(),
                retry_count: 0,
                status: 'pending'
            }
        ];

        const mockRemotePhotos = [
            {
                id: 'photo-remote-2',
                class_id: 'class-X',
                uploaded_by: 'monitor-77',
                url: 'https://supabase.co/remote2.jpg',
                caption: 'Foto remota no ar',
                uploaded_at: '2026-05-28T22:00:00.000Z'
            }
        ];

        // First query in getFeedByClass reads getPendingActions from queue
        mockStorage.query.mockResolvedValueOnce(mockPendingRows);

        // Next, mock supabase response
        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockOrder = jest.fn().mockResolvedValue({ data: mockRemotePhotos, error: null });
        
        jest.spyOn(supabase, 'from').mockReturnValue({
            select: mockSelect,
            eq: mockEq,
            order: mockOrder,
        } as any);

        const feed = await repository.getFeedByClass('class-X');

        expect(feed).toHaveLength(2);
        // Combined list should have pending photo first (sorted desc by timestamp)
        expect(feed[0].id).toBe('photo-pending-1');
        expect(feed[0].isPending).toBe(true);
        expect(feed[0].photoUri).toBe('file://local/pending.jpg');

        expect(feed[1].id).toBe('photo-remote-2');
        expect(feed[1].isPending).toBe(false);
        expect(feed[1].photoUri).toBe('https://supabase.co/remote2.jpg');
    });
});

describe('SupabaseActivityRepository Likes and Comments', () => {
    let repository: SupabaseActivityRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = SupabaseActivityRepository.getInstance();
    });

    it('should successfully toggle (add) a like to a photo', async () => {
        const photoId = 'photo-123';
        const userId = 'user-abc';
        
        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({ data: { likes: [] }, error: null });
        const mockUpdate = jest.fn().mockReturnThis();
        const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });

        jest.spyOn(supabase, 'from').mockImplementation((table: string) => {
            if (table === 'activity_photos') {
                return {
                    select: mockSelect,
                    eq: mockEq,
                    single: mockSingle,
                    update: mockUpdate,
                } as any;
            }
            return {} as any;
        });
        
        mockUpdate.mockReturnValue({
            eq: mockUpdateEq
        });

        const result = await repository.toggleLike(photoId, userId);

        expect(mockSelect).toHaveBeenCalledWith('likes');
        expect(mockEq).toHaveBeenCalledWith('id', photoId);
        expect(mockSingle).toHaveBeenCalled();
        expect(mockUpdate).toHaveBeenCalledWith({ likes: [userId] });
        expect(mockUpdateEq).toHaveBeenCalledWith('id', photoId);
        expect(result).toEqual([userId]);
    });

    it('should successfully toggle (remove) a like from a photo', async () => {
        const photoId = 'photo-123';
        const userId = 'user-abc';
        
        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({ data: { likes: [userId, 'user-def'] }, error: null });
        const mockUpdate = jest.fn().mockReturnThis();
        const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });

        jest.spyOn(supabase, 'from').mockImplementation((table: string) => {
            if (table === 'activity_photos') {
                return {
                    select: mockSelect,
                    eq: mockEq,
                    single: mockSingle,
                    update: mockUpdate,
                } as any;
            }
            return {} as any;
        });
        
        mockUpdate.mockReturnValue({
            eq: mockUpdateEq
        });

        const result = await repository.toggleLike(photoId, userId);

        expect(result).toEqual(['user-def']);
        expect(mockUpdate).toHaveBeenCalledWith({ likes: ['user-def'] });
    });

    it('should successfully add a comment to a photo', async () => {
        const photoId = 'photo-123';
        const comment = {
            id: 'comment-1',
            userId: 'user-abc',
            userName: 'Juan Carlos',
            text: 'Muito bom!',
            createdAt: new Date().toISOString()
        };
        
        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({ data: { comments: [] }, error: null });
        const mockUpdate = jest.fn().mockReturnThis();
        const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });

        jest.spyOn(supabase, 'from').mockImplementation((table: string) => {
            if (table === 'activity_photos') {
                return {
                    select: mockSelect,
                    eq: mockEq,
                    single: mockSingle,
                    update: mockUpdate,
                } as any;
            }
            return {} as any;
        });
        
        mockUpdate.mockReturnValue({
            eq: mockUpdateEq
        });

        const result = await repository.addComment(photoId, comment);

        expect(mockSelect).toHaveBeenCalledWith('comments');
        expect(mockEq).toHaveBeenCalledWith('id', photoId);
        expect(mockSingle).toHaveBeenCalled();
        expect(mockUpdate).toHaveBeenCalledWith({ comments: [comment] });
        expect(mockUpdateEq).toHaveBeenCalledWith('id', photoId);
        expect(result).toEqual([comment]);
    });

    it('should successfully save a photo online', async () => {
        const photo = ActivityPhoto.create({
            id: 'a1b2c3d4-e5f6-7a8b-9c0d-1234567890ab', // valid hex UUID
            classId: 'class-X',
            monitorId: 'monitor-77',
            photoUri: 'file://some/image.jpg',
            caption: 'Aula de futebol',
        });

        const mockInsert = jest.fn().mockResolvedValue({ error: null });
        const mockUpload = jest.fn().mockResolvedValue({ error: null });
        const mockGetPublicUrl = jest.fn().mockReturnValue({ data: { publicUrl: 'https://supabase.co/uploaded_photo.jpg' } });

        jest.spyOn(supabase, 'from').mockImplementation((table: string) => {
            if (table === 'activity_photos') {
                return { insert: mockInsert } as any;
            }
            return {} as any;
        });

        jest.spyOn(supabase.storage, 'from').mockImplementation(() => {
            return {
                upload: mockUpload,
                getPublicUrl: mockGetPublicUrl,
            } as any;
        });

        await repository.savePhoto(photo);

        expect(mockUpload).toHaveBeenCalled();
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            id: 'a1b2c3d4-e5f6-7a8b-9c0d-1234567890ab',
            class_id: 'class-X',
            url: 'https://supabase.co/uploaded_photo.jpg',
            uploaded_by: 'monitor-77',
            caption: 'Aula de futebol'
        }));
    });

    it('should query feed by monitor id', async () => {
        const mockRemotePhotos = [
            {
                id: 'photo-remote-2',
                class_id: 'class-X',
                uploaded_by: 'monitor-77',
                url: 'https://supabase.co/remote2.jpg',
                caption: 'Foto remota no ar',
                uploaded_at: '2026-05-28T22:00:00.000Z'
            }
        ];

        const mockStorageInstance = SqliteStorageService.getInstance();
        mockStorageInstance.query = jest.fn().mockResolvedValueOnce([]); // no pending

        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockOrder = jest.fn().mockResolvedValue({ data: mockRemotePhotos, error: null });

        jest.spyOn(supabase, 'from').mockImplementation((table: string) => {
            if (table === 'activity_photos') {
                return {
                    select: mockSelect,
                    eq: mockEq,
                    order: mockOrder,
                } as any;
            }
            return {} as any;
        });

        const feed = await repository.getFeedByMonitor('monitor-77');

        expect(feed).toHaveLength(1);
        expect(feed[0].id).toBe('photo-remote-2');
        expect(mockEq).toHaveBeenCalledWith('uploaded_by', 'monitor-77');
    });
});
