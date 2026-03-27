import { Email } from '../value-objects/Email';
import { Role } from '../value-objects/Role';

export class User {
    constructor(
        public readonly id: string,
        public readonly email: Email,
        public readonly role: Role,
    ) { }
}
