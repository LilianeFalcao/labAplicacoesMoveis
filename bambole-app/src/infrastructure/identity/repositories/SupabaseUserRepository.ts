import { supabase } from '@/infrastructure/supabase/client';
import { User } from '@/domain/identity/entities/User';
import { IUserRepository } from '@/domain/identity/repositories/IUserRepository';
import { Email } from '@/domain/identity/value-objects/Email';
import { Role, UserRole } from '@/domain/identity/value-objects/Role';

export class SupabaseUserRepository implements IUserRepository {
    async findById(id: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return new User(
            data.id,
            Email.create(data.email),
            Role.create(data.role as UserRole)
        );
    }

    async findByEmail(email: Email): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.value)
            .single();

        if (error || !data) return null;

        return new User(
            data.id,
            Email.create(data.email),
            Role.create(data.role as UserRole)
        );
    }

    async save(user: User): Promise<void> {
        const { error } = await supabase
            .from('users')
            .upsert({
                id: user.id,
                email: user.email.value,
                role: user.role.value,
            });

        if (error) throw error;
    }

    async findTokensByClass(classId: string): Promise<string[]> {
        const { data: joinedData, error: joinedError } = await supabase
            .from('users')
            .select(`
        push_token,
        guardians!inner (
          id,
          guardian_children!inner (
            child_id,
            children!inner (
              class_id
            )
          )
        )
      `)
            .eq('role', 'parent')
            .not('push_token', 'is', null)
            .eq('guardians.guardian_children.children.class_id', classId);

        if (joinedError) throw joinedError;
        return (joinedData || []).map(u => u.push_token) as string[];
    }

    async findAllParentTokens(): Promise<string[]> {
        const { data, error } = await supabase
            .from('users')
            .select('push_token')
            .eq('role', 'parent')
            .not('push_token', 'is', null);

        if (error) throw error;
        return (data || []).map(u => u.push_token) as string[];
    }
}
