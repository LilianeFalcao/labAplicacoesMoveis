export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export class WeeklySchedule {
    constructor(
        public readonly days: DayOfWeek[],
        public readonly startTime: string, // "HH:MM"
        public readonly endTime: string    // "HH:MM"
    ) { }

    /**
     * Returns true if the given date/time falls within the scheduled window,
     * plus an optional tolerance buffer (in minutes) before start and after end.
     * @param now - The date/time to check (defaults to current time)
     * @param toleranceMinutes - Buffer in minutes added before start and after end (default: 60)
     */
    includesNow(now: Date = new Date(), toleranceMinutes: number = 60): boolean {
        const dayNames: DayOfWeek[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const currentDay = dayNames[now.getDay()];

        if (!this.days.includes(currentDay)) return false;

        const [startH, startM] = this.startTime.split(':').map(Number);
        const [endH, endM] = this.endTime.split(':').map(Number);

        const currentH = now.getHours();
        const currentM = now.getMinutes();

        const currentTotal = currentH * 60 + currentM;
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;

        return currentTotal >= (startTotal - toleranceMinutes) && currentTotal <= (endTotal + toleranceMinutes);
    }
}

export class Class {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly weeklySchedule: WeeklySchedule,
        public readonly description?: string,
        public readonly ageRange?: string,
        public readonly monitorId?: string
    ) { }

    /**
     * Returns true if a class call is allowed at the given time.
     * @param now - The date/time to check (defaults to current time)
     * @param toleranceMinutes - Buffer in minutes before/after the scheduled window (default: 60)
     */
    isCallAllowedNow(now: Date = new Date(), toleranceMinutes: number = 60): boolean {
        return this.weeklySchedule.includesNow(now, toleranceMinutes);
    }
}
