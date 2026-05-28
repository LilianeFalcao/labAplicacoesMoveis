import { supabase } from '../../supabase/client';
import { IAgendaRepository, ClassActivity } from '@/domain/activity/repositories/IAgendaRepository';
import { SqliteStorageService } from '../../storage/SqliteStorageService';

const isUUID = (str: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export class SupabaseAgendaRepository implements IAgendaRepository {
    private static instance: SupabaseAgendaRepository;
    private storage = SqliteStorageService.getInstance();

    constructor() {}

    public static getInstance(): SupabaseAgendaRepository {
        if (!SupabaseAgendaRepository.instance) {
            SupabaseAgendaRepository.instance = new SupabaseAgendaRepository();
        }
        return SupabaseAgendaRepository.instance;
    }

    async findByClass(classId: string): Promise<ClassActivity[]> {
        if (!classId || classId === 'undefined' || classId === 'null') {
            return [];
        }
        try {
            // 1. Try fetching online from Supabase first
            const { data: onlineRows, error } = await supabase
                .from('class_activities')
                .select('*')
                .eq('class_id', classId)
                .order('start_time', { ascending: true });

            if (!error && onlineRows) {
                // 2. Clear old synced local cache records for this class
                await this.storage.run(
                    'DELETE FROM class_activities WHERE class_id = ? AND synced = 1',
                    [classId]
                );

                // 3. Populate local SQLite cache with online results
                for (const row of onlineRows) {
                    await this.storage.run(
                        'INSERT OR REPLACE INTO class_activities (id, class_id, start_time, end_time, title, description, status, category, synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
                        [row.id, row.class_id, row.start_time, row.end_time, row.title, row.description || null, row.status, row.category]
                    );
                }
            } else if (error) {
                console.warn('Supabase findByClass error:', error);
            }
        } catch (err) {
            console.warn('Failed to fetch from Supabase agenda, falling back to SQLite cache', err);
        }

        // 4. Return consolidated cache rows (both synced and unsynced)
        try {
            const localRows = await this.storage.query<any>(
                'SELECT * FROM class_activities WHERE class_id = ? ORDER BY start_time ASC',
                [classId]
            );

            if (localRows && localRows.length > 0) {
                return localRows.map(row => this.mapFromCache(row));
            }
        } catch (localErr) {
            console.error('Failed to query local class_activities cache:', localErr);
        }

        return [];
    }

    async save(activity: ClassActivity): Promise<void> {
        if (!isUUID(activity.id)) {
            await this.storage.run(
                'INSERT OR REPLACE INTO class_activities (id, class_id, start_time, end_time, title, description, status, category, synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
                [activity.id, activity.classId, activity.startTime, activity.endTime, activity.title, activity.description || null, activity.status, activity.category]
            );
            return;
        }

        const payload = {
            id: activity.id,
            class_id: activity.classId,
            start_time: activity.startTime,
            end_time: activity.endTime,
            title: activity.title,
            description: activity.description || null,
            status: activity.status,
            category: activity.category
        };

        try {
            // 1. Try online save first
            const { error } = await supabase.from('class_activities').upsert(payload);
            if (error) throw error;

            // 2. On success, cache locally as fully synced
            await this.storage.run(
                'INSERT OR REPLACE INTO class_activities (id, class_id, start_time, end_time, title, description, status, category, synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
                [payload.id, payload.class_id, payload.start_time, payload.end_time, payload.title, payload.description, payload.status, payload.category]
            );
        } catch (error) {
            console.warn('Online activity save failed, queuing offline sync', error);

            // 3. Save operation in sync_queue for background upload
            await this.storage.run(
                "INSERT INTO sync_queue (action_type, payload, timestamp, status) VALUES (?, ?, ?, 'pending')",
                ['ADD_ACTIVITY', JSON.stringify(payload), Date.now()]
            );

            // 4. Update local SQLite cache as unsynced
            await this.storage.run(
                'INSERT OR REPLACE INTO class_activities (id, class_id, start_time, end_time, title, description, status, category, synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)',
                [payload.id, payload.class_id, payload.start_time, payload.end_time, payload.title, payload.description, payload.status, payload.category]
            );
        }
    }

    async updateStatus(id: string, status: 'pending' | 'ongoing' | 'completed'): Promise<void> {
        if (!isUUID(id)) {
            await this.storage.run(
                'UPDATE class_activities SET status = ?, synced = 1 WHERE id = ?',
                [status, id]
            );
            return;
        }

        try {
            // 1. Try online update first
            const { error } = await supabase
                .from('class_activities')
                .update({ status })
                .eq('id', id);
            
            if (error) throw error;

            // 2. On success, update local cache as fully synced
            await this.storage.run(
                'UPDATE class_activities SET status = ?, synced = 1 WHERE id = ?',
                [status, id]
            );
        } catch (error) {
            console.warn('Online status update failed, queuing offline sync', error);

            const payload = { id, status };

            // 3. Queue status update to sync back later
            await this.storage.run(
                "INSERT INTO sync_queue (action_type, payload, timestamp, status) VALUES (?, ?, ?, 'pending')",
                ['UPDATE_ACTIVITY_STATUS', JSON.stringify(payload), Date.now()]
            );

            // 4. Save to local cache as unsynced
            await this.storage.run(
                'UPDATE class_activities SET status = ?, synced = 0 WHERE id = ?',
                [status, id]
            );
        }
    }

    private mapFromCache(row: any): ClassActivity {
        return {
            id: row.id,
            classId: row.class_id,
            startTime: row.start_time,
            endTime: row.end_time,
            title: row.title,
            description: row.description || undefined,
            status: row.status as any,
            category: row.category as any
        };
    }
}
