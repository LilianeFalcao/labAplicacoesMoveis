import { supabase } from '@/infrastructure/supabase/client';
import { Guardian } from '@/domain/enrollment/entities/Guardian';
import { IGuardianRepository } from '@/domain/enrollment/repositories/IGuardianRepository';

export class SupabaseGuardianRepository implements IGuardianRepository {
    async findById(id: string): Promise<Guardian | null> {
        const { data, error } = await supabase
            .from('guardians')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return new Guardian(
            data.id,
            data.user_id,
            data.image_consent,
            data.image_consent_at ? new Date(data.image_consent_at) : undefined
        );
    }

    async findByUserId(userId: string): Promise<Guardian | null> {
        const { data, error } = await supabase
            .from('guardians')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !data) return null;

        return new Guardian(
            data.id,
            data.user_id,
            data.image_consent,
            data.image_consent_at ? new Date(data.image_consent_at) : undefined
        );
    }

    async save(guardian: Guardian): Promise<void> {
        const { error } = await supabase.from('guardians').upsert({
            id: guardian.id,
            user_id: guardian.userId,
            image_consent: guardian.imageConsent,
            image_consent_at: guardian.imageConsentAt?.toISOString()
        });

        if (error) throw new Error(`Error saving guardian: ${error.message}`);
    }

    async linkToChild(guardianId: string, childId: string): Promise<void> {
        const { error } = await supabase.from('guardian_children').upsert({
            guardian_id: guardianId,
            child_id: childId
        });

        if (error) throw new Error(`Error linking guardian to child: ${error.message}`);
    }
}
