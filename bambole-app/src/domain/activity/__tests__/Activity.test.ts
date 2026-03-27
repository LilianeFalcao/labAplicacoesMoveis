import { Class, WeeklySchedule } from '@/domain/activity/entities/Class';
import { Schedule } from '@/domain/activity/entities/Schedule';

describe('Activity Domain', () => {
    describe('WeeklySchedule', () => {
        it('should check if a time is within schedule', () => {
            // Segundas das 14:00 às 17:00
            const schedule = new WeeklySchedule(['MON'], '14:00', '17:00');

            // Simular segunda às 15:00
            const monday15 = new Date('2026-03-23T15:00:00'); // 2026-03-23 is Monday
            expect(schedule.includesNow(monday15)).toBe(true);

            // Simular segunda às 18:00
            const monday18 = new Date('2026-03-23T18:00:00');
            expect(schedule.includesNow(monday18)).toBe(false);

            // Simular terça às 15:00
            const tuesday15 = new Date('2026-03-24T15:00:00');
            expect(schedule.includesNow(tuesday15)).toBe(false);
        });
    });

    describe('Schedule Entity', () => {
        it('should create a valid activity schedule', () => {
            const scheduledAt = new Date('2026-03-27T10:00:00');
            const schedule = new Schedule(
                's1', 'cl1', 'Pintura', 'Arte', scheduledAt, 'Arte', 'weekly'
            );
            expect(schedule.title).toBe('Pintura');
            expect(schedule.recurrence).toBe('weekly');
        });
    });
});
