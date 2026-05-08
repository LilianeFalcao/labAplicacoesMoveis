import { Incident } from "../entities/Incident";

export interface IIncidentRepository {
    save(incident: Incident): Promise<void>;
    findById(id: string): Promise<Incident | null>;
    findByClassId(classId: string): Promise<Incident[]>;
}
