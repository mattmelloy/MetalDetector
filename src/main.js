// Main Entry Point - Metal Detector Tycoon

import { GameScene } from './game/GameScene.js';
import { GameManager } from './game/GameManager.js';

class Game {
    constructor() {
        this.scene = null;
        this.manager = null;
        this.isRunning = false;

        // FPS limiting
        this.targetFPS = 30;
        this.frameInterval = 1000 / this.targetFPS;
        this.lastFrameTime = 0;

        this.init();
    }

    init() {
        // Get canvas
        const canvas = document.getElementById('game-canvas');
        if (!canvas) {
            console.error('Canvas not found!');
            return;
        }

        // Create Three.js scene
        this.scene = new GameScene(canvas);

        // Create game manager
        this.manager = new GameManager(this.scene);

        // Start game loop
        this.isRunning = true;
        this.gameLoop(0);

        console.log('🔍 Metal Detector Tycoon loaded!');
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;

        // Request next frame first
        requestAnimationFrame((time) => this.gameLoop(time));

        // Check if enough time has passed
        const elapsed = currentTime - this.lastFrameTime;
        if (elapsed < this.frameInterval) return;

        this.lastFrameTime = currentTime - (elapsed % this.frameInterval);

        // Update game logic
        this.manager.update();
    }

    stop() {
        this.isRunning = false;
    }
}

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
