import { SupabaseIncidentRepository } from '../infrastructure/activity/repositories/SupabaseIncidentRepository';
import { Incident } from '../domain/activity/entities/Incident';
import { supabase } from '../infrastructure/supabase/client';
import * as FileSystem from 'expo-file-system/legacy';

// Mock SQLite Storage
const mockStorageInstance = {
    run: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue([]),
};
jest.mock('../infrastructure/storage/SqliteStorageService', () => ({
    SqliteStorageService: {
        getInstance: () => mockStorageInstance,
    },
}));

// Mock FileSystem
jest.mock('expo-file-system/legacy', () => ({
    readAsStringAsync: jest.fn().mockResolvedValue('fakeBase64String'),
}));

// Mock Supabase chainable object
const mockQueryObj = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    then: jest.fn(),
};

jest.mock('../infrastructure/supabase/client', () => {
    return {
        supabase: {
            auth: {
                getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'monitor-123' } } } }),
            },
            from: jest.fn().mockImplementation(() => mockQueryObj),
            storage: {
                from: jest.fn().mockReturnValue({
                    upload: jest.fn().mockResolvedValue({ error: null }),
                    getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://supabase.co/incident.jpg' } }),
                }),
            },
        },
    };
});

describe('SupabaseIncidentRepository', () => {
    let repository: SupabaseIncidentRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new SupabaseIncidentRepository();
        mockQueryObj.then.mockImplementation((onFulfilled) => {
            return Promise.resolve({ data: null, error: null }).then(onFulfilled);
        });
    });

    it('should successfully save incident online with images and delete/insert photos in DB', async () => {
        const incident = Incident.create({
            description: 'Incident description',
            isEmergency: false,
            photoUrls: ['file://local/evidence.jpg'],
            classId: 'class-1',
            monitorId: 'monitor-123',
        });

        // 1. mock incidents insert
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ error: null }).then(onFulfilled);
        });
        // 2. mock incident_photos delete
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ error: null }).then(onFulfilled);
        });
        // 3. mock incident_photos insert
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ error: null }).then(onFulfilled);
        });

        await repository.save(incident);

        expect(supabase.from).toHaveBeenCalledWith('incidents');
        expect(supabase.from).toHaveBeenCalledWith('incident_photos');
        expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith('file://local/evidence.jpg', { encoding: 'base64' });
    });

    it('should intercept network failure in save, enqueue REPORT_INCIDENT in SQLite sync_queue', async () => {
        const incident = Incident.create({
            description: 'Incident description',
            isEmergency: false,
            photoUrls: ['file://local/evidence.jpg'],
            classId: 'global',
            monitorId: 'monitor-123',
        });

        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ error: new Error('Network disconnected') }).then(onFulfilled);
        });

        await repository.save(incident);

        // Should have pushed a sync queue item in local database
        expect(mockStorageInstance.run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO sync_queue'),
            expect.arrayContaining([
                'REPORT_INCIDENT',
                expect.stringContaining('"description":"Incident description"')
            ])
        );
    });

    it('should find incident by ID and map its photos', async () => {
        const mockIncidentData = {
            id: 'incident-123',
            description: 'Scrape',
            is_emergency: false,
            class_id: 'class-1',
            child_id: 'child-1',
            created_at: '2026-06-01T12:00:00.000Z',
            monitor_id: 'monitor-123'
        };

        // 1. mock single incident
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: mockIncidentData, error: null }).then(onFulfilled);
        });
        // 2. mock incident photos
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: [{ url: 'https://supabase.co/img.jpg' }], error: null }).then(onFulfilled);
        });

        const incident = await repository.findById('incident-123');

        expect(incident).not.toBeNull();
        expect(incident!.id).toBe('incident-123');
        expect(incident!.description).toBe('Scrape');
        expect(incident!.photoUrls).toEqual(['https://supabase.co/img.jpg']);
    });

    it('should find incidents by class ID', async () => {
        const mockIncidents = [
            { id: 'i-1', description: 'Scrape', is_emergency: false, class_id: 'class-1', child_id: 'child-1', created_at: '2026-06-01', monitor_id: 'm-1' }
        ];

        // 1. mock incidents query
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: mockIncidents, error: null }).then(onFulfilled);
        });
        // 2. mock incident photos query
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: [{ incident_id: 'i-1', url: 'https://img.jpg' }], error: null }).then(onFulfilled);
        });

        const list = await repository.findByClassId('class-1');
        expect(list).toHaveLength(1);
        expect(list[0].id).toBe('i-1');
        expect(list[0].photoUrls).toEqual(['https://img.jpg']);
    });

    it('should fetch all incidents and by monitor id', async () => {
        const mockIncidents = [
            { id: 'i-1', description: 'Scrape', is_emergency: false, class_id: 'class-1', child_id: 'child-1', created_at: '2026-06-01', monitor_id: 'm-1' }
        ];

        // findAll
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: mockIncidents, error: null }).then(onFulfilled);
        });
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: [], error: null }).then(onFulfilled);
        });
        const all = await repository.findAll();
        expect(all).toHaveLength(1);

        // findByMonitorId
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: mockIncidents, error: null }).then(onFulfilled);
        });
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: [], error: null }).then(onFulfilled);
        });
        const byMonitor = await repository.findByMonitorId('m-1');
        expect(byMonitor).toHaveLength(1);
    });
});
