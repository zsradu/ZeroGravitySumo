// Initialize Three.js scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

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

// Initialize physics for the player's ship
const shipPhysics = new Physics();

// Position camera to see the entire arena
camera.position.z = 100;

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

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
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
    
    // Update physics
    shipPhysics.update(rotationAxes);
    
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