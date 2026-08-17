import { Background } from '@xyflow/react';

const BLUEPRINT_COLORS = {
  light: {
    background: '#ffffff',
    major: '#edf0f2',
    minor: '#f7f8f9',
  },
  dark: {
    background: '#121212',
    major: '#232629',
    minor: '#181a1c',
  },
};

export default function BlueprintBackground({ colorMode }) {
    const colors = BLUEPRINT_COLORS[colorMode === 'dark' ? 'dark' : 'light'];

    return (
        <>
            <Background
                id="blueprint-minor"
                bgColor={colors.background}
                color={colors.minor}
                gap={20}
                lineWidth={0.65}
                variant="lines"
            />
            <Background
                id="blueprint-major"
                color={colors.major}
                gap={100}
                lineWidth={1}
                style={{ backgroundColor: 'transparent' }}
                variant="lines"
            />
        </>
    );
}
