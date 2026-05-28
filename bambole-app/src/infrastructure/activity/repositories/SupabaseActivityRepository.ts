import { supabase } from '@/infrastructure/supabase/client';
import { IActivityRepository } from '@/domain/activity/repositories/IActivityRepository';
import { ActivityPhoto } from '@/domain/activity/entities/ActivityPhoto';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from '@/infrastructure/utils/base64';
import { SyncQueueRepository } from '@/infrastructure/sync/SyncQueueRepository';

const isUUID = (str: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export class SupabaseActivityRepository implements IActivityRepository {
    private static instance: SupabaseActivityRepository;

    constructor() { }

    public static getInstance(): SupabaseActivityRepository {
        if (!SupabaseActivityRepository.instance) {
            SupabaseActivityRepository.instance = new SupabaseActivityRepository();
        }
        return SupabaseActivityRepository.instance;
    }

    async savePhoto(photo: ActivityPhoto): Promise<void> {
        try {
            // 1. Read the local image file in base64
            const base64 = await FileSystem.readAsStringAsync(photo.photoUri, { encoding: 'base64' });
            
            // 2. Generate a unique name for the file in storage
            const fileName = `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
            
            // 3. Upload decoded binary to the public Supabase bucket 'children-photos'
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
            const payload: any = {
                class_id: photo.classId,
                url: publicUrl,
                uploaded_by: photo.monitorId || null,
                caption: photo.caption || null,
                uploaded_at: photo.timestamp.toISOString()
            };

            // If photo has a valid UUID, pass it as id
            if (photo.id && isUUID(photo.id)) {
                payload.id = photo.id;
            }

            const { error: dbError } = await supabase
                .from('activity_photos')
                .insert(payload);

            if (dbError) throw dbError;
        } catch (error) {
            console.warn('SupabaseActivityRepository.savePhoto failed, enqueuing offline:', error);
            try {
                const syncQueue = SyncQueueRepository.getInstance();
                await syncQueue.push('POST_PHOTO', {
                    id: photo.id,
                    classId: photo.classId,
                    monitorId: photo.monitorId,
                    photoUri: photo.photoUri,
                    caption: photo.caption,
                    timestamp: photo.timestamp.toISOString()
                });
                throw new Error('OFFLINE_ENQUEUED');
            } catch (queueError: any) {
                if (queueError.message === 'OFFLINE_ENQUEUED') {
                    throw queueError;
                }
                console.error('Failed to enqueue photo in SQLite queue:', queueError);
                throw error;
            }
        }
    }

    async getFeedByClass(classId: string): Promise<ActivityPhoto[]> {
        if (!classId || classId === 'undefined' || classId === 'null') {
            return [];
        }
        try {
            // Fetch pending photos from local sync queue
            let pendingPhotos: ActivityPhoto[] = [];
            try {
                const pendingActions = await SyncQueueRepository.getInstance().getPendingActions();
                const photoActions = pendingActions.filter(act => act.actionType === 'POST_PHOTO');
                for (const act of photoActions) {
                    const payload = JSON.parse(act.payload);
                    if (payload.classId === classId) {
                        pendingPhotos.push(new ActivityPhoto({
                            id: payload.id || `pending_${Date.now()}`,
                            classId: payload.classId,
                            monitorId: payload.monitorId,
                            photoUri: payload.photoUri,
                            timestamp: new Date(payload.timestamp),
                            caption: payload.caption || undefined,
                            isPending: true
                        }));
                    }
                }
            } catch (e) {
                console.error('Failed to load pending photos from SQLite queue', e);
            }

            const { data, error } = await supabase
                .from('activity_photos')
                .select(`
                    *,
                    users:uploaded_by (
                        full_name,
                        avatar_url
                    ),
                    classes:class_id (
                        name
                    )
                `)
                .eq('class_id', classId)
                .order('uploaded_at', { ascending: false });

            if (error) throw error;

            const remotePhotos = (data || []).map(row => {
                const user = (row as any).users;
                const clazz = (row as any).classes;
                return new ActivityPhoto({
                    id: row.id,
                    classId: row.class_id,
                    monitorId: row.uploaded_by,
                    photoUri: row.url,
                    timestamp: new Date(row.uploaded_at),
                    caption: row.caption || undefined,
                    isPending: false,
                    monitorName: user?.full_name || undefined,
                    monitorAvatar: user?.avatar_url || undefined,
                    className: clazz?.name || undefined,
                    likes: row.likes || [],
                    comments: row.comments || []
                });
            });

            return [...pendingPhotos, ...remotePhotos].sort(
                (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
            );
        } catch (error) {
            console.error('SupabaseActivityRepository.getFeedByClass failed:', error);
            return [];
        }
    }

    async getFeedByMonitor(monitorId: string): Promise<ActivityPhoto[]> {
        if (!monitorId || monitorId === 'undefined' || monitorId === 'null') {
            return [];
        }
        try {
            // Fetch pending photos from local sync queue
            let pendingPhotos: ActivityPhoto[] = [];
            try {
                const pendingActions = await SyncQueueRepository.getInstance().getPendingActions();
                const photoActions = pendingActions.filter(act => act.actionType === 'POST_PHOTO');
                for (const act of photoActions) {
                    const payload = JSON.parse(act.payload);
                    if (payload.monitorId === monitorId) {
                        pendingPhotos.push(new ActivityPhoto({
                            id: payload.id || `pending_${Date.now()}`,
                            classId: payload.classId,
                            monitorId: payload.monitorId,
                            photoUri: payload.photoUri,
                            timestamp: new Date(payload.timestamp),
                            caption: payload.caption || undefined,
                            isPending: true
                        }));
                    }
                }
            } catch (e) {
                console.error('Failed to load pending photos from SQLite queue', e);
            }

            const { data, error } = await supabase
                .from('activity_photos')
                .select(`
                    *,
                    users:uploaded_by (
                        full_name,
                        avatar_url
                    ),
                    classes:class_id (
                        name
                    )
                `)
                .eq('uploaded_by', monitorId)
                .order('uploaded_at', { ascending: false });

            if (error) throw error;

            const remotePhotos = (data || []).map(row => {
                const user = (row as any).users;
                const clazz = (row as any).classes;
                return new ActivityPhoto({
                    id: row.id,
                    classId: row.class_id,
                    monitorId: row.uploaded_by,
                    photoUri: row.url,
                    timestamp: new Date(row.uploaded_at),
                    caption: row.caption || undefined,
                    isPending: false,
                    monitorName: user?.full_name || undefined,
                    monitorAvatar: user?.avatar_url || undefined,
                    className: clazz?.name || undefined,
                    likes: row.likes || [],
                    comments: row.comments || []
                });
            });

            return [...pendingPhotos, ...remotePhotos].sort(
                (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
            );
        } catch (error) {
            console.error('SupabaseActivityRepository.getFeedByMonitor failed:', error);
            return [];
        }
    }

    async toggleLike(photoId: string, userId: string): Promise<string[]> {
        const { data, error } = await supabase
            .from('activity_photos')
            .select('likes')
            .eq('id', photoId)
            .single();

        if (error) throw error;

        let likes: string[] = data.likes || [];
        if (likes.includes(userId)) {
            likes = likes.filter(id => id !== userId);
        } else {
            likes.push(userId);
        }

        const { error: updateError } = await supabase
            .from('activity_photos')
            .update({ likes })
            .eq('id', photoId);

        if (updateError) throw updateError;

        return likes;
    }

    async addComment(photoId: string, comment: any): Promise<any[]> {
        const { data, error } = await supabase
            .from('activity_photos')
            .select('comments')
            .eq('id', photoId)
            .single();

        if (error) throw error;

        const comments: any[] = data.comments || [];
        comments.push(comment);

        const { error: updateError } = await supabase
            .from('activity_photos')
            .update({ comments })
            .eq('id', photoId);

        if (updateError) throw updateError;

        return comments;
    }
}
