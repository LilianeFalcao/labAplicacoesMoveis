import { Class, WeeklySchedule } from '@/domain/activity/entities/Class';
import { Schedule } from '@/domain/activity/entities/Schedule';

describe('Activity Domain', () => {
    describe('WeeklySchedule', () => {
        it('should check if a time is within schedule (no tolerance)', () => {
            // Segundas das 14:00 às 17:00
            const schedule = new WeeklySchedule(['MON'], '14:00', '17:00');

            // Simular segunda às 15:00 — dentro do horário
            const monday15 = new Date('2026-03-23T15:00:00'); // 2026-03-23 is Monday
            expect(schedule.includesNow(monday15, 0)).toBe(true);

            // Simular segunda às 18:00 — fora do horário (1h após), sem tolerância deve ser false
            const monday18 = new Date('2026-03-23T18:00:00');
            expect(schedule.includesNow(monday18, 0)).toBe(false);

            // Simular terça às 15:00 — dia errado, sem tolerância deve ser false
            const tuesday15 = new Date('2026-03-24T15:00:00');
            expect(schedule.includesNow(tuesday15, 0)).toBe(false);
        });

        it('should allow call within 60-minute tolerance buffer before start', () => {
            const schedule = new WeeklySchedule(['MON'], '14:00', '17:00');

            // 13:01 — 59 minutos antes do início, dentro da tolerância de 60 min
            const monday1301 = new Date('2026-03-23T13:01:00');
            expect(schedule.includesNow(monday1301, 60)).toBe(true);

            // 12:59 — 61 minutos antes do início, fora da tolerância
            const monday1259 = new Date('2026-03-23T12:59:00');
            expect(schedule.includesNow(monday1259, 60)).toBe(false);
        });

        it('should allow call within 60-minute tolerance buffer after end', () => {
            const schedule = new WeeklySchedule(['MON'], '14:00', '17:00');

            // 17:59 — 59 minutos após o término, dentro da tolerância de 60 min
            const monday1759 = new Date('2026-03-23T17:59:00');
            expect(schedule.includesNow(monday1759, 60)).toBe(true);

            // 18:01 — 61 minutos após o término, fora da tolerância
            const monday1801 = new Date('2026-03-23T18:01:00');
            expect(schedule.includesNow(monday1801, 60)).toBe(false);
        });

        it('should never allow call on a wrong day regardless of tolerance', () => {
            const schedule = new WeeklySchedule(['MON'], '14:00', '17:00');

            // Terça às 15:00 — dia errado, mesmo com tolerância máxima
            const tuesday15 = new Date('2026-03-24T15:00:00');
            expect(schedule.includesNow(tuesday15, 60)).toBe(false);
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

        it('should have default recurrence as none', () => {
            const scheduledAt = new Date('2026-03-27T10:00:00');
            const schedule = new Schedule(
                's1', 'cl1', 'Pintura', 'Arte', scheduledAt, 'Arte'
            );
            expect(schedule.recurrence).toBe('none');
        });
    });

    describe('Class Entity', () => {
        it('should check if class is allowed now (no tolerance)', () => {
            const schedule = new WeeklySchedule(['MON'], '14:00', '17:00');
            const myClass = new Class('c1', 'Ballet', schedule);

            // Segunda às 15:00 — dentro do horário exato
            const monday15 = new Date('2026-03-23T15:00:00');
            expect(myClass.isCallAllowedNow(monday15, 0)).toBe(true);

            // Terça às 15:00 — dia errado, deve ser false mesmo sem tolerância
            const tuesday15 = new Date('2026-03-24T15:00:00');
            expect(myClass.isCallAllowedNow(tuesday15, 0)).toBe(false);
        });

        it('should allow call with 60-minute tolerance (default behavior)', () => {
            const schedule = new WeeklySchedule(['MON'], '14:00', '17:00');
            const myClass = new Class('c1', 'Ballet', schedule);

            // Segunda às 13:30 — 30 min antes, dentro da tolerância padrão de 60 min
            const monday1330 = new Date('2026-03-23T13:30:00');
            expect(myClass.isCallAllowedNow(monday1330)).toBe(true);

            // Segunda às 17:30 — 30 min após, dentro da tolerância padrão de 60 min
            const monday1730 = new Date('2026-03-23T17:30:00');
            expect(myClass.isCallAllowedNow(monday1730)).toBe(true);

            // Segunda às 12:59 — 61 min antes, fora da tolerância
            const monday1259 = new Date('2026-03-23T12:59:00');
            expect(myClass.isCallAllowedNow(monday1259, 60)).toBe(false);
        });

        it('should use current date by default in isCallAllowedNow', () => {
            const schedule = new WeeklySchedule(['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'], '00:00', '23:59');
            const myClass = new Class('c1', 'Always Open', schedule);
            expect(myClass.isCallAllowedNow()).toBe(true);
        });
    });

    describe('WeeklySchedule default params', () => {
        it('should use current date by default in includesNow', () => {
            const schedule = new WeeklySchedule(['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'], '00:00', '23:59');
            expect(schedule.includesNow()).toBe(true);
        });
    });
});

