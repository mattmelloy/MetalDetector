// Item Generator - Creates random items with rarity and variants

import { METALS, VARIANTS, getAreaById } from './metals.js';

export class ItemGenerator {
    constructor(detectorLevel = 1, rarityBonus = 0, currentArea = 'beach') {
        this.detectorLevel = detectorLevel;
        this.rarityBonus = rarityBonus;
        this.currentArea = currentArea;
    }

    setDetectorLevel(level, rarityBonus, currentArea = 'beach') {
        this.detectorLevel = level;
        this.rarityBonus = rarityBonus;
        this.currentArea = currentArea;
    }

    // Generate a random metal based on spawn rates
    generateMetal() {
        // Get current area's available metals
        const area = getAreaById(this.currentArea);
        const allowedMetalIds = area ? area.available : ['aluminum', 'copper'];

        // Filter valid metals that:
        // 1. Are in the area's allowed list
        // 2. Can be detected with current detector
        let availableMetals = METALS.filter(m =>
            allowedMetalIds.includes(m.id) &&
            m.minDetector <= this.detectorLevel
        );

        // Fallback Logic:
        // If no metals found (e.g. detector too low for area), 
        // fallback to the easiest metal allowed in this area
        if (availableMetals.length === 0) {
            // Find the lowest tier metal allowed in this area
            const lowestTierMetal = METALS
                .filter(m => allowedMetalIds.includes(m.id))
                .sort((a, b) => a.tier - b.tier)[0];

            if (lowestTierMetal) {
                return lowestTierMetal;
            } else {
                // Absolute fallback if something is wrong with data
                return METALS[0];
            }
        }

        // Apply rarity bonus to spawn rates
        const adjustedMetals = availableMetals.map(metal => ({
            ...metal,
            adjustedRate: metal.spawnRate * (1 + this.rarityBonus * (metal.tier / 5))
        }));

        // Normalize rates
        const totalRate = adjustedMetals.reduce((sum, m) => sum + m.adjustedRate, 0);
        const normalizedMetals = adjustedMetals.map(m => ({
            ...m,
            normalizedRate: m.adjustedRate / totalRate
        }));

        // Roll for metal
        let roll = Math.random();
        for (const metal of normalizedMetals) {
            roll -= metal.normalizedRate;
            if (roll <= 0) {
                return METALS.find(m => m.id === metal.id);
            }
        }

        return METALS.find(m => m.id === normalizedMetals[0].id) || METALS[0];
    }

    // Generate variants for an item (can have multiple!)
    generateVariants(multiplier = 1) {
        const variants = [];

        // Check each variant independently (except normal)
        for (const variant of VARIANTS) {
            if (variant.id === 'normal') continue;

            // Apply rarity bonus to variant chance
            const adjustedChance = variant.chance * (1 + this.rarityBonus) * multiplier;

            if (Math.random() < adjustedChance) {
                variants.push(variant);
            }
        }

        return variants;
    }

    // NEW: Reroll variants based on digging skill (signal strength)
    rerollVariants(item, signalStrength) {
        let skillMultiplier = 1;

        // "Almost a full full" - Massive boost for > 95% accuracy
        if (signalStrength >= 0.95) {
            skillMultiplier = 50; // Virtually guarantees Shiny, high chance for Rainbow
        } else if (signalStrength >= 0.85) {
            skillMultiplier = 10; // Good boost for steady hands
        } else if (signalStrength >= 0.70) {
            skillMultiplier = 2;  // Small bonus for decent signal
        }

        // Only reroll if we have a bonus (preserve pre-generated randomness otherwise)
        if (skillMultiplier > 1) {
            item.variants = this.generateVariants(skillMultiplier);
            item.value = this.calculateValue(item.metal, item.variants);
        }

        return item;
    }

    // Calculate total value of an item with variants
    calculateValue(metal, variants) {
        let value = metal.baseValue;

        for (const variant of variants) {
            value *= variant.multiplier;
        }

        return Math.floor(value);
    }

    // Generate a complete item
    generateItem() {
        const metal = this.generateMetal();
        const variants = this.generateVariants();
        const value = this.calculateValue(metal, variants);

        return {
            id: `${metal.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            metal: metal,
            variants: variants,
            value: value,
            foundAt: Date.now()
        };
    }

    // Generate an item at a specific position (for buried items)
    generateBuriedItem(x, z, depth = 1) {
        const item = this.generateItem();
        return {
            ...item,
            position: { x, y: -depth, z },
            depth: depth
        };
    }
}

// Create singleton instance
let generatorInstance = null;

export function getItemGenerator() {
    if (!generatorInstance) {
        generatorInstance = new ItemGenerator();
    }
    return generatorInstance;
}

export function updateGeneratorSettings(detectorLevel, rarityBonus, currentArea = 'beach') {
    getItemGenerator().setDetectorLevel(detectorLevel, rarityBonus, currentArea);
}
