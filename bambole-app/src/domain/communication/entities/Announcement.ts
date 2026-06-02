import { AnnouncementContent, Audience } from '../value-objects/CommunicationVOs';

export class Announcement {
    public readonly id: string | undefined;
    public readonly authorId: string;
    public readonly content: AnnouncementContent;
    public readonly audience: Audience;
    public readonly publishedAt: Date;

    constructor(
        id: string | undefined,
        authorId: string,
        content: AnnouncementContent,
        audience: Audience,
        publishedAt: Date,
    ) {
        this.id = id;
        this.authorId = authorId;
        this.content = content;
        this.audience = audience;
        this.publishedAt = publishedAt;
    }
}
