import { supabase } from '../../supabase/client';
import { IAnnouncementRepository } from '@/domain/communication/repositories/IAnnouncementRepository';
import { Announcement } from '@/domain/communication/entities/Announcement';
import { AnnouncementContent, Audience } from '@/domain/communication/value-objects/CommunicationVOs';

export class SupabaseAnnouncementRepository implements IAnnouncementRepository {
    async save(ann: Announcement): Promise<void> {
        const { error } = await supabase
            .from('announcements')
            .upsert({
                id: ann.id || crypto.randomUUID(),
                author_id: ann.authorId,
                content: ann.content.value,
                audience_type: ann.audience.type,
                class_id: ann.audience.classId,
                published_at: ann.publishedAt.toISOString()
            });

        if (error) throw error;
    }

    async findRelevantForClasses(classIds: string[]): Promise<Announcement[]> {
        // Build query: audience_type = 'all' OR (audience_type = 'class' AND class_id IN (...classIds))
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

        const { data, error } = await query;

        if (error) throw error;
        return (data || []).map(d => this.mapToDomain(d));
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
}
