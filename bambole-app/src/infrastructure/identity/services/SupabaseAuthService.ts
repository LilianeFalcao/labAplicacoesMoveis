import { supabase } from '@/infrastructure/supabase/client';
import { IAuthService } from '@/application/identity/services/IAuthService';

export class SupabaseAuthService implements IAuthService {
    async signUp(email: string, password: string): Promise<{ id: string; email: string }> {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error || !data.user) {
            throw new Error(error?.message || 'Error signing up');
        }

        return { id: data.user.id, email: data.user.email! };
    }

    async signIn(email: string, password: string): Promise<{ id: string; email: string }> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.user) {
            throw new Error(error?.message || 'Error signing in');
        }

        return { id: data.user.id, email: data.user.email! };
    }
}
