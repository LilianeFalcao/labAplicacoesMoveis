import { SqliteStorageService } from '../storage/SqliteStorageService';

export interface SyncAction {
    id?: number;
    actionType: string;
    payload: string;
    timestamp: number;
    retryCount: number;
    status: 'pending' | 'syncing' | 'error' | 'synced';
}

export class SyncQueueRepository {
    private static instance: SyncQueueRepository;
    private storage: SqliteStorageService;

    private constructor() {
        this.storage = SqliteStorageService.getInstance();
    }

    public static getInstance(): SyncQueueRepository {
        if (!SyncQueueRepository.instance) {
            SyncQueueRepository.instance = new SyncQueueRepository();
        }
        return SyncQueueRepository.instance;
    }

    public async push(actionType: string, payload: any): Promise<void> {
        const sql = `
            INSERT INTO sync_queue (action_type, payload, timestamp, retry_count, status)
            VALUES (?, ?, ?, ?, ?)
        `;
        const params = [
            actionType,
            JSON.stringify(payload),
            Date.now(),
            0,
            'pending'
        ];
        await this.storage.run(sql, params);
    }

    public async getPendingActions(): Promise<SyncAction[]> {
        const sql = `SELECT * FROM sync_queue WHERE status = 'pending' OR status = 'error' ORDER BY timestamp ASC`;
        const rows = await this.storage.query<any>(sql);
        return rows.map(row => ({
            id: row.id,
            actionType: row.action_type,
            payload: row.payload,
            timestamp: row.timestamp,
            retryCount: row.retry_count,
            status: row.status as any
        }));
    }

    public async updateStatus(id: number, status: SyncAction['status'], retryCount?: number): Promise<void> {
        let sql = `UPDATE sync_queue SET status = ?`;
        const params: any[] = [status];
        
        if (retryCount !== undefined) {
            sql += `, retry_count = ?`;
            params.push(retryCount);
        }
        
        sql += ` WHERE id = ?`;
        params.push(id);
        
        await this.storage.run(sql, params);
    }

    public async remove(id: number): Promise<void> {
        const sql = `DELETE FROM sync_queue WHERE id = ?`;
        await this.storage.run(sql, [id]);
    }

    public async countPending(): Promise<number> {
        const sql = `SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending' AND retry_count < 3`;
        const rows = await this.storage.query<{count: number}>(sql);
        return rows[0]?.count || 0;
    }
}
