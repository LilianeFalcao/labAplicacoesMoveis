import { SqliteStorageService } from '../infrastructure/storage/SqliteStorageService';
import * as SQLite from 'expo-sqlite';

// Mocking of expo-sqlite is now handled globally in jest.setup.ts

describe('SqliteStorageService', () => {
    let service: SqliteStorageService;

    beforeEach(() => {
        jest.clearAllMocks();
        SqliteStorageService.resetInstance();
        service = SqliteStorageService.getInstance();
    });

    it('should initialize the database and create tables', async () => {
        await service.init();
        expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('bambole_offline.db');
    });

    it('should execute a query', async () => {
        const sql = 'SELECT * FROM children';
        await service.query(sql);
        // Database is initialized in the first query
        expect(SQLite.openDatabaseAsync).toHaveBeenCalled();
    });
});
