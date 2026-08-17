import { Position } from '@xyflow/react';
import { describe, expect, it } from 'vitest';
import {
    getCenteredConnectorStyle,
    getConnectorPositions,
    getNextConnectorLayout,
} from './connectorPositions';

describe('connector positions', () => {
    it('centers connectors along both horizontal and vertical edges', () => {
        expect(getCenteredConnectorStyle(Position.Top)).toEqual({ left: '50%' });
        expect(getCenteredConnectorStyle(Position.Bottom)).toEqual({ left: '50%' });
        expect(getCenteredConnectorStyle(Position.Left)).toEqual({ top: '50%' });
        expect(getCenteredConnectorStyle(Position.Right)).toEqual({ top: '50%' });
    });

    it('rotates input and output positions clockwise', () => {
        expect(getNextConnectorLayout('vertical')).toBe('right-left');
        expect(getNextConnectorLayout('right-left')).toBe('vertical-reverse');
        expect(getNextConnectorLayout('vertical-reverse')).toBe('horizontal');
        expect(getNextConnectorLayout('horizontal')).toBe('vertical');
    });

    it('maps each layout to opposite connector sides', () => {
        expect(getConnectorPositions('vertical')).toEqual({
            inputPosition: Position.Top,
            outputPosition: Position.Bottom,
            titlePosition: Position.Left,
        });
        expect(getConnectorPositions('right-left')).toEqual({
            inputPosition: Position.Right,
            outputPosition: Position.Left,
            titlePosition: Position.Top,
        });
        expect(getConnectorPositions('vertical-reverse')).toEqual({
            inputPosition: Position.Bottom,
            outputPosition: Position.Top,
            titlePosition: Position.Right,
        });
        expect(getConnectorPositions('horizontal')).toEqual({
            inputPosition: Position.Left,
            outputPosition: Position.Right,
            titlePosition: Position.Bottom,
        });
    });
});
