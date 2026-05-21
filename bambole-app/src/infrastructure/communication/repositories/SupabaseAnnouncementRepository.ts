import { supabase } from '../../supabase/client';
import { IAnnouncementRepository } from '@/domain/communication/repositories/IAnnouncementRepository';
import { Announcement } from '@/domain/communication/entities/Announcement';
import { AnnouncementContent, Audience } from '@/domain/communication/value-objects/CommunicationVOs';
import { SqliteStorageService } from '../../storage/SqliteStorageService';
import { generateUUID } from '@/infrastructure/utils/uuid';

export class SupabaseAnnouncementRepository implements IAnnouncementRepository {
    private storage = SqliteStorageService.getInstance();

    async save(ann: Announcement): Promise<void> {
        const { error } = await supabase
            .from('announcements')
            .upsert({
                id: ann.id || generateUUID(),
                author_id: ann.authorId,
                content: ann.content.value,
                audience_type: ann.audience.type,
                class_id: ann.audience.classId,
                published_at: ann.publishedAt.toISOString()
            });

        if (error) throw error;

        // Update cache
        await this.storage.run(
            'INSERT OR REPLACE INTO announcements (id, content, published_at, audience_type) VALUES (?, ?, ?, ?)',
            [ann.id, ann.content.value, ann.publishedAt.toISOString(), ann.audience.type]
        );
    }

    async findRelevantForClasses(classIds: string[]): Promise<Announcement[]> {
        let query = supabase
            .from('announcements')
            .select('*')
            .order('published_at', { ascending: false });

        if (classIds.length > 0) {
            const classIdsFilter = classIds.map(id => `'${id}'`).join(',');
            query = query.or(`audience_type.eq.all,and(audience_type.eq.class,class_id.in.(${classIdsFilter}))`);
        } else {
            query = query.eq('audience_type', 'all');
        }

        try {
            const { data, error } = await query;
            
            if (error) throw error;

            const results = (data || []).map(d => this.mapToDomain(d));

            // Populate cache
            for (const ann of results) {
                await this.storage.run(
                    'INSERT OR REPLACE INTO announcements (id, content, published_at, audience_type) VALUES (?, ?, ?, ?)',
                    [ann.id, ann.content.value, ann.publishedAt.toISOString(), ann.audience.type]
                );
            }

            return results;
        } catch (error) {
            console.warn('Announcement fetch failed, using local cache', error);
            const local = await this.storage.query<any>(
                'SELECT * FROM announcements ORDER BY published_at DESC'
            );
            return local.map(item => this.mapFromCache(item));
        }
    }

    private mapToDomain(data: any): Announcement {
        return new Announcement(
            data.id,
            data.author_id,
            AnnouncementContent.create(data.content),
            data.audience_type === 'class' ? Audience.forClass(data.class_id!) : Audience.forAll(),
            new Date(data.published_at)
        );
    }

    private mapFromCache(data: any): Announcement {
        return new Announcement(
            data.id,
            '',
            AnnouncementContent.create(data.content),
            data.audience_type === 'class' ? Audience.forClass('') : Audience.forAll(), // Simplified
            new Date(data.published_at)
        );
    }
}
