import { supabase } from '@/infrastructure/supabase/client';
import { IIncidentRepository } from '@/domain/activity/repositories/IIncidentRepository';
import { Incident } from '@/domain/activity/entities/Incident';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from '@/infrastructure/utils/base64';

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

        const uploadedUrls: string[] = [];

        if (incident.photoUrls && incident.photoUrls.length > 0) {
            for (const url of incident.photoUrls) {
                if (url.startsWith('http://') || url.startsWith('https://')) {
                    uploadedUrls.push(url);
                } else {
                    try {
                        const base64 = await FileSystem.readAsStringAsync(url, { encoding: 'base64' });
                        const fileName = `incident_${incident.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
                        const { error: uploadError } = await supabase.storage
                            .from('children-photos')
                            .upload(fileName, decode(base64), {
                                contentType: 'image/jpeg',
                                upsert: true
                            });

                        if (uploadError) throw uploadError;

                        const { data: { publicUrl } } = supabase.storage
                            .from('children-photos')
                            .getPublicUrl(fileName);

                        uploadedUrls.push(publicUrl);
                    } catch (uploadErr) {
                        console.error('Failed to upload incident photo:', url, uploadErr);
                        uploadedUrls.push(url); // fallback
                    }
                }
            }
        }

        if (uploadedUrls.length > 0) {
            // Delete existing photos for this incident (if doing upsert)
            await supabase
                .from('incident_photos')
                .delete()
                .eq('incident_id', incident.id);

            const photosToInsert = uploadedUrls.map(url => ({
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
        if (!classId || classId === 'undefined' || classId === 'null') {
            return [];
        }
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
