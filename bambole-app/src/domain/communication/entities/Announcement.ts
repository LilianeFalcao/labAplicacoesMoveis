import { AnnouncementContent, Audience } from '../value-objects/CommunicationVOs';

export class Announcement {
    constructor(
        public readonly id: string | undefined,
        public readonly authorId: string,
        public readonly content: AnnouncementContent,
        public readonly audience: Audience,
        public readonly publishedAt: Date
    ) { }
}
