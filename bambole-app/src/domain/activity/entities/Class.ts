export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export class WeeklySchedule {
    constructor(
        public readonly days: DayOfWeek[],
        public readonly startTime: string, // "HH:MM"
        public readonly endTime: string    // "HH:MM"
    ) { }

    includesNow(now: Date = new Date()): boolean {
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

        return currentTotal >= startTotal && currentTotal <= endTotal;
    }
}

export class Class {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly weeklySchedule: WeeklySchedule,
        public readonly description?: string,
        public readonly ageRange?: string
    ) { }

    isCallAllowedNow(now: Date = new Date()): boolean {
        return this.weeklySchedule.includesNow(now);
    }
}
