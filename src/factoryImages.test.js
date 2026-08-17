import { describe, expect, it } from 'vitest';
import { getFactoryImagePath } from './factoryImages';

describe('factory images', () => {
    it('maps constructor classes to their factory image', () => {
        expect(getFactoryImagePath({ className: 'Build_ConstructorMk1_C' }))
            .toBe('./img/factories/constructor.png');
    });

    it('prefers an image explicitly defined by factory data', () => {
        expect(getFactoryImagePath({
            className: 'Build_ConstructorMk1_C',
            img: 'custom.png',
        })).toBe('./img/factories/custom.png');
    });

    it('returns null when no factory image is available', () => {
        expect(getFactoryImagePath({ className: 'Build_Blender_C' })).toBeNull();
    });
});
