import { AttendanceRecord } from '@/domain/attendance/entities/AttendanceRecord';
import { AttendanceStatus } from '@/domain/attendance/value-objects/AttendanceStatus';

describe('Attendance Domain', () => {
    const childId = 'c1';
    const classId = 'cl1';
    const monitorId = 'm1';
    const date = new Date('2026-03-27');

    it('should create a present record with geolocation', () => {
        const record = AttendanceRecord.createPresent(
            childId, classId, monitorId, date, { lat: -23.5, lng: -46.6 }
        );

        expect(record.status.value).toBe('present');
        expect(record.geolocation?.lat).toBe(-23.5);
    });

    it('should create an absent record', () => {
        const record = AttendanceRecord.createAbsent(childId, classId, monitorId, date);
        expect(record.status.value).toBe('absent');
    });

    it('should pre-justify an absence', () => {
        const record = AttendanceRecord.createAbsent(childId, classId, monitorId, date);
        record.preJustify('Consulta médica');

        expect(record.status.value).toBe('pre_justified');
        expect(record.justificationNote).toBe('Consulta médica');
    });

    it('should justify retroactively', () => {
        const record = AttendanceRecord.createAbsent(childId, classId, monitorId, date);
        record.justifyRetroactively('Atraso no ônibus');

        expect(record.status.value).toBe('justified');
        expect(record.justificationNote).toBe('Atraso no ônibus');
    });
});
