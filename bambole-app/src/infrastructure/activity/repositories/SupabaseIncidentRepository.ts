import { IIncidentRepository } from "../../../domain/activity/repositories/IIncidentRepository";
import { Incident } from "../../../domain/activity/entities/Incident";

export class SupabaseIncidentRepository implements IIncidentRepository {
    async save(incident: Incident): Promise<void> {
        // Implementation for Supabase storage and table insertion
        console.log("Saving incident to Supabase:", incident);
    }

    async findById(id: string): Promise<Incident | null> {
        return null;
    }

    async findByClassId(classId: string): Promise<Incident[]> {
        return [];
    }
}
