// Item Generator - Creates random items with rarity and variants

import { METALS, VARIANTS } from './metals.js';

export class ItemGenerator {
    constructor(detectorLevel = 1, rarityBonus = 0) {
        this.detectorLevel = detectorLevel;
        this.rarityBonus = rarityBonus;
    }

    setDetectorLevel(level, rarityBonus) {
        this.detectorLevel = level;
        this.rarityBonus = rarityBonus;
    }

    // Generate a random metal based on spawn rates
    generateMetal() {
        // Filter metals that can be detected with current detector
        const availableMetals = METALS.filter(m => m.minDetector <= this.detectorLevel);

        if (availableMetals.length === 0) {
            return METALS[0]; // Fallback to aluminum
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

        return METALS[0]; // Fallback
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

export function updateGeneratorSettings(detectorLevel, rarityBonus) {
    getItemGenerator().setDetectorLevel(detectorLevel, rarityBonus);
}
