import { supabase } from '../../supabase/client';
import { IClassRepository } from '@/domain/activity/repositories/IClassRepository';
import { Class, WeeklySchedule } from '@/domain/activity/entities/Class';

export class SupabaseClassRepository implements IClassRepository {
    async findById(id: string): Promise<Class | null> {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return new Class(
            data.id,
            data.name,
            new WeeklySchedule(
                (data.weekly_schedule as any).days,
                (data.weekly_schedule as any).startTime,
                (data.weekly_schedule as any).endTime
            ),
            data.description || undefined,
            data.age_range || undefined
        );
    }

    async save(cls: Class): Promise<void> {
        const { error } = await supabase
            .from('classes')
            .upsert({
                id: cls.id,
                name: cls.name,
                description: cls.description,
                age_range: cls.ageRange,
                weekly_schedule: {
                    days: cls.weeklySchedule.days,
                    startTime: cls.weeklySchedule.startTime,
                    endTime: cls.weeklySchedule.endTime
                }
            });

        if (error) throw error;
    }
}
