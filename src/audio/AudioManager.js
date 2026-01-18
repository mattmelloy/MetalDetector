// Audio Manager - Handles all game sounds

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.beepOscillator = null;
        this.beepGain = null;
    }

    init() {
        // Create audio context on first user interaction
        const initAudio = () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            document.removeEventListener('click', initAudio);
            document.removeEventListener('keydown', initAudio);
        };

        document.addEventListener('click', initAudio);
        document.addEventListener('keydown', initAudio);
    }

    // Metal detector beep - pitch increases with proximity
    playDetectorBeep(intensity = 0.5) {
        if (!this.audioContext || !this.enabled) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        // Frequency based on intensity (300-1000 Hz)
        oscillator.frequency.value = 300 + (intensity * 700);
        oscillator.type = 'sine';

        gainNode.gain.value = 0.1 * intensity;

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }

    // Continuous beeping based on proximity
    startContinuousBeep(intensity = 0.5) {
        if (!this.audioContext || !this.enabled) return;

        // Calculate beep interval based on intensity
        const interval = Math.max(50, 500 - (intensity * 450));

        // Clear existing interval
        if (this.beepInterval) {
            clearInterval(this.beepInterval);
        }

        this.beepInterval = setInterval(() => {
            this.playDetectorBeep(intensity);
        }, interval);
    }

    stopContinuousBeep() {
        if (this.beepInterval) {
            clearInterval(this.beepInterval);
            this.beepInterval = null;
        }
    }

    updateBeepIntensity(intensity) {
        // Only update if intensity changed significantly (throttle)
        if (Math.abs(intensity - (this.lastIntensity || 0)) < 0.05) return;
        this.lastIntensity = intensity;

        if (intensity > 0.1) {
            this.startContinuousBeep(intensity);
        } else {
            this.stopContinuousBeep();
        }
    }

    // Dig sound
    playDigSound() {
        if (!this.audioContext || !this.enabled) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.value = 150;

        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    // Item found sound - fanfare based on rarity
    playRevealSound(tier = 1) {
        if (!this.audioContext || !this.enabled) return;

        const baseFreq = 400 + (tier * 50);
        const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];

        notes.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.value = freq;

            const startTime = this.audioContext.currentTime + (i * 0.1);
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.3);
        });
    }

    // Coin/sell sound
    playCoinSound() {
        if (!this.audioContext || !this.enabled) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1320, this.audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }

    // Error/negative sound
    playErrorSound() {
        if (!this.audioContext || !this.enabled) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 200;

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopContinuousBeep();
        }
        return this.enabled;
    }
}

// Singleton
let audioInstance = null;

export function getAudio() {
    if (!audioInstance) {
        audioInstance = new AudioManager();
    }
    return audioInstance;
}
