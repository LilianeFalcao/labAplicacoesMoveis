import { supabase } from '../../supabase/client';
import { IAttendanceRepository } from '@/domain/attendance/repositories/IAttendanceRepository';
import { AttendanceRecord } from '@/domain/attendance/entities/AttendanceRecord';
import { AttendanceStatus } from '@/domain/attendance/value-objects/AttendanceStatus';

export class SupabaseAttendanceRepository implements IAttendanceRepository {
    async save(record: AttendanceRecord): Promise<void> {
        const { error } = await supabase
            .from('attendance_records')
            .upsert({
                id: record.id || crypto.randomUUID(),
                child_id: record.childId,
                class_id: record.classId,
                monitor_id: record.monitorId,
                date: record.date.toISOString().split('T')[0],
                status: record.status.value,
                lat: record.geolocation?.lat,
                lng: record.geolocation?.lng,
                justification_note: record.justificationNote,
                justified_at: record.justifiedAt?.toISOString()
            });

        if (error) throw error;
    }

    async findById(id: string): Promise<AttendanceRecord | null> {
        const { data, error } = await supabase
            .from('attendance_records')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return new AttendanceRecord(
            data.id,
            data.child_id,
            data.class_id,
            data.monitor_id,
            new Date(data.date),
            AttendanceStatus.create(data.status as any),
            data.lat && data.lng ? { lat: data.lat, lng: data.lng } : undefined,
            data.justification_note || undefined,
            data.justified_at ? new Date(data.justified_at) : undefined
        );
    }

    async findByChildAndDate(childId: string, date: string): Promise<AttendanceRecord | null> {
        const { data, error } = await supabase
            .from('attendance_records')
            .select('*')
            .eq('child_id', childId)
            .eq('date', date)
            .single();

        if (error || !data) return null;
        return this.findById(data.id);
    }

    async findByClassAndDate(classId: string, date: string): Promise<AttendanceRecord[]> {
        const { data, error } = await supabase
            .from('attendance_records')
            .select('id')
            .eq('class_id', classId)
            .eq('date', date);

        if (error) throw error;
        const records = await Promise.all((data || []).map(r => this.findById(r.id)));
        return records.filter(r => r !== null) as AttendanceRecord[];
    }
}
