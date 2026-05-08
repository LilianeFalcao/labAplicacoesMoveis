export interface IncidentProps {
    id: string;
    description: string;
    photoUrls: string[];
    isEmergency: boolean;
    classId: string;
    studentId?: string;
    createdAt: Date;
    monitorId: string;
}

export class Incident {
    constructor(private props: IncidentProps) {}

    get id(): string { return this.props.id; }
    get description(): string { return this.props.description; }
    get photoUrls(): string[] { return this.props.photoUrls; }
    get isEmergency(): boolean { return this.props.isEmergency; }
    get classId(): string { return this.props.classId; }
    get studentId(): string | undefined { return this.props.studentId; }
    get createdAt(): Date { return this.props.createdAt; }
    get monitorId(): string { return this.props.monitorId; }

    static create(props: Omit<IncidentProps, 'id' | 'createdAt'>): Incident {
        return new Incident({
            ...props,
            id: Math.random().toString(36).substring(2, 9),
            createdAt: new Date(),
        });
    }
}
