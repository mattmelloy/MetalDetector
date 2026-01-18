// Save/Load system using LocalStorage

const SAVE_KEY = 'metal_detector_save';

const DEFAULT_SAVE = {
    coins: 0,
    totalCoinsEarned: 0,
    inventory: [],
    detectorLevel: 1,
    bagLevel: 1,
    unlockedAreas: ['beach'],
    currentArea: 'beach',
    stats: {
        itemsFound: 0,
        itemsSold: 0,
        variantsFound: 0,
        rareFinds: {}
    },
    achievements: [],
    rebirthCount: 0,
    lastPlayed: null
};

export function loadGame() {
    try {
        const saved = localStorage.getItem(SAVE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            // Merge with defaults to handle new properties
            return { ...DEFAULT_SAVE, ...data };
        }
    } catch (e) {
        console.warn('Failed to load save:', e);
    }
    return { ...DEFAULT_SAVE };
}

export function saveGame(gameState) {
    try {
        gameState.lastPlayed = Date.now();
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
        return true;
    } catch (e) {
        console.error('Failed to save:', e);
        return false;
    }
}

export function resetGame() {
    localStorage.removeItem(SAVE_KEY);
    return { ...DEFAULT_SAVE };
}

export function exportSave(gameState) {
    return btoa(JSON.stringify(gameState));
}

export function importSave(exportedString) {
    try {
        const data = JSON.parse(atob(exportedString));
        return { ...DEFAULT_SAVE, ...data };
    } catch (e) {
        console.error('Failed to import save:', e);
        return null;
    }
}
