import { supabase } from '../../supabase/client';
import { IAttendanceRepository } from '@/domain/attendance/repositories/IAttendanceRepository';
import { AttendanceRecord } from '@/domain/attendance/entities/AttendanceRecord';
import { AttendanceStatus } from '@/domain/attendance/value-objects/AttendanceStatus';
import { SqliteStorageService } from '../../storage/SqliteStorageService';

export class SupabaseAttendanceRepository implements IAttendanceRepository {
    private storage = SqliteStorageService.getInstance();

    async save(record: AttendanceRecord): Promise<void> {
        const payload = {
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
        };

        try {
            // 1. Try online save
            const { error } = await supabase.from('attendance_records').upsert(payload);
            
            if (error) throw error;

            // 2. Also update local cache for immediate feedback
            await this.storage.run(
                'INSERT OR REPLACE INTO attendance (id, child_id, class_id, date, status, synced) VALUES (?, ?, ?, ?, ?, 1)',
                [payload.id, payload.child_id, payload.class_id, payload.date, payload.status]
            );

        } catch (error) {
            console.warn('Online save failed, falling back to offline storage', error);
            
            // 3. Save to sync_queue
            await this.storage.run(
                "INSERT INTO sync_queue (action_type, payload, timestamp, status) VALUES (?, ?, ?, 'pending')",
                ['MARK_ATTENDANCE', JSON.stringify(payload), Date.now()]
            );

            // 4. Update local cache marked as unsynced
            await this.storage.run(
                'INSERT OR REPLACE INTO attendance (id, child_id, class_id, date, status, synced) VALUES (?, ?, ?, ?, ?, 0)',
                [payload.id, payload.child_id, payload.class_id, payload.date, payload.status]
            );
        }
    }

    async findById(id: string): Promise<AttendanceRecord | null> {
        // Try local first for speed
        const local = await this.storage.query<any>('SELECT * FROM attendance WHERE id = ?', [id]);
        if (local.length > 0) return this.mapFromCache(local[0]);

        // Fallback to online
        const { data, error } = await supabase
            .from('attendance_records')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;
        return this.mapToEntity(data);
    }

    async findByChildAndDate(childId: string, date: string): Promise<AttendanceRecord | null> {
        const local = await this.storage.query<any>(
            'SELECT * FROM attendance WHERE child_id = ? AND date = ?',
            [childId, date]
        );
        if (local.length > 0) return this.mapFromCache(local[0]);

        const { data, error } = await supabase
            .from('attendance_records')
            .select('*')
            .eq('child_id', childId)
            .eq('date', date)
            .single();

        if (error || !data) return null;
        return this.mapToEntity(data);
    }

    async findByClassAndDate(classId: string, date: string): Promise<AttendanceRecord[]> {
        // We might want to combine local unsynced + online data here
        // For simplicity, we trust the cache for the current session
        const local = await this.storage.query<any>(
            'SELECT * FROM attendance WHERE class_id = ? AND date = ?',
            [classId, date]
        );

        if (local.length > 0) {
            return local.map(item => this.mapFromCache(item));
        }

        const { data, error } = await supabase
            .from('attendance_records')
            .select('*')
            .eq('class_id', classId)
            .eq('date', date);

        if (error) throw error;
        
        // Populate cache with results
        for (const item of (data || [])) {
            await this.storage.run(
                'INSERT OR REPLACE INTO attendance (id, child_id, class_id, date, status, synced) VALUES (?, ?, ?, ?, ?, 1)',
                [item.id, item.child_id, item.class_id, item.date, item.status]
            );
        }

        return (data || []).map(item => this.mapToEntity(item));
    }

    async findByClassId(classId: string): Promise<AttendanceRecord[]> {
        const { data, error } = await supabase
            .from('attendance_records')
            .select('*')
            .eq('class_id', classId);

        if (error) throw error;
        return (data || []).map(item => this.mapToEntity(item));
    }

    private mapToEntity(data: any): AttendanceRecord {
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

    private mapFromCache(data: any): AttendanceRecord {
        return new AttendanceRecord(
            data.id,
            data.child_id,
            data.class_id,
            '', // monitor_id not in cache for now
            new Date(data.date),
            AttendanceStatus.create(data.status as any),
            undefined,
            undefined,
            undefined
        );
    }
}
