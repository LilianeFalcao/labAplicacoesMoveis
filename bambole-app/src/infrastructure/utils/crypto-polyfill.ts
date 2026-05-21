/**
 * Safe, runtime-agnostic Web Crypto API polyfill for React Native (Hermes/JSC).
 * This prevents crashes in libraries (like Supabase, uuid, etc.) that expect global.crypto to exist.
 *
 * Injects into all available global scopes (globalThis, global, window) to ensure
 * compatibility with Hermes, which may expose the global object as globalThis rather than global.
 */

const getRandomValuesPolyfill = function <T extends Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array>(array: T): T {
    if (!array) {
        throw new Error('crypto.getRandomValues requires a valid TypedArray parameter');
    }

    // Fill the typed array with random values matching the limits of the typed array type
    for (let i = 0; i < array.length; i++) {
        if (array instanceof Int8Array) {
            array[i] = Math.floor(Math.random() * 256) - 128;
        } else if (array instanceof Uint8Array || array instanceof Uint8ClampedArray) {
            array[i] = Math.floor(Math.random() * 256);
        } else if (array instanceof Int16Array) {
            array[i] = Math.floor(Math.random() * 65536) - 32768;
        } else if (array instanceof Uint16Array) {
            array[i] = Math.floor(Math.random() * 65536);
        } else if (array instanceof Int32Array) {
            array[i] = Math.floor(Math.random() * 4294967296) - 2147483648;
        } else if (array instanceof Uint32Array) {
            array[i] = Math.floor(Math.random() * 4294967296);
        } else {
            // General fallback for floating point arrays (Float32Array, Float64Array)
            array[i] = Math.random();
        }
    }
    return array;
};

const randomUUIDPolyfill = function (): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

// Collect all available global targets — Hermes may expose globalThis but not global
const globalTargets: any[] = [];
if (typeof globalThis !== 'undefined') globalTargets.push(globalThis);
if (typeof global !== 'undefined' && !globalTargets.includes(global)) globalTargets.push(global);
if (typeof window !== 'undefined' && !globalTargets.includes(window)) globalTargets.push(window);

for (const target of globalTargets) {
    if (!target.crypto) {
        target.crypto = {};
    }
    if (!target.crypto.getRandomValues) {
        target.crypto.getRandomValues = getRandomValuesPolyfill;
    }
    if (!target.crypto.randomUUID) {
        target.crypto.randomUUID = randomUUIDPolyfill;
    }
}
