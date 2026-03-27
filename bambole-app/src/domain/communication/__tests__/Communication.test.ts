import { Announcement } from '@/domain/communication/entities/Announcement';
import { AnnouncementContent, Audience } from '@/domain/communication/value-objects/CommunicationVOs';

describe('Communication Domain', () => {
    it('should create a valid announcement content', () => {
        const content = AnnouncementContent.create('Aviso importante');
        expect(content.value).toBe('Aviso importante');
    });

    it('should throw error for empty content', () => {
        expect(() => AnnouncementContent.create('')).toThrow('Content cannot be empty');
    });

    it('should throw error for content too long', () => {
        const longContent = 'a'.repeat(501);
        expect(() => AnnouncementContent.create(longContent)).toThrow('Content too long');
    });

    it('should create a valid announcement for a class', () => {
        const content = AnnouncementContent.create('Reunião de pais');
        const audience = Audience.forClass('cl1');
        const announcement = new Announcement('a1', 'u1', content, audience, new Date());

        expect(announcement.audience.type).toBe('class');
        expect(announcement.audience.classId).toBe('cl1');
    });

    it('should create a valid announcement for all', () => {
        const content = AnnouncementContent.create('Feriado amanhã');
        const audience = Audience.forAll();
        const announcement = new Announcement('a1', 'u1', content, audience, new Date());

        expect(announcement.audience.type).toBe('all');
    });
});
