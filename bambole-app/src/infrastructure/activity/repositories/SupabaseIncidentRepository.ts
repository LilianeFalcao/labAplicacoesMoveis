import { supabase } from '@/infrastructure/supabase/client';
import { IIncidentRepository } from '@/domain/activity/repositories/IIncidentRepository';
import { Incident } from '@/domain/activity/entities/Incident';

export class SupabaseIncidentRepository implements IIncidentRepository {
    async save(incident: Incident): Promise<void> {
        const { error: incidentError } = await supabase
            .from('incidents')
            .upsert({
                id: incident.id,
                description: incident.description,
                is_emergency: incident.isEmergency,
                class_id: incident.classId === 'global' ? null : incident.classId,
                child_id: incident.studentId || null,
                monitor_id: incident.monitorId,
                created_at: incident.createdAt.toISOString()
            });

        if (incidentError) throw incidentError;

        if (incident.photoUrls && incident.photoUrls.length > 0) {
            // Delete existing photos for this incident (if doing upsert)
            await supabase
                .from('incident_photos')
                .delete()
                .eq('incident_id', incident.id);

            const photosToInsert = incident.photoUrls.map(url => ({
                incident_id: incident.id,
                url: url
            }));

            const { error: photosError } = await supabase
                .from('incident_photos')
                .insert(photosToInsert);

            if (photosError) throw photosError;
        }
    }

    async findById(id: string): Promise<Incident | null> {
        const { data: incidentData, error: incidentError } = await supabase
            .from('incidents')
            .select('*')
            .eq('id', id)
            .single();

        if (incidentError || !incidentData) return null;

        const { data: photosData } = await supabase
            .from('incident_photos')
            .select('url')
            .eq('incident_id', id);

        const photoUrls = photosData ? photosData.map(p => p.url) : [];

        return new Incident({
            id: incidentData.id,
            description: incidentData.description,
            photoUrls: photoUrls,
            isEmergency: incidentData.is_emergency,
            classId: incidentData.class_id || 'global',
            studentId: incidentData.child_id || undefined,
            createdAt: new Date(incidentData.created_at),
            monitorId: incidentData.monitor_id
        });
    }

    async findByClassId(classId: string): Promise<Incident[]> {
        let query = supabase
            .from('incidents')
            .select('*');
            
        if (classId === 'global') {
            query = query.is('class_id', null);
        } else {
            query = query.eq('class_id', classId);
        }

        const { data: incidentsData, error: incidentsError } = await query
            .order('created_at', { ascending: false });

        if (incidentsError || !incidentsData || incidentsData.length === 0) return [];

        const incidentIds = incidentsData.map(i => i.id);
        const { data: photosData } = await supabase
            .from('incident_photos')
            .select('incident_id, url')
            .in('incident_id', incidentIds);

        return incidentsData.map(item => {
            const photoUrls = photosData 
                ? photosData.filter(p => p.incident_id === item.id).map(p => p.url)
                : [];

            return new Incident({
                id: item.id,
                description: item.description,
                photoUrls: photoUrls,
                isEmergency: item.is_emergency,
                classId: item.class_id || 'global',
                studentId: item.child_id || undefined,
                createdAt: new Date(item.created_at),
                monitorId: item.monitor_id
            });
        });
    }

    async findAll(): Promise<Incident[]> {
        const { data: incidentsData, error: incidentsError } = await supabase
            .from('incidents')
            .select('*')
            .order('created_at', { ascending: false });

        if (incidentsError || !incidentsData || incidentsData.length === 0) return [];

        const incidentIds = incidentsData.map(i => i.id);
        const { data: photosData } = await supabase
            .from('incident_photos')
            .select('incident_id, url')
            .in('incident_id', incidentIds);

        return incidentsData.map(item => {
            const photoUrls = photosData 
                ? photosData.filter(p => p.incident_id === item.id).map(p => p.url)
                : [];

            return new Incident({
                id: item.id,
                description: item.description,
                photoUrls: photoUrls,
                isEmergency: item.is_emergency,
                classId: item.class_id || 'global',
                studentId: item.child_id || undefined,
                createdAt: new Date(item.created_at),
                monitorId: item.monitor_id
            });
        });
    }

    async findByMonitorId(monitorId: string): Promise<Incident[]> {
        const { data: incidentsData, error: incidentsError } = await supabase
            .from('incidents')
            .select('*')
            .eq('monitor_id', monitorId)
            .order('created_at', { ascending: false });

        if (incidentsError || !incidentsData || incidentsData.length === 0) return [];

        const incidentIds = incidentsData.map(i => i.id);
        const { data: photosData } = await supabase
            .from('incident_photos')
            .select('incident_id, url')
            .in('incident_id', incidentIds);

        return incidentsData.map(item => {
            const photoUrls = photosData 
                ? photosData.filter(p => p.incident_id === item.id).map(p => p.url)
                : [];

            return new Incident({
                id: item.id,
                description: item.description,
                photoUrls: photoUrls,
                isEmergency: item.is_emergency,
                classId: item.class_id || 'global',
                studentId: item.child_id || undefined,
                createdAt: new Date(item.created_at),
                monitorId: item.monitor_id
            });
        });
    }
}
