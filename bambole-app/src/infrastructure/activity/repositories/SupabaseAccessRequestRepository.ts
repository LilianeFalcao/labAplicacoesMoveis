import { supabase } from '../../supabase/client';
import { IAccessRequestRepository } from '@/domain/activity/repositories/IAccessRequestRepository';
import { ClassAccessRequest, AccessRequestStatus } from '@/domain/activity/entities/ClassAccessRequest';

export class SupabaseAccessRequestRepository implements IAccessRequestRepository {
    async findPending(): Promise<ClassAccessRequest[]> {
        const { data, error } = await supabase
            .from('class_access_requests')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(row => this.mapToDomain(row));
    }

    async findById(id: string): Promise<ClassAccessRequest | null> {
        const { data, error } = await supabase
            .from('class_access_requests')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    async save(request: ClassAccessRequest): Promise<void> {
        const { error } = await supabase
            .from('class_access_requests')
            .insert({
                monitor_id: request.monitorId,
                class_id: request.classId,
                status: request.status.toLowerCase(),
                reason: '' // Reason field not present in domain entity currently
            });

        if (error) throw error;
    }

    async update(request: ClassAccessRequest): Promise<void> {
        if (!request.id) return;

        const { error } = await supabase
            .from('class_access_requests')
            .update({
                status: request.status.toLowerCase()
            })
            .eq('id', request.id);

        if (error) throw error;
    }

    subscribe(callback: () => void): () => void {
        const channel = supabase
            .channel('public:class_access_requests')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'class_access_requests' }, () => {
                callback();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }

    private mapToDomain(row: any): ClassAccessRequest {
        // Mapping 'approved' (db) to 'APPROVED' (enum)
        const statusMap: Record<string, AccessRequestStatus> = {
            'pending': AccessRequestStatus.PENDING,
            'approved': AccessRequestStatus.APPROVED,
            'rejected': AccessRequestStatus.REJECTED
        };

        // We use reflection or cast since the constructor is private
        const request = new (ClassAccessRequest as any)(
            row.id,
            row.monitor_id,
            row.class_id,
            statusMap[row.status] || AccessRequestStatus.PENDING,
            new Date(row.created_at)
        );
        return request;
    }
}
