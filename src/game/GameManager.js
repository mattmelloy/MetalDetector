// Game Manager - Core game state and logic

import { DETECTORS, BAGS, AREAS, formatNumber } from '../data/metals.js';
import { loadGame, saveGame } from '../data/save.js';
import { ItemGenerator, updateGeneratorSettings } from '../data/itemGenerator.js';
import { getUI } from '../ui/UIManager.js';
import { getAudio } from '../audio/AudioManager.js';

export class GameManager {
    constructor(scene) {
        this.scene = scene;
        this.ui = getUI();
        this.audio = getAudio();

        // Game state
        this.state = loadGame();
        this.itemGenerator = new ItemGenerator();

        // Detection state
        this.currentSignal = 0;
        this.targetItem = null;
        this.detectionRadius = 5;

        // Digging state
        this.isDigging = false;
        this.digProgress = 0;
        this.digSpeed = 2; // % per frame when holding

        // Reveal state
        this.pendingItem = null;

        // Keys
        this.keys = {};

        this.init();
    }

    init() {
        // Update generator with current detector level
        const detector = this.getCurrentDetector();
        updateGeneratorSettings(detector.level, detector.rarityBonus);

        // Initialize UI
        this.ui.init({
            onSellAll: () => this.sellAllItems(),
            onCollect: () => this.collectPendingItem(),
            onModalOpen: (type) => this.onModalOpen(type),
            onCategoryChange: (cat) => this.renderBuyCategory(cat)
        });

        // Initialize audio
        this.audio.init();

        // Initialize audio
        this.audio.init();

        // Update HUD
        this.updateHUD();

        // Load current area theme
        const areaId = this.state.currentArea || 'beach';
        const area = AREAS.find(a => a.id === areaId);
        if (area) {
            this.scene.loadArea(area.theme, area.groundColor);
        }

        // Spawn initial items
        this.spawnItems();

        // Input listeners
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Auto-save
        setInterval(() => this.save(), 30000);
    }

    getCurrentDetector() {
        return DETECTORS.find(d => d.level === this.state.detectorLevel) || DETECTORS[0];
    }

    getCurrentBag() {
        return BAGS.find(b => b.level === this.state.bagLevel) || BAGS[0];
    }

    updateHUD() {
        this.ui.updateCoins(this.state.coins);
        this.ui.updateBag(this.state.inventory.length, this.getCurrentBag().capacity);
        this.ui.updateDetector(this.getCurrentDetector().name);
    }

    spawnItems() {
        const items = [];
        const itemCount = 30; // Number of buried items

        for (let i = 0; i < itemCount; i++) {
            const x = (Math.random() - 0.5) * 70;
            const z = (Math.random() - 0.5) * 55;
            const item = this.itemGenerator.generateBuriedItem(x, z, 1);
            items.push(item);
        }

        this.scene.spawnBuriedItems(items);
    }

    onKeyDown(e) {
        this.keys[e.code] = true;
    }

    onKeyUp(e) {
        this.keys[e.code] = false;

        // Reset dig progress if stopped digging
        if (e.code === 'Space') {
            this.isDigging = false;
            this.digProgress = 0;
            this.ui.updateDigProgress(0);
        }
    }

