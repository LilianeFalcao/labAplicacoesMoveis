export enum AccessRequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export class ClassAccessRequest {
    private constructor(
        public readonly id: string | undefined,
        public readonly monitorId: string,
        public readonly classId: string,
        private _status: AccessRequestStatus,
        public readonly requestedAt: Date
    ) { }

    get status(): AccessRequestStatus {
        return this._status;
    }

    static create(monitorId: string, classId: string): ClassAccessRequest {
        return new ClassAccessRequest(
            undefined,
            monitorId,
            classId,
            AccessRequestStatus.PENDING,
            new Date()
        );
    }

    approve(): void {
        this._status = AccessRequestStatus.APPROVED;
    }

    reject(): void {
        this._status = AccessRequestStatus.REJECTED;
    }
}
