import { describe, expect, it } from 'vitest';
import { readDisplayPreferences, writeDisplayPreferences } from './displayPreferences';

const createStorage = (initialValue = null) => {
    let value = initialValue;

    return {
        getItem: () => value,
        setItem: (key, nextValue) => {
            value = nextValue;
        },
    };
};

describe('display preferences', () => {
    it('stores background and color mode locally', () => {
        const storage = createStorage();

        writeDisplayPreferences({ backgroundVariant: 'cross', colorMode: 'dark' }, storage);

        expect(readDisplayPreferences(storage)).toEqual({
            backgroundVariant: 'cross',
            colorMode: 'dark',
        });
    });

    it('stores the blueprint background preference', () => {
        const storage = createStorage();

        writeDisplayPreferences({ backgroundVariant: 'blueprint', colorMode: 'light' }, storage);

        expect(readDisplayPreferences(storage).backgroundVariant).toBe('blueprint');
    });

    it('uses defaults for invalid stored values', () => {
        const storage = createStorage('{"backgroundVariant":"grid","colorMode":"blue"}');

        expect(readDisplayPreferences(storage)).toEqual({
            backgroundVariant: 'dots',
            colorMode: 'light',
        });
    });
});
