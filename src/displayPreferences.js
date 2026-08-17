const DISPLAY_PREFERENCES_KEY = 'satisflow-display-preferences';
const BACKGROUND_VARIANTS = ['lines', 'dots', 'cross', 'blueprint'];

const getDefaultDisplayPreferences = () => ({
    backgroundVariant: 'dots',
    colorMode: 'light',
});

const readDisplayPreferences = (storage = window.localStorage) => {
    try {
        const stored = JSON.parse(storage.getItem(DISPLAY_PREFERENCES_KEY));

        return {
            backgroundVariant: BACKGROUND_VARIANTS.includes(stored?.backgroundVariant)
                ? stored.backgroundVariant
                : 'dots',
            colorMode: stored?.colorMode === 'dark' ? 'dark' : 'light',
        };
    } catch {
        return getDefaultDisplayPreferences();
    }
};

const writeDisplayPreferences = (preferences, storage = window.localStorage) => {
    try {
        storage.setItem(DISPLAY_PREFERENCES_KEY, JSON.stringify({
            backgroundVariant: BACKGROUND_VARIANTS.includes(preferences.backgroundVariant)
                ? preferences.backgroundVariant
                : 'dots',
            colorMode: preferences.colorMode === 'dark' ? 'dark' : 'light',
        }));
    } catch {
        // The app remains usable when browser storage is unavailable.
    }
};

export {
    getDefaultDisplayPreferences,
    readDisplayPreferences,
    writeDisplayPreferences,
};
