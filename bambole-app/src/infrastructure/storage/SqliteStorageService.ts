import * as SQLite from 'expo-sqlite';

export class SqliteStorageService {
    private static instance: SqliteStorageService;
    private db: SQLite.SQLiteDatabase | null = null;

    private constructor() {}

    public static getInstance(): SqliteStorageService {
        if (!SqliteStorageService.instance) {
            SqliteStorageService.instance = new SqliteStorageService();
        }
        return SqliteStorageService.instance;
    }

    /**
     * Resets the singleton instance. Used primarily for testing.
     */
    public static resetInstance(): void {
        SqliteStorageService.instance = undefined as any;
    }

    public async init(): Promise<void> {
        if (this.db) return;

        try {
            this.db = await SQLite.openDatabaseAsync('bambole_offline.db');
            
            // Create tables if they don't exist
            await this.db.execAsync(`
                CREATE TABLE IF NOT EXISTS children (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    age_group TEXT,
                    medical_alerts TEXT,
                    photo_uri TEXT
                );

                CREATE TABLE IF NOT EXISTS attendance (
                    id TEXT PRIMARY KEY,
                    class_id TEXT NOT NULL,
                    date TEXT NOT NULL,
                    student_ids TEXT NOT NULL,
                    status TEXT DEFAULT 'pending'
                );

                CREATE TABLE IF NOT EXISTS sync_queue (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    action_type TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    timestamp INTEGER NOT NULL,
                    retry_count INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'pending'
                );
            `);
            console.log('Offline database initialized successfully');
        } catch (error) {
            console.error('Failed to initialize offline database', error);
            throw error;
        }
    }

    public async query<T>(sql: string, params: any[] = []): Promise<T[]> {
        if (!this.db) await this.init();
        return await this.db!.getAllAsync<T>(sql, params);
    }

    public async run(sql: string, params: any[] = []): Promise<void> {
        if (!this.db) await this.init();
        await this.db!.runAsync(sql, params);
    }

    public async clearAll(): Promise<void> {
        if (!this.db) await this.init();
        await this.db!.execAsync(`
            DELETE FROM children;
            DELETE FROM attendance;
            DELETE FROM sync_queue;
        `);
    }
}
