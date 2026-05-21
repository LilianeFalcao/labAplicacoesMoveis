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

        if (error || !data) {
            // Fallback: Create guardian record if not found
            const { data: newGuardian, error: createError } = await supabase
                .from('guardians')
                .insert({ user_id: userId })
                .select()
                .single();

            if (createError || !newGuardian) return null;

            return new Guardian(
                newGuardian.id,
                newGuardian.user_id,
                newGuardian.image_consent,
                newGuardian.image_consent_at ? new Date(newGuardian.image_consent_at) : undefined
            );
        }

        return new Guardian(
            data.id,
            data.user_id,
            data.image_consent,
            data.image_consent_at ? new Date(data.image_consent_at) : undefined
        );
    }

    async findByUserEmail(email: string): Promise<Guardian | null> {
        // 1. Find the user first to get the ID
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .eq('role', 'parent')
            .single();

        if (userError || !userData) return null;

        // 2. Find the guardian record for this user
        const { data: guardianData, error: guardianError } = await supabase
            .from('guardians')
            .select('*')
            .eq('user_id', userData.id)
            .single();

        if (guardianError || !guardianData) {
            // If user is a parent but has no guardian record, create it now (fallback)
            const { data: newGuardian, error: createError } = await supabase
                .from('guardians')
                .insert({ user_id: userData.id })
                .select()
                .single();

            if (createError || !newGuardian) return null;
            
            return new Guardian(
                newGuardian.id,
                newGuardian.user_id,
                newGuardian.image_consent,
                newGuardian.image_consent_at ? new Date(newGuardian.image_consent_at) : undefined
            );
        }

        return new Guardian(
            guardianData.id,
            guardianData.user_id,
            guardianData.image_consent,
            guardianData.image_consent_at ? new Date(guardianData.image_consent_at) : undefined
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
