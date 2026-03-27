export class ChildName {
    private constructor(public readonly value: string) { }

    static create(name: string): ChildName {
        if (!name || name.trim().length < 2) {
            throw new Error('Invalid child name');
        }
        return new ChildName(name.trim());
    }
}
