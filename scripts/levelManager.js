class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.baseSpeed = 4.0;      // Base bot speed
        this.speedIncrement = 0.2; // Speed increase per level
        this.baseStopDuration = 8000; // Base stop duration in ms
        this.stopDurationDecrement = 1000; // Stop duration decrease per level (0.5s)
        
        // Create HUD element
        this.createHUD();
    }

    createHUD() {
        this.hudElement = document.createElement('div');
        this.hudElement.style.position = 'absolute';
        this.hudElement.style.top = '20px';
        this.hudElement.style.left = '20px';
        this.hudElement.style.color = '#00ff00';
        this.hudElement.style.fontSize = '24px';
        this.hudElement.style.fontFamily = 'Arial, sans-serif';
        this.hudElement.style.textShadow = '0 0 10px #00ff00';
        document.body.appendChild(this.hudElement);
        this.updateHUD();
    }

    updateHUD() {
        this.hudElement.textContent = `Level ${this.currentLevel}`;
    }

    getCurrentLevel() {
        return this.currentLevel;
    }

    getBotSpeed() {
        return this.baseSpeed + (this.currentLevel - 1) * this.speedIncrement;
    }

    getBotStopDuration() {
        const duration = this.baseStopDuration - (this.currentLevel - 1) * this.stopDurationDecrement;
        return Math.max(500, duration); // Minimum stop duration of 0.5 seconds
    }

    getNumberOfBots() {
        return this.currentLevel;
    }

    handleGameWin() {
        this.currentLevel++;
        this.updateHUD();
    }

    handleGameLoss() {
        // Stay on the same level
        this.updateHUD();
    }

    reset() {
        this.currentLevel = 1;
        this.updateHUD();
    }
}