    update() {
        // Update detector position from mouse
        const worldPos = this.scene.getMouseWorldPosition();
        if (worldPos) {
            this.scene.updateDetectorPosition(worldPos.x, worldPos.z);
        }

        // Check for nearby items
        const closest = this.scene.getClosestItem();
        if (closest && closest.distance < this.detectionRadius) {
            // Calculate signal strength (0-1)
            this.currentSignal = 1 - (closest.distance / this.detectionRadius);
            this.targetItem = closest.item;

            // Update UI
            const signalPercent = Math.floor(this.currentSignal * 100);
            let signalText = 'Weak Signal';
            if (this.currentSignal > 0.95) signalText = '🌟 PERFECT! 🌟';
            else if (this.currentSignal > 0.7) signalText = 'STRONG SIGNAL!';
            else if (this.currentSignal > 0.4) signalText = 'Medium Signal';

            this.ui.updateSignal(signalPercent, signalText);
            this.scene.updateDetectorSignal(this.currentSignal);

            // Update audio beeping
            this.audio.updateBeepIntensity(this.currentSignal);

            // Show dig prompt if close enough
            if (this.currentSignal > 0.7) {
                this.ui.showDigPrompt(true);

                // Handle digging
                if (this.keys['Space']) {
                    this.handleDigging();
                }
            } else {
                this.ui.showDigPrompt(false);
            }

            // Advanced Detector Features logic
            const detectorLevel = this.state.detectorLevel;
            const scannerData = {};

            // Level 3+ (Hunter): Metal Hints
            if (detectorLevel >= 3 && this.currentSignal > 0.4) {
                // Fuzzy logic: only show accurate hint if signal is decent
                scannerData.hint = `Probable: ${this.targetItem.data.metal.name}`;
            }

            // Level 4+ (Pro): Pinpoint Distance
            if (detectorLevel >= 4) {
                // Show precise distance to center
                scannerData.distance = `${closest.distance.toFixed(2)}m`;
            }

            // Level 5+ (Elite): Depth Indicator
            if (detectorLevel >= 5 && this.currentSignal > 0.5) {
                // Show depth
                scannerData.depth = `${this.targetItem.data.depth}m`;
            }

            // Level 6+ (Master): Auto-Identify
            if (detectorLevel >= 6 && this.currentSignal > 0.6) {
                // Confirm identity
                scannerData.hint = `ID: ${this.targetItem.data.metal.emoji} ${this.targetItem.data.metal.name}`;
            }

            // Level 7+ (Legend): Variant Detection
            if (detectorLevel >= 7 && this.currentSignal > 0.8) {
                if (this.targetItem.data.variants && this.targetItem.data.variants.length > 0) {
                    scannerData.isVariant = true;
                }
            }

            // Update Scanner UI if we have any data
            if (Object.keys(scannerData).length > 0) {
                this.ui.updateScannerInfo(scannerData);
            } else {
                this.ui.updateScannerInfo(null);
            }

        } else {
            this.currentSignal = 0;
            this.targetItem = null;
            this.ui.updateSignal(0, 'Scanning...');
            this.scene.updateDetectorSignal(0);
            this.audio.stopContinuousBeep();
            this.ui.showDigPrompt(false);
            this.ui.updateScannerInfo(null);
        }

        // Render scene
        this.scene.render();
    }

    handleDigging() {
        if (!this.targetItem || this.pendingItem) return;

        this.isDigging = true;

        // Precision bonus: Up to 3x speed for perfect signal
        const speedMultiplier = 0.5 + (this.currentSignal * 2.5);
        this.digProgress += this.digSpeed * speedMultiplier;

        this.ui.updateDigProgress(this.digProgress);

        // Play dig sound occasionally
        if (Math.random() < 0.1) {
            this.audio.playDigSound();
        }

        // Complete dig
        if (this.digProgress >= 100) {
            this.completeDig();
        }
    }

    completeDig() {
        if (!this.targetItem) return;

        // Apply skill bonus! Reroll variants based on signal strength
        this.itemGenerator.rerollVariants(this.targetItem.data, this.currentSignal);

        // Apply precision bonus
        let finalItem = this.targetItem.data;
        if (this.currentSignal > 0.9) {
            console.log('Attempting upgrade with signal:', this.currentSignal);
            try {
                finalItem = this.itemGenerator.upgradeItem(finalItem, this.currentSignal);
                console.log('Upgrade successful:', finalItem);
            } catch (e) {
                console.error('Upgrade failed:', e);
            }

            if (finalItem.value > this.targetItem.data.value) {
                this.audio.playRevealSound(finalItem.metal.tier + 2);
                this.ui.showNotification('✨ Precision Bonus! Item Upgraded!', 'success');
            }
        } else {
            console.log('Normal dig, signal:', this.currentSignal);
        }

        // Stop beeping
        this.audio.stopContinuousBeep();

        // Dig up the item visually
        this.scene.digItem(this.targetItem);

        // Use the (potentially upgraded) final item
        this.pendingItem = finalItem;

        // Add sparkles
        this.scene.addSparkles(
            this.targetItem.data.position.x,
            1,
            this.targetItem.data.position.z,
            parseInt(finalItem.metal.color.replace('#', '0x'))
        );

        // Play reveal sound
        this.audio.playRevealSound(finalItem.metal.tier);

        // Show reveal UI
        this.ui.showItemReveal(finalItem);

        // Update stats
        this.state.stats.itemsFound++;
        if (finalItem.variants.length > 0) {
            this.state.stats.variantsFound++;
        }

        // Reset dig state
        this.isDigging = false;
        this.digProgress = 0;
        this.ui.updateDigProgress(0);
        this.ui.showDigPrompt(false);
        this.targetItem = null;
    }

