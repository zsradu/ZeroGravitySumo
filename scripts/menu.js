class Menu {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'menu-container';
        
        // Create title section with Beta tag
        const titleSection = document.createElement('div');
        titleSection.className = 'title-section';
        
        const title = document.createElement('h1');
        title.textContent = 'Zero Gravity Sumo';
        titleSection.appendChild(title);
        
        const betaTag = document.createElement('span');
        betaTag.className = 'beta-tag';
        betaTag.textContent = 'Beta version';
        titleSection.appendChild(betaTag);
        
        this.container.appendChild(titleSection);
        
        // Create Play button
        const playButton = document.createElement('button');
        playButton.className = 'play-button';
        playButton.textContent = 'Play';
        playButton.addEventListener('click', () => this.startGame());
        this.container.appendChild(playButton);
        
        // Create How to Play section
        const howToPlay = document.createElement('div');
        howToPlay.className = 'how-to-play';
        
        const howToPlayTitle = document.createElement('h2');
        howToPlayTitle.textContent = 'How to Play';
        howToPlay.appendChild(howToPlayTitle);
        
        const instructions = document.createElement('div');
        instructions.className = 'instructions';
        
        // Detect if mobile or desktop
        const isMobile = window.innerWidth < 768 && 'ontouchstart' in window;
        
        if (isMobile) {
            instructions.innerHTML = `
                <p><strong>Controls:</strong></p>
                <ul>
                    <li>Use the joystick (bottom-left) to rotate your ship</li>
                    <li>Tap "Thrust" button to move forward</li>
                    <li>Tap "Boost" button for temporary speed boost</li>
                </ul>
            `;
        } else {
            instructions.innerHTML = `
                <p><strong>Controls:</strong></p>
                <ul>
                    <li>Use WASD or Arrow keys to rotate your ship</li>
                    <li>Press Space to thrust forward</li>
                    <li>Press Shift for temporary speed boost</li>
                </ul>
            `;
        }
        
        instructions.innerHTML += `
            <p><strong>Goals:</strong></p>
            <ul>
                <li>Push other ships out of the green arena</li>
                <li>Stay inside the arena yourself</li>
                <li>Be the last ship remaining to win!</li>
            </ul>
        `;
        
        howToPlay.appendChild(instructions);
        this.container.appendChild(howToPlay);
        
        // Add AI-generated tag
        const aiTag = document.createElement('div');
        aiTag.className = 'ai-tag';
        aiTag.textContent = 'Made 100% with generative AI';
        this.container.appendChild(aiTag);
        
        // Add to document
        document.body.appendChild(this.container);
    }
    
    show() {
        this.container.style.display = 'flex';
    }
    
    hide() {
        this.container.style.display = 'none';
    }
    
    startGame() {
        this.hide();
        // Dispatch event to start the game
        document.dispatchEvent(new CustomEvent('startGame'));
    }
}