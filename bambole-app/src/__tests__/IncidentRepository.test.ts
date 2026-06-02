import { SupabaseIncidentRepository } from '../infrastructure/activity/repositories/SupabaseIncidentRepository';
import { Incident } from '../domain/activity/entities/Incident';
import { SqliteStorageService } from '../infrastructure/storage/SqliteStorageService';
import { supabase } from '../infrastructure/supabase/client';

// Mock Supabase client
jest.mock('../infrastructure/supabase/client', () => {
    return {
        supabase: {
            auth: {
                getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'monitor-123' } } } }),
            },
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            insert: jest.fn().mockRejectedValue(new Error('Network disconnected')), // fail to simulate offline
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

describe('SupabaseIncidentRepository Offline Fallback', () => {
    let repository: SupabaseIncidentRepository;
    let mockStorage: any;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new SupabaseIncidentRepository();
        mockStorage = SqliteStorageService.getInstance();
    });

    it('should intercept network failure in save, enqueue REPORT_INCIDENT in SQLite sync_queue', async () => {
        const incident = Incident.create({
            description: 'Incident description',
            isEmergency: false,
            photoUrls: ['file://local/evidence.jpg'],
            classId: 'global',
            monitorId: 'monitor-123',
        });

        await repository.save(incident);

        // Should have pushed a sync queue item in local database
        expect(mockStorage.run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO sync_queue'),
            expect.arrayContaining([
                'REPORT_INCIDENT',
                expect.stringContaining('"description":"Incident description"')
            ])
        );
    });
});
