// UI Manager - Handles all DOM interactions

import { formatNumber, getRarityColor, METALS, VARIANTS } from '../data/metals.js';

class UIManager {
    constructor() {
        this.elements = {};
        this.callbacks = {};
    }

    init(callbacks) {
        this.callbacks = callbacks;
        this.cacheElements();
        this.setupEventListeners();
    }

    cacheElements() {
        // HUD
        this.elements.coinCount = document.getElementById('coin-count');
        this.elements.bagCount = document.getElementById('bag-count');
        this.elements.bagMax = document.getElementById('bag-max');
        this.elements.detectorName = document.getElementById('detector-name');

        // Detection
        this.elements.signalBar = document.getElementById('signal-bar');
        this.elements.signalText = document.getElementById('signal-text');
        this.elements.digPrompt = document.getElementById('dig-prompt');
        this.elements.digProgressBar = document.getElementById('dig-progress-bar');

        // Scanner Info (Advanced)
        this.elements.scannerInfo = document.getElementById('scanner-info');
        this.elements.scannerLines = document.getElementById('scanner-lines');
        this.elements.scannerVariantAlert = document.getElementById('scanner-variant-alert');

        // Reveal
        this.elements.itemReveal = document.getElementById('item-reveal');
        this.elements.revealContent = document.getElementById('reveal-content');
        this.elements.revealItemIcon = document.getElementById('reveal-item-icon');
        this.elements.revealItemName = document.getElementById('reveal-item-name');
        this.elements.revealItemVariants = document.getElementById('reveal-item-variants');
        this.elements.revealValue = document.getElementById('reveal-value');
        this.elements.revealCollectBtn = document.getElementById('reveal-collect-btn');
        this.elements.revealItemDisplay = document.getElementById('reveal-item-display');

        // Shop
        this.elements.shopBtn = document.getElementById('shop-btn');
        this.elements.shopModal = document.getElementById('shop-modal');
        this.elements.sellItemsList = document.getElementById('sell-items-list');
        this.elements.sellTotal = document.getElementById('sell-total');
        this.elements.sellAllBtn = document.getElementById('sell-all-btn');
        this.elements.buyItemsList = document.getElementById('buy-items-list');

        // Inventory
        this.elements.inventoryBtn = document.getElementById('inventory-btn');
        this.elements.inventoryModal = document.getElementById('inventory-modal');
        this.elements.inventoryGrid = document.getElementById('inventory-grid');

        // Help
        this.elements.helpBtn = document.getElementById('help-btn');
        this.elements.helpModal = document.getElementById('help-modal');
        this.elements.encyclopediaGrid = document.getElementById('encyclopedia-grid');

        // Notifications
        this.elements.notifications = document.getElementById('notifications');
    }

