import * as SQLite from 'expo-sqlite';

export class SqliteStorageService {
    private static instance: SqliteStorageService;
    private db: SQLite.SQLiteDatabase | null = null;
    private initPromise: Promise<void> | null = null;
    private queryQueue: Promise<any> = Promise.resolve();

    private constructor() {}

    public static getInstance(): SqliteStorageService {
        const globalAny = global as any;
        if (!globalAny.__sqliteStorageServiceInstance) {
            globalAny.__sqliteStorageServiceInstance = new SqliteStorageService();
        }
        return globalAny.__sqliteStorageServiceInstance;
    }

    /**
     * Resets the singleton instance. Used primarily for testing.
     */
    public static resetInstance(): void {
        const globalAny = global as any;
        globalAny.__sqliteStorageServiceInstance = undefined;
    }

    private async executeExclusive<T>(operation: () => Promise<T>): Promise<T> {
        const nextInQueue = this.queryQueue.then(async () => {
            return await operation();
        });
        this.queryQueue = nextInQueue.catch(() => {});
        return await nextInQueue;
    }

    public async init(): Promise<void> {
        if (this.db) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            try {
                this.db = await SQLite.openDatabaseAsync('bambole_offline.db');
                
                // Create tables if they don't exist
                await this.db.execAsync(`
                    CREATE TABLE IF NOT EXISTS children (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        class_id TEXT,
                        age_group TEXT,
                        medical_alerts TEXT,
                        photo_uri TEXT
                    );

                    CREATE TABLE IF NOT EXISTS attendance (
                        id TEXT PRIMARY KEY,
                        child_id TEXT NOT NULL,
                        class_id TEXT NOT NULL,
                        date TEXT NOT NULL,
                        status TEXT DEFAULT 'present',
                        activity_id TEXT,
                        synced INTEGER DEFAULT 1
                    );

                    CREATE TABLE IF NOT EXISTS announcements (
                        id TEXT PRIMARY KEY,
                        content TEXT,
                        published_at TEXT,
                        audience_type TEXT,
                        class_id TEXT
                    );

                    CREATE TABLE IF NOT EXISTS sync_queue (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        action_type TEXT NOT NULL,
                        payload TEXT NOT NULL,
                        timestamp INTEGER NOT NULL,
                        retry_count INTEGER DEFAULT 0,
                        status TEXT DEFAULT 'pending'
                    );

                    CREATE TABLE IF NOT EXISTS class_activities (
                        id TEXT PRIMARY KEY,
                        class_id TEXT NOT NULL,
                        start_time TEXT NOT NULL,
                        end_time TEXT NOT NULL,
                        title TEXT NOT NULL,
                        description TEXT,
                        status TEXT DEFAULT 'pending',
                        category TEXT DEFAULT 'activity',
                        synced INTEGER DEFAULT 1
                    );
                `);

                // Migration for older schema versions (dynamically add missing columns)
                try {
                    await this.db.execAsync('ALTER TABLE children ADD COLUMN class_id TEXT;');
                } catch (e) {
                    // Ignore if column already exists
                }
                try {
                    await this.db.execAsync('ALTER TABLE children ADD COLUMN photo_uri TEXT;');
                } catch (e) {
                    // Ignore if column already exists
                }
                try {
                    await this.db.execAsync('ALTER TABLE attendance ADD COLUMN activity_id TEXT;');
                } catch (e) {
                    // Ignore if column already exists
                }
                try {
                    await this.db.execAsync('ALTER TABLE attendance ADD COLUMN child_id TEXT;');
                } catch (e) {
                    // Ignore if column already exists
                }
                try {
                    await this.db.execAsync('ALTER TABLE attendance ADD COLUMN synced INTEGER DEFAULT 1;');
                } catch (e) {
                    // Ignore if column already exists
                }
                try {
                    await this.db.execAsync('ALTER TABLE announcements ADD COLUMN class_id TEXT;');
                } catch (e) {
                    // Ignore if column already exists
                }

                // Migration: ensure class_activities table exists for devices with older DB
                try {
                    await this.db.execAsync(`
                        CREATE TABLE IF NOT EXISTS class_activities (
                            id TEXT PRIMARY KEY,
                            class_id TEXT NOT NULL,
                            start_time TEXT NOT NULL,
                            end_time TEXT NOT NULL,
                            title TEXT NOT NULL,
                            description TEXT,
                            status TEXT DEFAULT 'pending',
                            category TEXT DEFAULT 'activity',
                            synced INTEGER DEFAULT 1
                        );
                    `);
                } catch (e) {
                    // Ignore if table already exists
                }

                // Migration: legacy attendance schema used student_ids column
                try {
                    await this.db.execAsync('ALTER TABLE attendance ADD COLUMN student_ids TEXT;');
                } catch (e) {
                    // Ignore if column already exists
                }


                console.log('Offline database initialized successfully');
            } catch (error) {
                console.error('Failed to initialize offline database', error);
                this.initPromise = null; // Reset so that initialization can be retried if it failed
                throw error;
            }
        })();

        return this.initPromise;
    }

    public async query<T>(sql: string, params: any[] = []): Promise<T[]> {
        return this.executeExclusive(async () => {
            if (!this.db) await this.init();
            const normalizedParams = params.map(p => p === undefined ? null : p);
            return await this.db!.getAllAsync<T>(sql, ...normalizedParams);
        });
    }

    public async run(sql: string, params: any[] = []): Promise<void> {
        return this.executeExclusive(async () => {
            if (!this.db) await this.init();
            const normalizedParams = params.map(p => p === undefined ? null : p);
            await this.db!.runAsync(sql, ...normalizedParams);
        });
    }

    public async clearAll(): Promise<void> {
        return this.executeExclusive(async () => {
            if (!this.db) await this.init();
            await this.db!.execAsync(`
                DELETE FROM children;
                DELETE FROM attendance;
                DELETE FROM announcements;
                DELETE FROM class_activities;
                DELETE FROM sync_queue;
            `);
        });
    }
}
