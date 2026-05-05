export class Notification {
    private constructor(
        public readonly id: string | undefined,
        public readonly recipientId: string,
        public readonly title: string,
        public readonly message: string,
        private _read: boolean,
        public readonly createdAt: Date
    ) {}

    get read(): boolean {
        return this._read;
    }

    static create(recipientId: string, title: string, message: string): Notification {
        return new Notification(
            undefined,
            recipientId,
            title,
            message,
            false,
            new Date()
        );
    }

    markAsRead(): void {
        this._read = true;
    }
}
