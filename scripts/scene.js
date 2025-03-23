// Initialize Three.js scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Initialize game manager
const game = new Game();
game.startRound();

// Listen for game reset event
document.addEventListener('gameReset', () => {
    // Remove all existing bots
    allShips.forEach(ship => {
        if (ship !== rotationAxes) {
            scene.remove(ship);
        }
    });
    
    // Clear arrays
    allShips = [rotationAxes];
    bots.length = 0;
    
    // Reset player ship
    rotationAxes.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40
    );
    shipPhysics.velocity.set(0, 0, 0);
    
    // Make sure player ship is in the scene
    if (!rotationAxes.parent) {
        scene.add(rotationAxes);
    }
    
    // Create new bots
    for (let i = 0; i < MIN_BOTS; i++) {
        createBot();
    }
    
    // Reset next bot update time
    nextBotUpdateTime = performance.now() + BOT_UPDATE_INTERVAL;
});

// Camera following parameters
const CAMERA_DISTANCE = 10;  // Units behind ship
const CAMERA_HEIGHT = 5;     // Units above ship
const CAMERA_POSITION_LERP = 0.1;  // Position smoothing
const CAMERA_ROTATION_LERP = 0.05; // Rotation smoothing
const TARGET_FRAMERATE = 60;
const CAMERA_TIME_STEP = 1000 / TARGET_FRAMERATE; // 16.67ms for 60 FPS

// Set renderer size and add to document
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the safe zone sphere
const safeZoneGeometry = new THREE.SphereGeometry(50, 32, 32);
const safeZoneMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.3,
    wireframe: true
});
const safeZone = new THREE.Mesh(safeZoneGeometry, safeZoneMaterial);
scene.add(safeZone);

// Create player's spaceship
const shipGeometry = new THREE.ConeGeometry(1, 2, 16);
const shipMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const playerShip = new THREE.Mesh(shipGeometry, shipMaterial);

// Position ship randomly within safe zone
playerShip.position.set(
    (Math.random() - 0.5) * 40, // x: -20 to 20
    (Math.random() - 0.5) * 40, // y: -20 to 20
    (Math.random() - 0.5) * 40  // z: -20 to 20
);

// Rotate ship to point "forward" along its length
playerShip.rotation.x = Math.PI / 2;
scene.add(playerShip);

// Create rotation axes for the ship
const rotationAxes = new THREE.Group();
rotationAxes.position.copy(playerShip.position);
scene.add(rotationAxes);
rotationAxes.add(playerShip);
playerShip.position.set(0, 0, 0); // Reset position relative to rotationAxes

// Initialize physics for both ships
const shipPhysics = new Physics();
const testShipPhysics = new Physics();

// Add some stars in the background for depth perception
const starGeometry = new THREE.BufferGeometry();
const starVertices = [];
for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Bot management constants
const MIN_BOTS = 2;
const MAX_BOTS = 4;
const BOT_UPDATE_INTERVAL = 300000; // 300 seconds
let lastBotUpdate = performance.now();
let nextBotUpdateTime = performance.now() + BOT_UPDATE_INTERVAL;

// Create array to hold all ships (player and bots)
let allShips = [];

// Create initial bots with random positions
const bots = [];
function createBot() {
    const position = new THREE.Vector3(
        (Math.random() - 0.5) * 40, // x: -20 to 20
        (Math.random() - 0.5) * 40, // y: -20 to 20
        (Math.random() - 0.5) * 40  // z: -20 to 20
    );
    const bot = new Bot(scene, position);
    bots.push(bot);
    const botShip = bot.rotationAxes;
    botShip.userData = { bot: bot }; // Store bot reference in ship's userData
    allShips.push(botShip);
}

// Create initial set of bots
for (let i = 0; i < Math.random() * (MAX_BOTS - MIN_BOTS) + MIN_BOTS; i++) {
    createBot();
}

// Add player ship to allShips array
allShips.push(rotationAxes);

// Keyboard state
const keyState = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    s: false,
    a: false,
    d: false,
    ' ': false // Space key
};

// Keyboard event handlers
window.addEventListener('keydown', (event) => {
    if (keyState.hasOwnProperty(event.key)) {
        keyState[event.key] = true;
        
        // Handle boost activation
        if (event.key === ' ') {
            shipPhysics.tryBoost();
        }
    }
});

window.addEventListener('keyup', (event) => {
    if (keyState.hasOwnProperty(event.key)) {
        keyState[event.key] = false;
    }
});

// Ship control parameters
const ROTATION_SPEED = 0.05;

// Create quaternions for rotation
const pitchQuaternion = new THREE.Quaternion();
const yawQuaternion = new THREE.Quaternion();
const tempQuaternion = new THREE.Quaternion();
const rightVector = new THREE.Vector3(1, 0, 0);
const upVector = new THREE.Vector3(0, 1, 0);

// Variables for frame timing
let lastFrameTime = performance.now();
let accumulator = 0;

