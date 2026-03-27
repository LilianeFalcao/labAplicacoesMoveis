export type AttendanceStatusType = 'present' | 'absent' | 'pre_justified' | 'justified';

export class AttendanceStatus {
    private constructor(public readonly value: AttendanceStatusType) { }

    static create(value: AttendanceStatusType): AttendanceStatus {
        const valid: string[] = ['present', 'absent', 'pre_justified', 'justified'];
        if (!valid.includes(value)) throw new Error('Invalid attendance status');
        return new AttendanceStatus(value as AttendanceStatusType);
    }
}

export interface GeolocationProof {
    lat: number;
    lng: number;
}
