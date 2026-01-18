// Metal and item definitions for the game

export const METALS = [
    { id: 'aluminum', name: 'Aluminum', emoji: '🥫', tier: 1, baseValue: 1, spawnRate: 0.40, minDetector: 1, color: '#9ca3af' },
    { id: 'copper', name: 'Copper', emoji: '🪙', tier: 2, baseValue: 5, spawnRate: 0.25, minDetector: 1, color: '#cd7f32' },
    { id: 'brass', name: 'Brass', emoji: '🔔', tier: 3, baseValue: 15, spawnRate: 0.15, minDetector: 2, color: '#d4af37' },
    { id: 'silver', name: 'Silver', emoji: '🥈', tier: 4, baseValue: 50, spawnRate: 0.10, minDetector: 3, color: '#c0c0c0' },
    { id: 'gold', name: 'Gold', emoji: '🥇', tier: 5, baseValue: 200, spawnRate: 0.06, minDetector: 5, color: '#ffd700' },
    { id: 'platinum', name: 'Platinum', emoji: '💎', tier: 6, baseValue: 500, spawnRate: 0.025, minDetector: 7, color: '#e5e4e2' },
    { id: 'palladium', name: 'Palladium', emoji: '✨', tier: 7, baseValue: 1500, spawnRate: 0.01, minDetector: 10, color: '#cec8b8' },
    { id: 'rhodium', name: 'Rhodium', emoji: '💠', tier: 8, baseValue: 5000, spawnRate: 0.004, minDetector: 15, color: '#b0c4de' },
    { id: 'meteorite', name: 'Meteorite', emoji: '☄️', tier: 9, baseValue: 20000, spawnRate: 0.0009, minDetector: 20, color: '#2d3748' },
    { id: 'unobtainium', name: 'Unobtainium', emoji: '🌟', tier: 10, baseValue: 100000, spawnRate: 0.0001, minDetector: 25, color: '#a855f7' }
];

export const VARIANTS = [
    { id: 'normal', name: 'Normal', multiplier: 1, chance: 1.0, cssClass: '', effect: null },
    { id: 'shiny', name: 'Shiny', multiplier: 2, chance: 0.10, cssClass: 'shiny', effect: 'sparkle', emoji: '✨' },
    { id: 'large', name: 'Large', multiplier: 3, chance: 0.05, cssClass: 'large', effect: 'scale-up', emoji: '📏' },
    { id: 'giant', name: 'Giant', multiplier: 8, chance: 0.01, cssClass: 'giant', effect: 'shake', emoji: '🗿' },
    { id: 'pure', name: 'Pure', multiplier: 5, chance: 0.02, cssClass: 'pure', effect: 'glow', emoji: '💠' },
    { id: 'rainbow', name: 'Rainbow', multiplier: 10, chance: 0.005, cssClass: 'rainbow', effect: 'rainbow', emoji: '🌈' },
    { id: 'ancient', name: 'Ancient', multiplier: 15, chance: 0.002, cssClass: 'ancient', effect: 'runes', emoji: '🏛️' },
    { id: 'cursed', name: 'Cursed', multiplier: 20, chance: 0.001, cssClass: 'cursed', effect: 'flames', emoji: '💀' },
    { id: 'celestial', name: 'Celestial', multiplier: 50, chance: 0.0002, cssClass: 'celestial', effect: 'stars', emoji: '⭐' },
    { id: 'mythic', name: 'Mythic', multiplier: 100, chance: 0.00005, cssClass: 'mythic', effect: 'all', emoji: '👑' }
];

export const DETECTORS = [
    { id: 'starter', name: 'Starter', level: 1, cost: 0, depth: 1, rarityBonus: 0, description: 'Basic metal detector' },
    { id: 'scout', name: 'Scout', level: 2, cost: 50, depth: 2, rarityBonus: 0.05, description: 'Faster beeps' },
    { id: 'hunter', name: 'Hunter', level: 3, cost: 200, depth: 3, rarityBonus: 0.10, description: 'Shows metal type hint' },
    { id: 'pro', name: 'Pro', level: 4, cost: 1000, depth: 5, rarityBonus: 0.20, description: 'Pinpoint mode' },
    { id: 'elite', name: 'Elite', level: 5, cost: 5000, depth: 8, rarityBonus: 0.35, description: 'Depth indicator' },
    { id: 'master', name: 'Master', level: 6, cost: 20000, depth: 12, rarityBonus: 0.50, description: 'Auto-identifies metal' },
    { id: 'legend', name: 'Legend', level: 7, cost: 100000, depth: 20, rarityBonus: 0.75, description: 'Detects variants' },
    { id: 'mythical', name: 'Mythical', level: 8, cost: 500000, depth: 50, rarityBonus: 1.00, description: 'Attracts rare metals' }
];

export const BAGS = [
    { id: 'starter', name: 'Starter Bag', level: 1, capacity: 10, cost: 0 },
    { id: 'small', name: 'Small Bag', level: 2, capacity: 25, cost: 100 },
    { id: 'medium', name: 'Medium Bag', level: 3, capacity: 50, cost: 500 },
    { id: 'large', name: 'Large Bag', level: 4, capacity: 100, cost: 2500 },
    { id: 'xl', name: 'XL Bag', level: 5, capacity: 200, cost: 10000 },
    { id: 'mega', name: 'Mega Bag', level: 6, capacity: 500, cost: 50000 },
    { id: 'ultra', name: 'Ultra Bag', level: 7, capacity: 1000, cost: 200000 },
    { id: 'infinite', name: 'Infinite Bag', level: 8, capacity: 999999, cost: 1000000 }
];

export const AREAS = [
    { id: 'beach', name: 'Starter Beach', cost: 0, theme: 'beach', groundColor: 0xf4d03f, exclusive: ['aluminum', 'copper'] },
    { id: 'park', name: 'City Park', cost: 500, theme: 'park', groundColor: 0x27ae60, exclusive: ['brass', 'silver'] },
    { id: 'farm', name: 'Farm Fields', cost: 2500, theme: 'farm', groundColor: 0x8b4513, exclusive: ['gold'] },
    { id: 'ruins', name: 'Ancient Ruins', cost: 10000, theme: 'ruins', groundColor: 0xbdc3c7, exclusive: ['platinum', 'palladium'] },
    { id: 'cemetery', name: 'Haunted Cemetery', cost: 50000, theme: 'cemetery', groundColor: 0x2c3e50, exclusive: ['rhodium', 'meteorite'] }
];

// Helper to get metal by ID
export function getMetalById(id) {
    return METALS.find(m => m.id === id);
}

// Helper to get variant by ID
export function getVariantById(id) {
    return VARIANTS.find(v => v.id === id);
}

// Helper to get rarity color based on tier
export function getRarityColor(tier) {
    if (tier <= 2) return '#9ca3af';  // Common
    if (tier <= 4) return '#22c55e';  // Uncommon
    if (tier <= 6) return '#3b82f6';  // Rare
    if (tier <= 8) return '#a855f7';  // Epic
    return '#ec4899';                  // Legendary/Mythic
}

// Helper to format large numbers
export function formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}
