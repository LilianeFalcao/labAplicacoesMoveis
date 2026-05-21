import { supabase } from '@/infrastructure/supabase/client';
import { Child } from '@/domain/enrollment/entities/Child';
import { ChildName } from '@/domain/enrollment/value-objects/ChildName';
import { IChildRepository } from '@/domain/enrollment/repositories/IChildRepository';
import { SqliteStorageService } from '../../storage/SqliteStorageService';

export class SupabaseChildRepository implements IChildRepository {
    private storage = SqliteStorageService.getInstance();

    async findById(id: string): Promise<Child | null> {
        // Try local cache first
        const local = await this.storage.query<any>('SELECT * FROM children WHERE id = ?', [id]);
        if (local.length > 0) return this.mapFromCache(local[0]);

        const { data, error } = await supabase
            .from('children')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        const child = new Child(
            data.id,
            ChildName.create(data.name),
            data.birth_date ? new Date(data.birth_date) : undefined,
            data.class_id,
            data.photo_url
        );

        // Update cache
        await this.storage.run(
            'INSERT OR REPLACE INTO children (id, name, class_id, photo_uri) VALUES (?, ?, ?, ?)',
            [child.id, child.name.value, child.classId, child.photoUrl]
        );

        return child;
    }

    async findByClass(classId: string): Promise<Child[]> {
        const { data, error } = await supabase
            .from('children')
            .select(`
                *,
                guardian_children(
                    guardians(
                        image_consent
                    )
                )
            `)
            .eq('class_id', classId);

        if (error || !data) {
            // Fallback to cache if error or empty (assuming offline)
            const local = await this.storage.query<any>('SELECT * FROM children WHERE class_id = ?', [classId]);
            return local.map(item => this.mapFromCache(item));
        }

        const results = data.map(item => {
            let hasImageConsent = false;
            if (item.guardian_children && Array.isArray(item.guardian_children)) {
                hasImageConsent = item.guardian_children.some((gc: any) => {
                    const guardian = gc.guardians;
                    return guardian ? guardian.image_consent === true : false;
                });
            }

            return new Child(
                item.id,
                ChildName.create(item.name),
                item.birth_date ? new Date(item.birth_date) : undefined,
                item.class_id,
                item.photo_url,
                [],
                hasImageConsent
            );
        });

        // Update cache
        for (const child of results) {
            await this.storage.run(
                'INSERT OR REPLACE INTO children (id, name, class_id, photo_uri) VALUES (?, ?, ?, ?)',
                [child.id, child.name.value, child.classId, child.photoUrl]
            );
        }

        return results;
    }

    async findByGuardianId(guardianId: string): Promise<Child[]> {
        const { data, error } = await supabase
            .from('children')
            .select(`
                *,
                guardian_children!inner(guardian_id)
            `)
            .eq('guardian_children.guardian_id', guardianId);

        if (error || !data) {
            // No easy way to query "guardian_children" in local SQLite children table 
            // but we can return all cached children as a fallback for the parent if needed
            return [];
        }

        return data.map(item => new Child(
            item.id,
            ChildName.create(item.name),
            item.birth_date ? new Date(item.birth_date) : undefined,
            item.class_id,
            item.photo_url
        ));
    }

    async findAll(): Promise<Child[]> {
        const { data, error } = await supabase
            .from('children')
            .select('*')
            .order('name', { ascending: true });

        if (error || !data) {
            const local = await this.storage.query<any>('SELECT * FROM children ORDER BY name ASC');
            return local.map(item => this.mapFromCache(item));
        }

        const results = data.map(item => new Child(
            item.id,
            ChildName.create(item.name),
            item.birth_date ? new Date(item.birth_date) : undefined,
            item.class_id,
            item.photo_url
        ));

        return results;
    }

    async save(child: Child): Promise<void> {
        // Update cache immediately
        await this.storage.run(
            'INSERT OR REPLACE INTO children (id, name, class_id, photo_uri) VALUES (?, ?, ?, ?)',
            [child.id, child.name.value, child.classId, child.photoUrl]
        );

        const { error } = await supabase.from('children').upsert({
            id: child.id,
            name: child.name.value,
            birth_date: child.birthDate ? child.birthDate.toISOString().split('T')[0] : null,
            class_id: child.classId,
            photo_url: child.photoUrl
        });

        if (error) {
            console.error('Online save failed', error);
            throw error;
        }
    }

    private mapFromCache(data: any): Child {
        return new Child(
            data.id,
            ChildName.create(data.name),
            undefined,
            data.class_id,
            data.photo_uri
        );
    }
}
