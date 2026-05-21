/**
 * Generates a robust, runtime-agnostic RFC 4122 version 4 compliant UUID.
 * This works consistently across React Native (Hermes/JSC), web browsers, and Node/Jest testing environments.
 */
export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
