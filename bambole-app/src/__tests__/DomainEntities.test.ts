import { Schedule } from '../domain/activity/entities/Schedule';
import { Announcement } from '../domain/communication/entities/Announcement';
import { AnnouncementContent, Audience } from '../domain/communication/value-objects/CommunicationVOs';
import { Child } from '../domain/enrollment/entities/Child';
import { ChildName } from '../domain/enrollment/value-objects/ChildName';
import { Guardian } from '../domain/enrollment/entities/Guardian';
import { User } from '../domain/identity/entities/User';
import { Email } from '../domain/identity/value-objects/Email';
import { Role } from '../domain/identity/value-objects/Role';

describe('Domain Entities', () => {
    it('should successfully instantiate Schedule', () => {
        const date = new Date();
        const schedule = new Schedule(
            'sched-123',
            'class-456',
            'Futebol',
            'Atividade física no campo',
            date,
            'Esporte',
            'weekly'
        );

        expect(schedule.id).toBe('sched-123');
        expect(schedule.classId).toBe('class-456');
        expect(schedule.title).toBe('Futebol');
        expect(schedule.description).toBe('Atividade física no campo');
        expect(schedule.scheduledAt).toBe(date);
        expect(schedule.category).toBe('Esporte');
        expect(schedule.recurrence).toBe('weekly');
    });

    it('should successfully instantiate Announcement', () => {
        const date = new Date();
        const content = AnnouncementContent.create('Aviso geral aos pais');
        const audience = Audience.forAll();
        const announcement = new Announcement(
            'ann-123',
            'author-456',
            content,
            audience,
            date
        );

        expect(announcement.id).toBe('ann-123');
        expect(announcement.authorId).toBe('author-456');
        expect(announcement.content).toBe(content);
        expect(announcement.audience).toBe(audience);
        expect(announcement.publishedAt).toBe(date);
    });

    it('should successfully instantiate Child with medicalAlerts and image consent defaults', () => {
        const name = ChildName.create('Luiza');
        const child = new Child(
            'child-123',
            name,
            undefined,
            'class-456',
            'https://supabase.co/photo.jpg',
            ['Alergia a lactose'],
            true
        );

        expect(child.id).toBe('child-123');
        expect(child.name).toBe(name);
        expect(child.birthDate).toBeUndefined();
        expect(child.classId).toBe('class-456');
        expect(child.photoUrl).toBe('https://supabase.co/photo.jpg');
        expect(child.medicalAlerts).toEqual(['Alergia a lactose']);
        expect(child.hasImageConsent).toBe(true);
    });

    it('should successfully instantiate Guardian', () => {
        const date = new Date();
        const guardian = new Guardian(
            'guard-123',
            'user-456',
            true,
            date
        );

        expect(guardian.id).toBe('guard-123');
        expect(guardian.userId).toBe('user-456');
        expect(guardian.imageConsent).toBe(true);
        expect(guardian.imageConsentAt).toBe(date);
    });

    it('should successfully instantiate User', () => {
        const email = Email.create('user@test.com');
        const role = Role.create('monitor');
        const user = new User(
            'user-123',
            email,
            role,
            'João Silva',
            'https://supabase.co/avatar.jpg'
        );

        expect(user.id).toBe('user-123');
        expect(user.email).toBe(email);
        expect(user.role).toBe(role);
        expect(user.fullName).toBe('João Silva');
        expect(user.avatarUrl).toBe('https://supabase.co/avatar.jpg');
    });
});
