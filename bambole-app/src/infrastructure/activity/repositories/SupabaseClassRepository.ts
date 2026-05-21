import { supabase } from '../../supabase/client';
import { IClassRepository, MonitorClassAssignment } from '@/domain/activity/repositories/IClassRepository';
import { Class, WeeklySchedule } from '@/domain/activity/entities/Class';

export class SupabaseClassRepository implements IClassRepository {
    async findById(id: string): Promise<Class | null> {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return this.mapFromDb(data);
    }

    async findByIds(ids: string[]): Promise<Class[]> {
        if (!ids || ids.length === 0) return [];
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .in('id', ids);

        if (error || !data) return [];
        return data.map(item => this.mapFromDb(item));
    }

    async findByMonitorId(monitorId: string): Promise<Class[]> {
        const { data: relations, error: relError } = await supabase
            .from('monitor_activities')
            .select('class_id')
            .eq('monitor_id', monitorId);

        if (relError || !relations || relations.length === 0) return [];
        const classIds = relations.map(r => r.class_id);
        return this.findByIds(classIds);
    }

    async findAllWithoutMonitor(): Promise<Class[]> {
        const classes = await this.findAll();
        
        const { data: assignments, error } = await supabase
            .from('monitor_activities')
            .select('class_id');

        if (error || !assignments) return classes;

        const assignedIds = assignments.map(a => a.class_id);
        return classes.filter(cls => !assignedIds.includes(cls.id));
    }

    async findAll(): Promise<Class[]> {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .order('name', { ascending: true });

        if (error || !data) return [];
        return data.map(item => this.mapFromDb(item));
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

    async assignClassesToMonitor(monitorId: string, assignments: MonitorClassAssignment[]): Promise<void> {
        const { error: deleteError } = await supabase
            .from('monitor_activities')
            .delete()
            .eq('monitor_id', monitorId);

        if (deleteError) throw deleteError;

        if (assignments.length === 0) return;

        const insertData = assignments.map(a => ({
            monitor_id: monitorId,
            class_id: a.classId,
            is_primary: a.isPrimary
        }));

        const { error: insertError } = await supabase
            .from('monitor_activities')
            .insert(insertData);

        if (insertError) throw insertError;
    }

    private mapFromDb(data: any): Class {
        const scheduleData = data.weekly_schedule || {};
        return new Class(
            data.id,
            data.name,
            new WeeklySchedule(
                scheduleData.days || [],
                scheduleData.startTime || '08:00',
                scheduleData.endTime || '12:00'
            ),
            data.description || undefined,
            data.age_range || undefined
        );
    }
}
