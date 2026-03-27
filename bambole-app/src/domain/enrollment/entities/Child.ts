import { ChildName } from '../value-objects/ChildName';

export class Child {
    constructor(
        public readonly id: string,
        public readonly name: ChildName,
        public readonly birthDate?: Date,
        public readonly classId?: string | null,
        public readonly photoUrl?: string
    ) { }
}
