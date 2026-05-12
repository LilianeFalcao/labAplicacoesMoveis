import { supabase } from '@/infrastructure/supabase/client';
import { Child } from '@/domain/enrollment/entities/Child';
import { ChildName } from '@/domain/enrollment/value-objects/ChildName';
import { IChildRepository } from '@/domain/enrollment/repositories/IChildRepository';

export class SupabaseChildRepository implements IChildRepository {
    async findById(id: string): Promise<Child | null> {
        const { data, error } = await supabase
            .from('children')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return new Child(
            data.id,
            ChildName.create(data.name),
            data.class_id,
            data.photo_url
        );
    }

    async findByClass(classId: string): Promise<Child[]> {
        const { data, error } = await supabase
            .from('children')
            .select('*')
            .eq('class_id', classId);

        if (error || !data) return [];

        return data.map(item => new Child(
            item.id,
            ChildName.create(item.name),
            item.class_id,
            item.photo_url
        ));
    }

    async findByGuardianId(guardianId: string): Promise<Child[]> {
        const { data, error } = await supabase
            .from('children')
            .select(`
                *,
                guardian_children!inner(guardian_id)
            `)
            .eq('guardian_children.guardian_id', guardianId);

        if (error || !data) return [];

        return data.map(item => new Child(
            item.id,
            ChildName.create(item.name),
            item.class_id,
            item.photo_url
        ));
    }

    async findAll(): Promise<Child[]> {
        const { data, error } = await supabase
            .from('children')
            .select('*')
            .order('name', { ascending: true });

        if (error || !data) return [];

        return data.map(item => new Child(
            item.id,
            ChildName.create(item.name),
            item.class_id,
            item.photo_url
        ));
    }

    async save(child: Child): Promise<void> {
        const { error } = await supabase.from('children').upsert({
            id: child.id,
            name: child.name.value,
            class_id: child.classId,
            photo_url: child.photoUrl
        });

        if (error) throw new Error(`Error saving child: ${error.message}`);
    }
}
