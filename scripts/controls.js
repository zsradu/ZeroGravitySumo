// Device detection utilities
class DeviceDetector {
    static isMobileDevice() {
        // return window.innerWidth < 768 && 'ontouchstart' in window;
        var UA = navigator.userAgent;
        return (
            /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
            /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA)
        ); ;
    }
}

// Virtual joystick for mobile controls
class VirtualJoystick {
    constructor(container) {
        this.container = container;
        this.position = { x: 0, y: 0 };
        this.touchStart = { x: 0, y: 0 };
        this.active = false;
        this.deadZoneRadius = 0.05; // 5% of total range
        this.touchId = null;
        
        // Create joystick elements
        this.base = document.createElement('div');
        this.base.className = 'joystick-base';
        this.knob = document.createElement('div');
        this.knob.className = 'joystick-knob';
        this.base.appendChild(this.knob);
        this.container.appendChild(this.base);
        
        // Bind event handlers
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        
        // Add event listeners
        this.base.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd);
        document.addEventListener('touchcancel', this.handleTouchEnd);
    }
    
    handleTouchStart(event) {
        if (this.active) return; // Already tracking a touch
        event.preventDefault();
        const touch = event.touches[0];
        this.touchId = touch.identifier;
        const rect = this.base.getBoundingClientRect();
        this.touchStart.x = touch.clientX - rect.left;
        this.touchStart.y = touch.clientY - rect.top;
        this.active = true;
        this.updateKnobPosition(touch.clientX - rect.left, touch.clientY - rect.top);
    }
    
    handleTouchMove(event) {
        if (!this.active) return;
        event.preventDefault();
        
        // Find our tracked touch
        const touch = Array.from(event.touches).find(t => t.identifier === this.touchId);
        if (!touch) return;
        
        const rect = this.base.getBoundingClientRect();
        this.updateKnobPosition(touch.clientX - rect.left, touch.clientY - rect.top);
    }
    
    handleTouchEnd(event) {
        // Check if our tracked touch ended
        const activeTouch = Array.from(event.touches).find(t => t.identifier === this.touchId);
        if (!activeTouch) {
            this.active = false;
            this.touchId = null;
            this.position = { x: 0, y: 0 };
            this.knob.style.transform = 'translate(-50%, -50%)';
        }
    }
    
    updateKnobPosition(x, y) {
        const maxRadius = this.base.offsetWidth / 2;
        let deltaX = x - this.touchStart.x;
        let deltaY = y - this.touchStart.y;
        
        // Calculate distance from center
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Apply dead zone
        if (distance < maxRadius * this.deadZoneRadius) {
            deltaX = 0;
            deltaY = 0;
        } else {
            // Normalize if beyond max radius
            if (distance > maxRadius) {
                deltaX = (deltaX / distance) * maxRadius;
                deltaY = (deltaY / distance) * maxRadius;
            }
        }
        
        // Update position (-1 to 1 range)
        this.position.x = deltaX / maxRadius;
        this.position.y = deltaY / maxRadius;
        
        // Update knob position
        this.knob.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
    }
    
    getInput() {
        return this.position;
    }
}

// Touch button for mobile controls
class TouchButton {
    constructor(container, label, position) {
        this.element = document.createElement('div');
        this.element.className = 'touch-button';
        this.element.textContent = label;
        this.element.style.opacity = '0.7';
        this.active = false;
        this.touchId = null;
        
        // Position the button
        if (position === 'thrust') {
            this.element.style.right = '120px';
        } else if (position === 'boost') {
            this.element.style.right = '20px';
        }
        this.element.style.bottom = '20px';
        
        container.appendChild(this.element);
        
        // Add event listeners
        this.element.addEventListener('touchstart', (e) => {
            if (this.active) return; // Already being pressed
            e.preventDefault();
            this.touchId = e.touches[0].identifier;
            this.active = true;
            this.element.classList.add('active');
        }, { passive: false });
        
        this.element.addEventListener('touchend', (e) => {
            // Check if our tracked touch ended
            const activeTouch = Array.from(e.touches).find(t => t.identifier === this.touchId);
            if (!activeTouch) {
                this.active = false;
                this.touchId = null;
                this.element.classList.remove('active');
            }
        });
        
        this.element.addEventListener('touchcancel', () => {
            this.active = false;
            this.touchId = null;
            this.element.classList.remove('active');
        });
    }
    
    isPressed() {
        return this.active;
    }
}

// Main controls manager
class Controls {
    constructor(container) {
        this.isMobile = DeviceDetector.isMobileDevice();
        console.log("isMobile: " + this.isMobile);
        this.container = container;
        
        if (this.isMobile) {
            this.initializeMobileControls();
        } else {
            this.initializeDesktopControls();
        }
    }
    
    initializeMobileControls() {
        this.joystick = new VirtualJoystick(this.container);
        this.thrustButton = new TouchButton(this.container, 'Thrust', 'thrust');
        this.boostButton = new TouchButton(this.container, 'Boost', 'boost');
    }
    
    initializeDesktopControls() {
        this.keyState = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            w: false,
            s: false,
            a: false,
            d: false,
            ' ': false,
            Shift: false
        };
        
        window.addEventListener('keydown', (event) => {
            if (this.keyState.hasOwnProperty(event.key)) {
                this.keyState[event.key] = true;
            }
        });
        
        window.addEventListener('keyup', (event) => {
            if (this.keyState.hasOwnProperty(event.key)) {
                this.keyState[event.key] = false;
            }
        });
    }
    
    getRotationInput() {
        if (this.isMobile) {
            const joystickInput = this.joystick.getInput();
            return {
                x: -joystickInput.y, // Pitch (up/down)
                y: -joystickInput.x // Yaw (left/right)
            };
        } else {
            return {
                x: (this.keyState.ArrowUp || this.keyState.w ? -0.65 : 0) + 
                   (this.keyState.ArrowDown || this.keyState.s ? 0.65 : 0),
                y: (this.keyState.ArrowLeft || this.keyState.a ? 0.65 : 0) + 
                   (this.keyState.ArrowRight || this.keyState.d ? -0.65 : 0)
            };
        }
    }
    
    isThrusting() {
        return this.isMobile ? this.thrustButton.isPressed() : this.keyState[' '];
    }
    
    isBoosting() {
        return this.isMobile ? this.boostButton.isPressed() : this.keyState.Shift;
    }
}
