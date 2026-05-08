import { IIncidentRepository } from "../../../domain/activity/repositories/IIncidentRepository";
import { Incident } from "../../../domain/activity/entities/Incident";

export class MockIncidentRepository implements IIncidentRepository {
    private static instance: MockIncidentRepository;
    private incidents: Incident[] = [];

    private constructor() {}

    static getInstance(): MockIncidentRepository {
        if (!MockIncidentRepository.instance) {
            MockIncidentRepository.instance = new MockIncidentRepository();
        }
        return MockIncidentRepository.instance;
    }

    async save(incident: Incident): Promise<void> {
        this.incidents.push(incident);
        console.log("Mock saved incident:", incident);
    }

    async findById(id: string): Promise<Incident | null> {
        return this.incidents.find(i => i.id === id) || null;
    }

    async findByClassId(classId: string): Promise<Incident[]> {
        return this.incidents.filter(i => i.classId === classId);
    }
}