// Desired camera position and rotation
const desiredCameraPosition = new THREE.Vector3();
const desiredCameraRotation = new THREE.Quaternion();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Calculate frame timing
    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - lastFrameTime, 100); // Cap at 100ms
    lastFrameTime = currentTime;
    
    // Update game timer and boost UI
    game.updateTimer();
    game.updateBoostBar(shipPhysics.boostCooldown, shipPhysics.BOOST_COOLDOWN);
    
    // Only update physics if game is in playing state
    if (game.gameState === 'playing') {
        // Handle ship rotation
        let rotationOccurred = false;
        
        // Reset quaternions
        pitchQuaternion.identity();
        yawQuaternion.identity();
        
        // Pitch (up/down)
        if (keyState.ArrowUp || keyState.w) {
            pitchQuaternion.setFromAxisAngle(rightVector, -ROTATION_SPEED);
            rotationOccurred = true;
        }
        if (keyState.ArrowDown || keyState.s) {
            pitchQuaternion.setFromAxisAngle(rightVector, ROTATION_SPEED);
            rotationOccurred = true;
        }
        
        // Yaw (left/right)
        if (keyState.ArrowLeft || keyState.a) {
            yawQuaternion.setFromAxisAngle(upVector, ROTATION_SPEED);
            rotationOccurred = true;
        }
        if (keyState.ArrowRight || keyState.d) {
            yawQuaternion.setFromAxisAngle(upVector, -ROTATION_SPEED);
            rotationOccurred = true;
        }
        
        // Apply rotations if any occurred
        if (rotationOccurred) {
            tempQuaternion.copy(rotationAxes.quaternion);
            rotationAxes.quaternion.multiply(yawQuaternion);
            rotationAxes.quaternion.multiply(pitchQuaternion);
        }
        
        // Handle thrust
        if (keyState[' ']) {
            shipPhysics.startThrust();
        } else {
            shipPhysics.stopThrust();
        }
        
        // Update player ship physics
        const playerInBounds = shipPhysics.update(rotationAxes);
        if (!playerInBounds) {
            game.handleLoss();
        }
        
        // Update bot physics and check for out-of-bounds
        let activeBotCount = 0;
        for (let i = allShips.length - 1; i >= 0; i--) {
            const ship = allShips[i];
            if (ship !== rotationAxes) {
                const bot = ship.userData?.bot;
                if (bot) {
                    // Update bot behavior first
                    bot.update(allShips, camera);
                    
                    // Then update physics
                    const botInBounds = bot.physics.update(ship);
                    if (!botInBounds) {
                        scene.remove(ship);
                        allShips.splice(i, 1);
                        const botIndex = bots.indexOf(bot);
                        if (botIndex > -1) {
                            bots.splice(botIndex, 1);
                        }
                    } else {
                        activeBotCount++;
                    }
                }
            }
        }
        
        // Check if player is last ship in safe zone
        game.isLastShipInSafeZone(playerInBounds, activeBotCount);
        
        // Check for collisions between all ships
        for (let i = 0; i < allShips.length; i++) {
            for (let j = i + 1; j < allShips.length; j++) {
                const ship1 = allShips[i];
                const ship2 = allShips[j];
                const physics1 = ship1 === rotationAxes ? shipPhysics : ship1.userData?.bot?.physics;
                const physics2 = ship2 === rotationAxes ? shipPhysics : ship2.userData?.bot?.physics;
                
                if (physics1 && physics2) {
                    physics1.checkCollision(ship1, physics2, ship2);
                }
            }
        }
        
        // Check if it's time to update bot count
        if (currentTime >= nextBotUpdateTime) {
            // Randomly add or remove a bot to maintain MIN_BOTS to MAX_BOTS
            const totalBots = bots.length;
            
            if (totalBots < MIN_BOTS) {
                // Add a bot if below minimum
                createBot();
            } else if (totalBots > MAX_BOTS) {
                // Remove a random bot if above maximum
                const indexToRemove = Math.floor(Math.random() * bots.length);
                const botToRemove = bots[indexToRemove];
                scene.remove(botToRemove.rotationAxes);
                bots.splice(indexToRemove, 1);
                const shipIndex = allShips.indexOf(botToRemove.rotationAxes);
                if (shipIndex > -1) {
                    allShips.splice(shipIndex, 1);
                }
            } else {
                // Randomly add or remove a bot
                if (Math.random() < 0.5 && totalBots < MAX_BOTS) {
                    createBot();
                } else if (totalBots > MIN_BOTS) {
                    const indexToRemove = Math.floor(Math.random() * bots.length);
                    const botToRemove = bots[indexToRemove];
                    scene.remove(botToRemove.rotationAxes);
                    bots.splice(indexToRemove, 1);
                    const shipIndex = allShips.indexOf(botToRemove.rotationAxes);
                    if (shipIndex > -1) {
                        allShips.splice(shipIndex, 1);
                    }
                }
            }
            
            nextBotUpdateTime = currentTime + BOT_UPDATE_INTERVAL;
        }
    }
    
    // Update camera position and rotation
    updateCamera();
    
    // Render the scene
    renderer.render(scene, camera);
}

// Camera update function
function updateCamera() {
    if (rotationAxes.parent) {
        // Get the ship's world quaternion
        const shipQuaternion = rotationAxes.quaternion;

        // Calculate camera offset in ship's local space
        const cameraOffset = new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_DISTANCE);
        cameraOffset.applyQuaternion(shipQuaternion);

        // Set desired camera position relative to ship
        desiredCameraPosition.copy(rotationAxes.position).add(cameraOffset);

        // Smoothly interpolate camera position
        camera.position.lerp(desiredCameraPosition, CAMERA_POSITION_LERP);
        
        // Create a rotation to tilt the camera down slightly to center the ship's direction
        const cameraRotation = new THREE.Quaternion();
        cameraRotation.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI * -0.08); // 12 degrees down

        // Set camera rotation to match ship's orientation
        camera.quaternion.copy(shipQuaternion).multiply(cameraRotation);
        
        // Apply camera shake if collision occurred
        const playerShake = shipPhysics.getShakeOffset();
        camera.position.add(playerShake);
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
}, false);

// Start animation loop
animate(); 