import { AttendanceStatus, GeolocationProof } from '../value-objects/AttendanceStatus';

export class AttendanceRecord {
    constructor(
        public readonly id: string | undefined, // undefined for new records
        public readonly childId: string,
        public readonly classId: string,
        public readonly monitorId: string,
        public readonly date: Date,
        private _status: AttendanceStatus,
        private _geolocation?: GeolocationProof,
        private _justificationNote?: string,
        private _justifiedAt?: Date,
        public readonly activityId?: string
    ) { }

    get status() { return this._status; }
    get geolocation() { return this._geolocation; }
    get justificationNote() { return this._justificationNote; }
    get justifiedAt() { return this._justifiedAt; }

    static createPresent(childId: string, classId: string, monitorId: string, date: Date, proof: GeolocationProof, activityId?: string): AttendanceRecord {
        return new AttendanceRecord(undefined, childId, classId, monitorId, date, AttendanceStatus.create('present'), proof, undefined, undefined, activityId);
    }

    static createAbsent(childId: string, classId: string, monitorId: string, date: Date, activityId?: string): AttendanceRecord {
        return new AttendanceRecord(undefined, childId, classId, monitorId, date, AttendanceStatus.create('absent'), undefined, undefined, undefined, activityId);
    }

    preJustify(note: string): void {
        this._status = AttendanceStatus.create('pre_justified');
        this._justificationNote = note;
        this._justifiedAt = new Date();
    }

    justifyRetroactively(note: string): void {
        this._status = AttendanceStatus.create('justified');
        this._justificationNote = note;
        this._justifiedAt = new Date();
    }
}