    setupEventListeners() {
        // Shop button
        this.elements.shopBtn.addEventListener('click', () => {
            this.toggleModal('shop');
        });

        // Inventory button
        this.elements.inventoryBtn.addEventListener('click', () => {
            this.toggleModal('inventory');
        });

        // Help button
        this.elements.helpBtn.addEventListener('click', () => {
            this.toggleModal('help');
        });

        // Close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Modal backdrops
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Category switching
        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.switchCategory(category);
            });
        });

        // Sell all button
        this.elements.sellAllBtn.addEventListener('click', () => {
            if (this.callbacks.onSellAll) {
                this.callbacks.onSellAll();
            }
        });

        // Collect button
        this.elements.revealCollectBtn.addEventListener('click', () => {
            console.log('Collect button clicked!');
            if (this.callbacks.onCollect) {
                this.callbacks.onCollect();
            }
        });
    }

    // HUD Updates
    updateCoins(amount) {
        this.elements.coinCount.textContent = formatNumber(amount);
    }

    updateBag(current, max) {
        this.elements.bagCount.textContent = current;
        this.elements.bagMax.textContent = max;
    }

    updateDetector(name) {
        this.elements.detectorName.textContent = name;
    }

    // Detection Signal
    updateSignal(strength, text = null) {
        this.elements.signalBar.style.setProperty('--signal-strength', `${strength}%`);
        if (text) {
            this.elements.signalText.textContent = text;
        }
    }

    // Dig Prompt
    showDigPrompt(show = true) {
        this.elements.digPrompt.classList.toggle('hidden', !show);
    }

    updateDigProgress(progress) {
        this.elements.digProgressBar.style.width = `${progress}%`;
    }

    // Advanced Scanner Info
    updateScannerInfo(data) {
        if (!data) {
            this.elements.scannerInfo.classList.add('hidden');
            return;
        }

        this.elements.scannerInfo.classList.remove('hidden');
        this.elements.scannerLines.innerHTML = '';

        // Helper to add line
        const addLine = (label, value) => {
            const line = document.createElement('div');
            line.className = 'scanner-line';
            line.innerHTML = `<span class="scanner-label">${label}</span><span class="scanner-value">${value}</span>`;
            this.elements.scannerLines.appendChild(line);
        };

        if (data.hint) addLine('TARGET:', data.hint);
        if (data.depth) addLine('DEPTH:', data.depth);
        if (data.distance) addLine('DIST:', data.distance);

        // Variant alert
        if (data.isVariant) {
            this.elements.scannerVariantAlert.classList.remove('hidden');
        } else {
            this.elements.scannerVariantAlert.classList.add('hidden');
        }
    }

    // Item Reveal
    showItemReveal(item) {
        const rarityColor = getRarityColor(item.metal.tier);

        // Set CSS variable for glow color
        this.elements.revealContent.style.setProperty('--reveal-color', rarityColor);
        this.elements.revealItemDisplay.style.borderColor = rarityColor;

        // Set content
        this.elements.revealItemIcon.textContent = item.metal.emoji;
        this.elements.revealItemName.textContent = item.metal.name;
        this.elements.revealItemName.style.color = rarityColor;

        // Variants
        this.elements.revealItemVariants.innerHTML = '';
        for (const variant of item.variants) {
            const tag = document.createElement('span');
            tag.className = `variant-tag ${variant.cssClass}`;
            tag.textContent = `${variant.emoji} ${variant.name}`;
            this.elements.revealItemVariants.appendChild(tag);
        }

        // Value
        this.elements.revealValue.textContent = formatNumber(item.value);

        // Show modal
        this.elements.itemReveal.classList.remove('hidden');
    }

    hideItemReveal() {
        this.elements.itemReveal.classList.add('hidden');
    }

    // Modals
    toggleModal(type) {
        let modal;
        if (type === 'shop') modal = this.elements.shopModal;
        else if (type === 'inventory') modal = this.elements.inventoryModal;
        else if (type === 'help') modal = this.elements.helpModal;

        const isHidden = modal.classList.contains('hidden');

        this.closeAllModals();

        if (isHidden) {
            modal.classList.remove('hidden');
            if (this.callbacks.onModalOpen) {
                this.callbacks.onModalOpen(type);
            }
        }
    }

    closeAllModals() {
        this.elements.shopModal.classList.add('hidden');
        this.elements.inventoryModal.classList.add('hidden');
        this.elements.helpModal.classList.add('hidden');
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('hidden', !content.id.includes(tab));
            content.classList.toggle('active', content.id.includes(tab));
        });
    }

    switchCategory(category) {
        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        if (this.callbacks.onCategoryChange) {
            this.callbacks.onCategoryChange(category);
        }
    }

    // Inventory Display
    renderInventory(items) {
        this.elements.inventoryGrid.innerHTML = '';

        if (items.length === 0) {
            this.elements.inventoryGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">🎒</div>
                    <p>Your bag is empty!</p>
                    <p>Go find some treasures.</p>
                </div>
            `;
            return;
        }

        for (const item of items) {
            const el = document.createElement('div');
            el.className = 'inventory-item';
            if (item.variants.length > 0) {
                el.classList.add('has-variants');
            }
            el.style.borderColor = getRarityColor(item.metal.tier);

            el.innerHTML = `
                <span class="item-icon">${item.metal.emoji}</span>
                <span class="item-value">🪙 ${formatNumber(item.value)}</span>
            `;

            this.elements.inventoryGrid.appendChild(el);
        }
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

    // Sell Items Display
    renderSellItems(items) {
        this.elements.sellItemsList.innerHTML = '';

        if (items.length === 0) {
            this.elements.sellItemsList.innerHTML = `
                <div class="empty-state">
    <div class="empty-state-icon">📦</div>
    <p>Nothing to sell</p>
</div>
`;
            this.elements.sellAllBtn.disabled = true;
            return;
        }

        this.elements.sellAllBtn.disabled = false;

        for (const item of items) {
            const el = document.createElement('div');
            el.className = 'item-row';

            let variantsHtml = '';
            for (const v of item.variants) {
                variantsHtml += `<span class="variant-tag ${v.cssClass}">${v.emoji}</span>`;
            }

            el.innerHTML = `
                <span class="item-icon">${item.metal.emoji}</span>
                <div class="item-info">
                    <div class="item-name">${item.metal.name}</div>
                    <div class="item-variants">${variantsHtml}</div>
                </div>
                <div class="item-value">
                    <span class="coin-icon">🪙</span>
                    <span>${formatNumber(item.value)}</span>
                </div>
`;

            this.elements.sellItemsList.appendChild(el);
        }

        // Update total
        const total = items.reduce((sum, item) => sum + item.value, 0);
        this.elements.sellTotal.textContent = formatNumber(total);
    }

    // Buy Items Display
    renderBuyItems(items, gameState, onBuy) {
        this.elements.buyItemsList.innerHTML = '';

        for (const item of items) {
            const el = document.createElement('div');
            el.className = 'buy-item-row';

            const isOwned = this.checkOwned(item, gameState);
            const canAfford = gameState.coins >= item.cost;

            el.innerHTML = `
                <span class="item-icon">${item.level <= 3 ? '📡' : item.level <= 5 ? '🔍' : '📻'}</span>
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-desc" style="font-size: 0.8rem; color: var(--text-muted);">${item.description || ''}</div>
                </div>
                <div class="item-cost">
                    <span class="coin-icon">🪙</span>
                    <span>${formatNumber(item.cost)}</span>
                </div>
                <button class="buy-btn ${isOwned ? 'owned' : ''}" ${isOwned || !canAfford ? 'disabled' : ''}>
                    ${isOwned ? '✓ Owned' : 'Buy'}
                </button>
`;

            if (!isOwned && canAfford) {
                el.querySelector('.buy-btn').addEventListener('click', () => {
                    onBuy(item);
                });
            }

            this.elements.buyItemsList.appendChild(el);
        }
    }

    checkOwned(item, gameState) {
        if (item.level !== undefined) {
            // Detector or bag
            if (item.depth !== undefined) {
                return gameState.detectorLevel >= item.level;
            } else if (item.capacity !== undefined) {
                return gameState.bagLevel >= item.level;
            }
        }
        if (item.theme !== undefined) {
            return gameState.unlockedAreas.includes(item.id);
        }
        return false;
    }

    // Encyclopedia
    renderEncyclopedia() {
        this.elements.encyclopediaGrid.innerHTML = '';

        for (const metal of METALS) {
            const el = document.createElement('div');
            el.className = 'encyclopedia-item';
            el.style.borderColor = getRarityColor(metal.tier);

            el.innerHTML = `
                <div class="icon">${metal.emoji}</div>
                <div class="details">
                    <h4 style="color: ${getRarityColor(metal.tier)}">${metal.name}</h4>
                    <div class="meta">
                        <span>Base Value: 🪙 ${formatNumber(metal.baseValue)}</span>
                        <span>Rarity: ${(metal.spawnRate * 100).toFixed(1)}%</span>
                        <span>Min Detector: Lvl ${metal.minDetector}</span>
                    </div>
                </div>
            `;
            this.elements.encyclopediaGrid.appendChild(el);
        }
    }

    // Notifications
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type} `;
        notification.innerHTML = message;

        this.elements.notifications.appendChild(notification);

        // Remove after animation
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Singleton
let uiInstance = null;

export function getUI() {
    if (!uiInstance) {
        uiInstance = new UIManager();
    }
    return uiInstance;
}
