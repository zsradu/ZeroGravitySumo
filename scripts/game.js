class Game {
    constructor() {
        this.gameState = 'playing';
        this.roundTime = 120; // 2 minutes in seconds
        this.timeRemaining = this.roundTime;
        this.lastUpdateTime = performance.now();
        
        // Create UI elements
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
        
        // Create boost cooldown bar
        this.boostBar = document.createElement('div');
        this.boostBar.style.position = 'absolute';
        this.boostBar.style.bottom = '20px';
        this.boostBar.style.left = '50%';
        this.boostBar.style.transform = 'translateX(-50%)';
        this.boostBar.style.width = '100px';
        this.boostBar.style.height = '10px';
        this.boostBar.style.backgroundColor = '#333';
        this.boostBar.style.border = '1px solid #666';
        document.body.appendChild(this.boostBar);
        
        // Create boost fill
        this.boostFill = document.createElement('div');
        this.boostFill.style.width = '100%';
        this.boostFill.style.height = '100%';
        this.boostFill.style.backgroundColor = '#00ff00';
        this.boostBar.appendChild(this.boostFill);
        
        // Create boost label
        this.boostLabel = document.createElement('div');
        this.boostLabel.style.position = 'absolute';
        this.boostLabel.style.bottom = '35px';
        this.boostLabel.style.left = '50%';
        this.boostLabel.style.transform = 'translateX(-50%)';
        this.boostLabel.style.color = 'white';
        this.boostLabel.style.fontFamily = 'Arial';
        this.boostLabel.style.fontSize = '14px';
        this.boostLabel.textContent = 'BOOST';
        document.body.appendChild(this.boostLabel);
        
        // Hide UI initially
        this.hideUI();
    }
    
    showUI() {
        this.timerDisplay.style.display = 'block';
        this.boostBar.style.display = 'block';
        this.boostLabel.style.display = 'block';
    }
    
    hideUI() {
        this.timerDisplay.style.display = 'none';
        this.boostBar.style.display = 'none';
        this.boostLabel.style.display = 'none';
    }
    
    startRound() {
        this.gameState = 'playing';
        this.timeRemaining = this.roundTime;
        this.lastUpdateTime = performance.now();
        this.showUI();
    }
    
    updateTimer() {
        if (this.gameState === 'playing') {
            const currentTime = performance.now();
            const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
            this.lastUpdateTime = currentTime;
            
            this.timeRemaining -= deltaTime;
            
            if (this.timeRemaining <= 0) {
                this.handleLoss();
            } else {
                const minutes = Math.floor(this.timeRemaining / 60);
                const seconds = Math.floor(this.timeRemaining % 60);
                this.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    }
    
    updateBoostBar(cooldown, maxCooldown) {
        const percentage = ((maxCooldown - cooldown) / maxCooldown) * 100;
        this.boostFill.style.width = `${percentage}%`;
    }
    
    handleWin() {
        this.gameState = 'won';
        this.hideUI();
        this.showEndScreen('You Win!', true);
    }
    
    handleLoss() {
        this.gameState = 'lost';
        this.hideUI();
        this.showEndScreen('Game Over', false);
    }
    
    showEndScreen(message, isWin) {
        const endScreen = document.createElement('div');
        endScreen.style.position = 'absolute';
        endScreen.style.top = '50%';
        endScreen.style.left = '50%';
        endScreen.style.transform = 'translate(-50%, -50%)';
        endScreen.style.textAlign = 'center';
        endScreen.style.color = isWin ? '#00ff00' : '#ff0000';
        endScreen.style.fontFamily = 'Arial';
        endScreen.style.fontSize = '48px';
        endScreen.style.fontWeight = 'bold';
        endScreen.innerHTML = `
            ${message}<br>
            <button id="playAgainBtn" style="
                margin-top: 20px;
                padding: 10px 20px;
                font-size: 24px;
                background-color: ${isWin ? '#00ff00' : '#ff4444'};
                color: black;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Play Again</button>
        `;
        document.body.appendChild(endScreen);
        
        // Add click handler for Play Again button
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            endScreen.remove();
            // Dispatch reset event with playAgain flag
            document.dispatchEvent(new CustomEvent('gameReset', { 
                detail: { playAgain: true }
            }));
        });
    }
    
    isLastShipInSafeZone(playerInBounds, activeBotCount) {
        if (playerInBounds && activeBotCount === 0) {
            this.handleWin();
        }
    }
}