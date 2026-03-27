import { supabase } from '../supabase/client';
import { getDatabase } from './SQLiteDatabase';

export class OfflineSyncService {
    private db = getDatabase();

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

        // Filter by unique ID to avoid primary key violations
        const uniqueChildren = Array.from(
            new Map(flattenedChildren.map(c => [c.id, c])).values()
        );

        // Update SQLite cache
        this.db.withTransactionSync(() => {
            this.db.runSync('DELETE FROM cache_children');
            for (const child of uniqueChildren) {
                this.db.runSync(
                    'INSERT INTO cache_children (id, name, class_id) VALUES (?, ?, ?)',
                    [child.id, child.name, child.class_id]
                );
            }
        });

        // 2. Fetch recent announcements (last 7 days)
        const { data: announcements, error: annError } = await supabase
            .from('announcements')
            .select('*')
            .order('published_at', { ascending: false })
            .limit(20);

        if (annError) throw annError;

        this.db.withTransactionSync(() => {
            this.db.runSync('DELETE FROM cache_announcements');
            for (const ann of announcements) {
                this.db.runSync(
                    'INSERT INTO cache_announcements (id, content, published_at, audience_type) VALUES (?, ?, ?, ?)',
                    [ann.id, ann.content, ann.published_at, ann.audience_type]
                );
            }
        });
    }

    async syncUp(): Promise<void> {
        // Implement logic to upload local attendance marks if any unsynced
        // (Crucial for monitors)
        const unsynced = this.db.getAllSync<any>(
            'SELECT * FROM cache_attendance WHERE synced = 0'
        );

        for (const record of unsynced) {
            const { error } = await supabase
                .from('attendance_records')
                .insert({
                    id: record.id,
                    child_id: record.child_id,
                    date: record.date,
                    status: record.status
                });

            if (!error) {
                this.db.runSync(
                    'UPDATE cache_attendance SET synced = 1 WHERE id = ?',
                    [record.id]
                );
            }
        }
    }

    getCachedChildren() {
        return this.db.getAllSync('SELECT * FROM cache_children');
    }

    getCachedAnnouncements() {
        return this.db.getAllSync('SELECT * FROM cache_announcements');
    }
}
