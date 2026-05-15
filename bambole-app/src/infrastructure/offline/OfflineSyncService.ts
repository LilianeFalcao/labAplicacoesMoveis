import { supabase } from '../supabase/client';
import { SqliteStorageService } from '../storage/SqliteStorageService';

export class OfflineSyncService {
    private storage = SqliteStorageService.getInstance();

    async syncDown(parentUserId: string): Promise<void> {
        // 1. Fetch children related to parent
        const { data: children, error: childrenError } = await supabase
            .from('users')
            .select(`
                guardians!inner (
                    guardian_children!inner (
                        children!inner (
                            id, name, class_id
                        )
                    )
                )
            `)
            .eq('id', parentUserId)
            .single();

        if (childrenError) throw childrenError;

        const flattenedChildren: any[] = (children as any).guardians.flatMap((g: any) =>
            g.guardian_children.flatMap((gc: any) => Array.isArray(gc.children) ? gc.children : [gc.children])
        );

        const uniqueChildren = Array.from(
            new Map(flattenedChildren.map(c => [c.id, c])).values()
        );

        // Update SQLite cache
        await this.storage.run('DELETE FROM children');
        for (const child of uniqueChildren) {
            await this.storage.run(
                'INSERT INTO children (id, name, class_id) VALUES (?, ?, ?)',
                [child.id, child.name, child.class_id]
            );
        }

        // 2. Fetch recent announcements (last 7 days)
        const { data: announcements, error: annError } = await supabase
            .from('announcements')
            .select('*')
            .order('published_at', { ascending: false })
            .limit(20);

        if (annError) throw annError;

        await this.storage.run('DELETE FROM announcements');
        for (const ann of announcements) {
            await this.storage.run(
                'INSERT INTO announcements (id, content, published_at, audience_type) VALUES (?, ?, ?, ?)',
                [ann.id, ann.content, ann.published_at, ann.audience_type]
            );
        }
    }

    async syncUp(): Promise<void> {
        // Process sync_queue sequentially
        const queue = await this.storage.query<any>(
            "SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY timestamp ASC"
        );

        for (const item of queue) {
            try {
                const payload = JSON.parse(item.payload);
                let success = false;

                if (item.action_type === 'MARK_ATTENDANCE') {
                    const { error } = await supabase
                        .from('attendance_records')
                        .upsert(payload);
                    
                    if (!error) success = true;
                }

                if (success) {
                    await this.storage.run(
                        "UPDATE sync_queue SET status = 'completed' WHERE id = ?",
                        [item.id]
                    );
                } else {
                    await this.storage.run(
                        "UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?",
                        [item.id]
                    );
                }
            } catch (error) {
                console.error(`Failed to sync item ${item.id}`, error);
            }
        }

        // Also sync legacy cache_attendance if any (optional cleanup)
        const unsyncedAttendance = await this.storage.query<any>(
            'SELECT * FROM attendance WHERE synced = 0'
        );

        for (const record of unsyncedAttendance) {
            const { error } = await supabase
                .from('attendance_records')
                .upsert({
                    id: record.id,
                    child_id: record.child_id,
                    class_id: record.class_id,
                    date: record.date,
                    status: record.status
                });

            if (!error) {
                await this.storage.run(
                    'UPDATE attendance SET synced = 1 WHERE id = ?',
                    [record.id]
                );
            }
        }
    }

    async getCachedChildren() {
        return await this.storage.query('SELECT * FROM children');
    }

    async getCachedAnnouncements() {
        return await this.storage.query('SELECT * FROM announcements ORDER BY published_at DESC');
    }
}
