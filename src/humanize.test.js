import { describe, expect, it } from 'vitest';
import { humanize } from './humanize';

describe('humanize', () => {
    it('abbreviates values in the thousands', () => {
        expect(humanize(25000)).toBe('25k');
        expect(humanize(1250)).toBe('1.25k');
        expect(humanize(-25000)).toBe('-25k');
    });

    it('uses progressively larger suffixes', () => {
        expect(humanize(1250000)).toBe('1.25m');
        expect(humanize(2500000000)).toBe('2.5b');
        expect(humanize(999999)).toBe('1m');
    });

    it('formats values below one thousand without a suffix', () => {
        expect(humanize(999)).toBe('999');
        expect(humanize(12.345)).toBe('12.3');
    });
});