    collectPendingItem() {
        if (!this.pendingItem) return;

        const bag = this.getCurrentBag();

        // Check bag capacity
        if (this.state.inventory.length >= bag.capacity) {
            this.ui.showNotification('❌ Bag is full!', 'error');
            this.audio.playErrorSound();
            this.ui.hideItemReveal();
            this.pendingItem = null;
            return;
        }

        // Add to inventory
        this.state.inventory.push(this.pendingItem);
        this.audio.playCoinSound();

        // Update UI
        this.ui.hideItemReveal();
        this.updateHUD();

        // Show notification
        let variantText = '';
        if (this.pendingItem.variants.length > 0) {
            variantText = this.pendingItem.variants.map(v => v.emoji).join('');
        }
        this.ui.showNotification(
            `${variantText} ${this.pendingItem.metal.emoji} ${this.pendingItem.metal.name} collected!`,
            'success'
        );

        this.pendingItem = null;

        // Maybe spawn new item to replace
        if (Math.random() < 0.7) {
            this.spawnSingleItem();
        }
    }

    spawnSingleItem() {
        const x = (Math.random() - 0.5) * 70;
        const z = (Math.random() - 0.5) * 55;
        const item = this.itemGenerator.generateBuriedItem(x, z, 1);

        // Add to scene's buried items
        const items = [...this.scene.buriedItems.filter(i => !i.found).map(i => i.data), item];
        this.scene.spawnBuriedItems(items);
    }

    // Modal handlers
    onModalOpen(type) {
        if (type === 'shop') {
            this.ui.renderSellItems(this.state.inventory);
            this.renderBuyCategory('detectors');
        } else if (type === 'inventory') {
            this.ui.renderInventory(this.state.inventory);
        } else if (type === 'help') {
            this.ui.renderEncyclopedia();
        }
    }

    renderBuyCategory(category) {
        let items = [];
        if (category === 'detectors') {
            items = DETECTORS;
        } else if (category === 'bags') {
            items = BAGS;
        } else if (category === 'areas') {
            items = AREAS;
        }

        this.ui.renderBuyItems(items, this.state, (item) => this.buyItem(item, category));
    }

    buyItem(item, category) {
        if (this.state.coins < item.cost) {
            this.audio.playErrorSound();
            return;
        }

        // Deduct cost
        this.state.coins -= item.cost;

        // Apply purchase
        if (category === 'detectors') {
            this.state.detectorLevel = item.level;
            const detector = this.getCurrentDetector();
            updateGeneratorSettings(detector.level, detector.rarityBonus);
        } else if (category === 'bags') {
            this.state.bagLevel = item.level;
        } else if (category === 'areas') {
            this.state.unlockedAreas.push(item.id);
            // Auto-switch to new area
            this.state.currentArea = item.id;
            this.scene.loadArea(item.theme, item.groundColor);
            this.spawnItems(); // Respawn with new area exclusives
        }

        this.audio.playCoinSound();
        this.updateHUD();
        this.renderBuyCategory(category);
        this.ui.showNotification(`🎉 Purchased ${item.name}!`, 'success');
        this.save();
    }

    sellAllItems() {
        if (this.state.inventory.length === 0) return;

        const total = this.state.inventory.reduce((sum, item) => sum + item.value, 0);
        const count = this.state.inventory.length;

        // Apply bulk bonus (+10% for 50+ items)
        const bonus = count >= 50 ? 0.1 : 0;
        const finalTotal = Math.floor(total * (1 + bonus));

        this.state.coins += finalTotal;
        this.state.totalCoinsEarned += finalTotal;
        this.state.stats.itemsSold += count;
        this.state.inventory = [];

        this.audio.playCoinSound();
        this.updateHUD();
        this.ui.renderSellItems([]);

        let message = `🪙 Sold ${count} items for ${formatNumber(finalTotal)} coins!`;
        if (bonus > 0) {
            message += ' (+10% bulk bonus!)';
        }
        this.ui.showNotification(message, 'coin');

        this.save();
    }

    save() {
        saveGame(this.state);
    }
}
