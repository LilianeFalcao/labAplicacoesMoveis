export class Guardian {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly imageConsent: boolean,
        public readonly imageConsentAt?: Date
    ) { }
}
