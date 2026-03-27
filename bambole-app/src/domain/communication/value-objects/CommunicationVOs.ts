export class AnnouncementContent {
    private constructor(public readonly value: string) { }

    static create(content: string): AnnouncementContent {
        if (!content || content.trim().length === 0) throw new Error('Content cannot be empty');
        if (content.length > 500) throw new Error('Content too long (max 500 chars)');
        return new AnnouncementContent(content.trim());
    }
}

export type AudienceType = 'class' | 'all';

export class Audience {
    private constructor(public readonly type: AudienceType, public readonly classId?: string) { }

    static forClass(classId: string): Audience {
        return new Audience('class', classId);
    }

    static forAll(): Audience {
        return new Audience('all');
    }
}
