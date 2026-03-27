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

    async findById(id: string): Promise<Announcement | null> {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return new Announcement(
            data.id,
            data.author_id,
            AnnouncementContent.create(data.content),
            data.audience_type === 'class' ? Audience.forClass(data.class_id!) : Audience.forAll(),
            new Date(data.published_at)
        );
    }

    async findByClass(classId: string): Promise<Announcement[]> {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .or(`audience_type.eq.all,and(audience_type.eq.class,class_id.eq.${classId})`)
            .order('published_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(d => this.findByIdSync(d));
    }

    async findAll(): Promise<Announcement[]> {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('published_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(d => this.findByIdSync(d));
    }

    private findByIdSync(data: any): Announcement {
        return new Announcement(
            data.id,
            data.author_id,
            AnnouncementContent.create(data.content),
            data.audience_type === 'class' ? Audience.forClass(data.class_id!) : Audience.forAll(),
            new Date(data.published_at)
        );
    }
}
