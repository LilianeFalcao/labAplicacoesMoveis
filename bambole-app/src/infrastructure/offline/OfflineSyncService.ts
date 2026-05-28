import { supabase } from '../supabase/client';
import { SqliteStorageService } from '../storage/SqliteStorageService';
import { MockNotificationRepository } from '../notification/repositories/MockNotificationRepository';
import { Notification } from '../../domain/notification/entities/Notification';
import { NotificationService } from '../notification/services/NotificationService';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from '../utils/base64';

const isUUID = (str: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

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
                [child.id, child.name, child.class_id ? child.class_id.replace(/'/g, '') : null]
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
        // Query pending counts before syncing
        const pendingQueueBefore = await this.storage.query<any>(
            "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending' AND retry_count < 3"
        );
        const pendingAttendanceBefore = await this.storage.query<any>(
            "SELECT COUNT(*) as count FROM attendance WHERE synced = 0"
        );
        const pendingActivitiesBefore = await this.storage.query<any>(
            "SELECT COUNT(*) as count FROM class_activities WHERE synced = 0"
        );

        const totalPendingBefore = (pendingQueueBefore[0]?.count || 0) + 
                                   (pendingAttendanceBefore[0]?.count || 0) + 
                                   (pendingActivitiesBefore[0]?.count || 0);

        // Process sync_queue sequentially
        const queue = await this.storage.query<any>(
            "SELECT * FROM sync_queue WHERE status = 'pending' AND retry_count < 3 ORDER BY timestamp ASC"
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
                } else if (item.action_type === 'ADD_ACTIVITY') {
                    const { error } = await supabase
                        .from('class_activities')
                        .upsert(payload);
                    
                    if (!error) success = true;
                } else if (item.action_type === 'UPDATE_ACTIVITY_STATUS') {
                    const { error } = await supabase
                        .from('class_activities')
                        .update({ status: payload.status })
                        .eq('id', payload.id);
                    
                    if (!error) success = true;
                } else if (item.action_type === 'POST_PHOTO') {
                    // 1. Read local file in base64
                    const base64 = await FileSystem.readAsStringAsync(payload.photoUri, { encoding: 'base64' });

                    // 2. Generate unique name in storage
                    const fileName = `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;

                    // 3. Upload decoded binary to the public bucket 'children-photos'
                    const { error: uploadError } = await supabase.storage
                        .from('children-photos')
                        .upload(fileName, decode(base64), {
                            contentType: 'image/jpeg',
                            upsert: true
                        });

                    if (uploadError) throw uploadError;

                    // 4. Retrieve public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('children-photos')
                        .getPublicUrl(fileName);

                    // 5. Save the row in the activity_photos table
                    const dbPayload: any = {
                        class_id: payload.classId,
                        url: publicUrl,
                        uploaded_by: payload.monitorId || null,
                        caption: payload.caption || null,
                        uploaded_at: payload.timestamp || new Date().toISOString()
                    };

                    if (payload.id && isUUID(payload.id)) {
                        dbPayload.id = payload.id;
                    }

                    const { error: dbError } = await supabase
                        .from('activity_photos')
                        .insert(dbPayload);

                    if (dbError) throw dbError;
                    success = true;
                }

                if (success) {
                    await this.storage.run(
                        "UPDATE sync_queue SET status = 'completed' WHERE id = ?",
                        [item.id]
                    );

                    // Mark local cached activity as synced = 1
                    if (item.action_type === 'ADD_ACTIVITY' || item.action_type === 'UPDATE_ACTIVITY_STATUS') {
                        await this.storage.run(
                            'UPDATE class_activities SET synced = 1 WHERE id = ?',
                            [payload.id]
                        );
                    }
                } else {
                    await this.storage.run(
                        "UPDATE sync_queue SET status = 'failed', retry_count = retry_count + 1 WHERE id = ?",
                        [item.id]
                    );
                }
            } catch (error) {
                console.error(`Failed to sync item ${item.id}`, error);
                await this.storage.run(
                    "UPDATE sync_queue SET status = 'failed', retry_count = retry_count + 1 WHERE id = ?",
                    [item.id]
                );
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

        // Also sync unsynced class_activities if any
        const unsyncedActivities = await this.storage.query<any>(
            'SELECT * FROM class_activities WHERE synced = 0'
        );

        for (const activity of unsyncedActivities) {
            const { error } = await supabase
                .from('class_activities')
                .upsert({
                    id: activity.id,
                    class_id: activity.class_id,
                    start_time: activity.start_time,
                    end_time: activity.end_time,
                    title: activity.title,
                    description: activity.description,
                    status: activity.status,
                    category: activity.category
                });

            if (!error) {
                await this.storage.run(
                    'UPDATE class_activities SET synced = 1 WHERE id = ?',
                    [activity.id]
                );
            }
        }

        // Query pending counts after syncing
        const pendingQueueAfter = await this.storage.query<any>(
            "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending' AND retry_count < 3"
        );
        const pendingAttendanceAfter = await this.storage.query<any>(
            "SELECT COUNT(*) as count FROM attendance WHERE synced = 0"
        );
        const pendingActivitiesAfter = await this.storage.query<any>(
            "SELECT COUNT(*) as count FROM class_activities WHERE synced = 0"
        );

        const totalPendingAfter = (pendingQueueAfter[0]?.count || 0) + 
                                  (pendingAttendanceAfter[0]?.count || 0) + 
                                  (pendingActivitiesAfter[0]?.count || 0);

        // Silent background execution completed without spawning noisy notifications or popups.
    }

    async getCachedChildren() {
        return await this.storage.query('SELECT * FROM children');
    }

    async getCachedAnnouncements() {
        return await this.storage.query('SELECT * FROM announcements ORDER BY published_at DESC');
    }
}
