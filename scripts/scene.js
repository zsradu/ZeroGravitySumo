// Initialize Three.js scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

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

// Create test ship for collision testing
const testShipGeometry = new THREE.ConeGeometry(1, 2, 16);
const testShipMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const testShip = new THREE.Mesh(testShipGeometry, testShipMaterial);
const testRotationAxes = new THREE.Group();

// Position test ship
testRotationAxes.position.set(5, 0, 0); // Place 5 units to the right of center
testShip.rotation.x = Math.PI / 2;
scene.add(testRotationAxes);
testRotationAxes.add(testShip);

// Initialize physics for both ships
const shipPhysics = new Physics();
const testShipPhysics = new Physics();

// Optional: Add some stars in the background for depth perception
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
    
    // Accumulate time for fixed timestep updates
    accumulator += deltaTime;
    
    // Update physics at fixed timestep
    while (accumulator >= CAMERA_TIME_STEP) {
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
        
        // Update physics for both ships
        const playerInBounds = shipPhysics.update(rotationAxes);
        const testShipInBounds = testShipPhysics.update(testRotationAxes);
        
        // Remove ships that are out of bounds
        if (!playerInBounds && rotationAxes.parent) {
            scene.remove(rotationAxes);
        }
        if (!testShipInBounds && testRotationAxes.parent) {
            scene.remove(testRotationAxes);
        }
        
        // Only check for collisions if both ships are in bounds
        if (playerInBounds && testShipInBounds) {
            shipPhysics.checkCollision(rotationAxes, testShipPhysics, testRotationAxes);
        }
        
        accumulator -= CAMERA_TIME_STEP;
    }
    
    // Update camera position and rotation (interpolated)
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
    }
    
    // Apply camera shake if collision occurred
    const playerShake = shipPhysics.getShakeOffset();
    const testShake = testShipPhysics.getShakeOffset();
    camera.position.add(new THREE.Vector3(
        playerShake.x + testShake.x,
        playerShake.y + testShake.y,
        playerShake.z + testShake.z
    ));
    
    // Slowly rotate the safe zone for better depth perception
    safeZone.rotation.y += 0.001;
    
    renderer.render(scene, camera);
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