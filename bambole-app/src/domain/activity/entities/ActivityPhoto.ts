export interface ActivityPhotoProps {
    id: string;
    classId: string;
    photoUri: string;
    timestamp: Date;
    caption?: string;
}

export class ActivityPhoto {
    constructor(private props: ActivityPhotoProps) { }

    get id(): string {
        return this.props.id;
    }

    get classId(): string {
        return this.props.classId;
    }

    get photoUri(): string {
        return this.props.photoUri;
    }

    get timestamp(): Date {
        return this.props.timestamp;
    }

    get caption(): string | undefined {
        return this.props.caption;
    }

    static create(props: Omit<ActivityPhotoProps, "id" | "timestamp"> & { id?: string; timestamp?: Date }): ActivityPhoto {
        return new ActivityPhoto({
            ...props,
            id: props.id ?? Math.random().toString(36).substring(2, 9),
            timestamp: props.timestamp ?? new Date(),
        });
    }
}
