class Game {
    constructor() {
        // Round timer settings
        this.roundDuration = 120000; // 2 minutes in milliseconds
        this.roundStartTime = 0;
        this.roundTimeRemaining = this.roundDuration;
        
        // Game state
        this.gameState = 'playing'; // 'playing', 'won', 'lost'
        this.winCount = 0;
        this.gameEndTime = 0;
        this.GAME_END_DELAY = 1500; // 1.5 seconds before showing play again
        
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
        
        // Create game over container
        this.gameOverContainer = document.createElement('div');
        this.gameOverContainer.style.position = 'absolute';
        this.gameOverContainer.style.top = '50%';
        this.gameOverContainer.style.left = '50%';
        this.gameOverContainer.style.transform = 'translate(-50%, -50%)';
        this.gameOverContainer.style.display = 'none';
        this.gameOverContainer.style.flexDirection = 'column';
        this.gameOverContainer.style.alignItems = 'center';
        this.gameOverContainer.style.gap = '20px';
        this.gameOverContainer.style.transition = 'opacity 0.5s';
        document.body.appendChild(this.gameOverContainer);
        
        // Create game over message
        this.gameOverMessage = document.createElement('div');
        this.gameOverMessage.style.color = 'white';
        this.gameOverMessage.style.fontFamily = 'Arial';
        this.gameOverMessage.style.fontSize = '48px';
        this.gameOverMessage.style.fontWeight = 'bold';
        this.gameOverContainer.appendChild(this.gameOverMessage);
        
        // Create win counter
        this.winCountDisplay = document.createElement('div');
        this.winCountDisplay.style.color = 'white';
        this.winCountDisplay.style.fontFamily = 'Arial';
        this.winCountDisplay.style.fontSize = '24px';
        this.winCountDisplay.style.marginTop = '-10px';
        this.gameOverContainer.appendChild(this.winCountDisplay);
        
        // Create play again button
        this.playAgainButton = document.createElement('button');
        this.playAgainButton.textContent = 'Play again';
        this.playAgainButton.style.backgroundColor = '#00FF00';
        this.playAgainButton.style.color = 'black';
        this.playAgainButton.style.border = 'none';
        this.playAgainButton.style.padding = '15px 30px';
        this.playAgainButton.style.borderRadius = '5px';
        this.playAgainButton.style.fontSize = '20px';
        this.playAgainButton.style.cursor = 'pointer';
        this.playAgainButton.style.fontWeight = 'bold';
        this.playAgainButton.style.display = 'none';
        this.playAgainButton.onclick = () => this.startNewGame();
        this.gameOverContainer.appendChild(this.playAgainButton);
    }
    
    startRound() {
        this.roundStartTime = performance.now();
        this.roundTimeRemaining = this.roundDuration;
        this.gameState = 'playing';
        this.gameOverContainer.style.display = 'none';
        this.playAgainButton.style.display = 'none';
    }
    
    startNewGame() {
        this.startRound();
        // Emit an event that scene.js can listen to for resetting the game
        let event = new CustomEvent('gameReset');
        document.dispatchEvent(event);
    }
    
    updateTimer() {
        const currentTime = performance.now();
        this.roundTimeRemaining = Math.max(0, this.roundDuration - (currentTime - this.roundStartTime));
        
        // Format time as MM:SS
        const seconds = Math.ceil(this.roundTimeRemaining / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        this.timerDisplay.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        // Check if timer ran out (win condition)
        if (this.roundTimeRemaining <= 0 && this.gameState === 'playing') {
            this.handleWin();
        }
        
        return this.roundTimeRemaining > 0;
    }
    
    updateBoostBar(boostCooldown, maxCooldown) {
        const percentage = ((maxCooldown - boostCooldown) / maxCooldown) * 100;
        this.boostBarFill.style.width = `${percentage}%`;
        this.boostBarFill.style.backgroundColor = boostCooldown > 0 ? '#FF0000' : '#00FF00';
    }
    
    handleWin() {
        this.gameState = 'won';
        this.winCount++;
        this.showGameOver('You Won!');
    }
    
    handleLoss() {
        if (this.gameState === 'playing') {
            this.gameState = 'lost';
            this.showGameOver('You Lost');
        }
    }
    
    showGameOver(message) {
        this.gameEndTime = performance.now();
        this.gameOverContainer.style.display = 'flex';
        this.gameOverContainer.style.opacity = '0';
        this.gameOverMessage.textContent = message;
        this.winCountDisplay.textContent = `Wins: ${this.winCount}`;
        
        // Fade in the game over message
        requestAnimationFrame(() => {
            this.gameOverContainer.style.opacity = '1';
        });
        
        // Show play again button after delay
        setTimeout(() => {
            this.playAgainButton.style.display = 'block';
        }, this.GAME_END_DELAY);
    }
    
    isLastShipInSafeZone(playerShipInBounds, botCount) {
        if (this.gameState === 'playing' && playerShipInBounds && botCount === 0) {
            this.handleWin();
            return true;
        }
        return false;
    }
} 