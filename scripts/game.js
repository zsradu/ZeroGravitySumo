class Game {
    constructor() {
        // Round timer settings
        this.roundDuration = 120000; // 2 minutes in milliseconds
        this.roundStartTime = 0;
        this.roundTimeRemaining = this.roundDuration;
        
        // UI elements
        this.createUI();
    }
    
    createUI() {
        // Create timer display
        this.timerDisplay = document.createElement('div');
        this.timerDisplay.style.position = 'absolute';
        this.timerDisplay.style.top = '20px';
        this.timerDisplay.style.right = '20px';
        this.timerDisplay.style.color = 'white';
        this.timerDisplay.style.fontFamily = 'Arial';
        this.timerDisplay.style.fontSize = '24px';
        this.timerDisplay.style.fontWeight = 'bold';
        document.body.appendChild(this.timerDisplay);
        
        // Create boost container (holds both label and bar)
        const boostContainer = document.createElement('div');
        boostContainer.style.position = 'absolute';
        boostContainer.style.bottom = '20px';
        boostContainer.style.left = '50%';
        boostContainer.style.transform = 'translateX(-50%)';
        boostContainer.style.display = 'flex';
        boostContainer.style.alignItems = 'center';
        boostContainer.style.gap = '10px';
        document.body.appendChild(boostContainer);
        
        // Create boost label
        const boostLabel = document.createElement('div');
        boostLabel.textContent = 'Boost';
        boostLabel.style.color = 'white';
        boostLabel.style.fontFamily = 'Arial';
        boostLabel.style.fontSize = '16px';
        boostLabel.style.fontWeight = 'bold';
        boostContainer.appendChild(boostLabel);
        
        // Create boost bar container
        this.boostBar = document.createElement('div');
        this.boostBar.style.width = '100px';
        this.boostBar.style.height = '10px';
        this.boostBar.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
        boostContainer.appendChild(this.boostBar);
        
        // Create boost bar fill
        this.boostBarFill = document.createElement('div');
        this.boostBarFill.style.width = '100%';
        this.boostBarFill.style.height = '100%';
        this.boostBarFill.style.backgroundColor = '#00FF00';
        this.boostBarFill.style.transition = 'width 0.1s linear';
        this.boostBar.appendChild(this.boostBarFill);
    }
    
    startRound() {
        this.roundStartTime = performance.now();
        this.roundTimeRemaining = this.roundDuration;
    }
    
    updateTimer() {
        const currentTime = performance.now();
        this.roundTimeRemaining = Math.max(0, this.roundDuration - (currentTime - this.roundStartTime));
        
        // Format time as MM:SS
        const seconds = Math.ceil(this.roundTimeRemaining / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        this.timerDisplay.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        return this.roundTimeRemaining > 0;
    }
    
    updateBoostBar(boostCooldown, maxCooldown) {
        const percentage = ((maxCooldown - boostCooldown) / maxCooldown) * 100;
        this.boostBarFill.style.width = `${percentage}%`;
        this.boostBarFill.style.backgroundColor = boostCooldown > 0 ? '#FF0000' : '#00FF00';
    }
} 