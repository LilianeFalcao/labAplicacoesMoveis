import { SyncQueueRepository } from '../infrastructure/sync/SyncQueueRepository';
import { SqliteStorageService } from '../infrastructure/storage/SqliteStorageService';

// Mocking the Storage Service
jest.mock('../infrastructure/storage/SqliteStorageService', () => ({
    SqliteStorageService: {
        getInstance: jest.fn().mockReturnValue({
            run: jest.fn().mockResolvedValue(undefined),
            query: jest.fn().mockResolvedValue([]),
        })
    }
}));

describe('SyncQueueRepository', () => {
    let repository: SyncQueueRepository;
    let mockStorage: any;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = SyncQueueRepository.getInstance();
        mockStorage = SqliteStorageService.getInstance();
    });

    it('should push a new action to the queue', async () => {
        const actionType = 'TAKE_ATTENDANCE';
        const payload = { classId: '123', students: ['1', '2'] };

        await repository.push(actionType, payload);

        expect(mockStorage.run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO sync_queue'),
            expect.arrayContaining([actionType, JSON.stringify(payload)])
        );
    });

    it('should retrieve pending actions', async () => {
        const mockRows = [
            { id: 1, action_type: 'TYPE_A', payload: '{}', timestamp: 123, retry_count: 0, status: 'pending' }
        ];
        mockStorage.query.mockResolvedValue(mockRows);

        const actions = await repository.getPendingActions();

        expect(actions).toHaveLength(1);
        expect(actions[0].actionType).toBe('TYPE_A');
        expect(mockStorage.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM sync_queue WHERE status ='));
    });
});
