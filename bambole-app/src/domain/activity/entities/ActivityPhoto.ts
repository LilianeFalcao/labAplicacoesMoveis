export interface ActivityPhotoProps {
    id: string;
    classId: string;
    monitorId: string;
    photoUri: string;
    timestamp: Date;
    caption?: string;
    isPending?: boolean;
    monitorName?: string;
    monitorAvatar?: string;
    className?: string;
    likes?: string[];
    comments?: any[];
}

export class ActivityPhoto {
    constructor(private props: ActivityPhotoProps) { }

    get id(): string {
        return this.props.id;
    }

    get classId(): string {
        return this.props.classId;
    }

    get monitorId(): string {
        return this.props.monitorId;
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

    get isPending(): boolean {
        return !!this.props.isPending;
    }

    get monitorName(): string | undefined {
        return this.props.monitorName;
    }

    get monitorAvatar(): string | undefined {
        return this.props.monitorAvatar;
    }

    get className(): string | undefined {
        return this.props.className;
    }

    get likes(): string[] {
        return this.props.likes || [];
    }

    get comments(): any[] {
        return this.props.comments || [];
    }

    static create(props: Omit<ActivityPhotoProps, "id" | "timestamp" | "monitorId"> & { id?: string; monitorId?: string; timestamp?: Date; isPending?: boolean; monitorName?: string; monitorAvatar?: string; className?: string; likes?: string[]; comments?: any[] }): ActivityPhoto {
        return new ActivityPhoto({
            ...props,
            id: props.id ?? Math.random().toString(36).substring(2, 9),
            monitorId: props.monitorId ?? 'mock-monitor-id',
            timestamp: props.timestamp ?? new Date(),
            isPending: props.isPending ?? false,
        });
    }
}
