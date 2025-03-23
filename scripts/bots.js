class Bot {
    constructor(scene, position) {
        // Create high detail geometry (16 segments)
        const highDetailGeometry = new THREE.ConeGeometry(1, 2, 16);
        // Create low detail geometry (8 segments)
        const lowDetailGeometry = new THREE.ConeGeometry(1, 2, 8);
        const botMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        
        // Create both LOD meshes
        this.highDetailMesh = new THREE.Mesh(highDetailGeometry, botMaterial);
        this.lowDetailMesh = new THREE.Mesh(lowDetailGeometry, botMaterial);
        
        // Create LOD group
        this.lod = new THREE.LOD();
        this.lod.addLevel(this.highDetailMesh, 0);    // Use high detail when close
        this.lod.addLevel(this.lowDetailMesh, 30);    // Switch to low detail at 30 units
        
        // Create rotation axes for the bot
        this.rotationAxes = new THREE.Group();
        this.rotationAxes.position.copy(position);
        scene.add(this.rotationAxes);
        this.rotationAxes.add(this.lod);
        
        // Rotate ship to point "forward" along its length
        this.highDetailMesh.rotation.x = Math.PI / 2;
        this.lowDetailMesh.rotation.x = Math.PI / 2;
        this.lod.position.set(0, 0, 0); // Reset position relative to rotationAxes
        
        // Initialize physics
        this.physics = new Physics();
        
        // Bot state
        this.state = 'stayCenter';
        this.lastStateChange = performance.now();
        this.stateUpdateInterval = 1000; // 1 second
        
        // Target for movement
        this.targetPosition = new THREE.Vector3();
        this.targetRotation = new THREE.Quaternion();
    }
    
    update(otherShips, camera) {
        const now = performance.now();
        
        // Update LOD based on distance to camera
        this.lod.update(camera);
        
        // Update state every second
        if (now - this.lastStateChange >= this.stateUpdateInterval) {
            this.updateState(otherShips);
            this.lastStateChange = now;
        }
        
        // Execute current state behavior
        this.executeBehavior();
        
        // Update physics
        const inBounds = this.physics.update(this.rotationAxes);
        return inBounds;
    }
    
    updateState(otherShips) {
        // Find nearest ship
        let nearestDistance = Infinity;
        let nearestShip = null;
        
        for (const ship of otherShips) {
            if (ship === this.rotationAxes) continue;
            
            const distance = this.rotationAxes.position.distanceTo(ship.position);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestShip = ship;
            }
        }
        
        // State transition logic
        if (nearestDistance < 5) {
            // Avoid if ship is too close
            this.state = 'avoid';
            this.targetPosition.copy(this.rotationAxes.position)
                .sub(nearestShip.position)
                .normalize()
                .multiplyScalar(10)
                .add(this.rotationAxes.position);
        } else {
            // 50% chance to attack if no ships are nearby
            if (Math.random() < 0.5) {
                this.state = 'attack';
                if (nearestShip) {
                    this.targetPosition.copy(nearestShip.position);
                }
            } else {
                // Default to staying near center
                this.state = 'stayCenter';
                this.targetPosition.set(0, 0, 0);
            }
        }
    }
    
    executeBehavior() {
        // Calculate direction to target
        const toTarget = new THREE.Vector3();
        toTarget.copy(this.targetPosition).sub(this.rotationAxes.position);
        
        if (toTarget.length() > 0.1) {
            // Calculate desired rotation
            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(this.rotationAxes.quaternion);
            
            const rotationAxis = new THREE.Vector3();
            rotationAxis.crossVectors(forward, toTarget.normalize());
            
            // Apply rotation
            if (rotationAxis.length() > 0.001) {
                const rotationQuaternion = new THREE.Quaternion();
                rotationQuaternion.setFromAxisAngle(rotationAxis.normalize(), 0.05);
                this.rotationAxes.quaternion.multiply(rotationQuaternion);
            }
            
            // Apply thrust based on state
            const angle = forward.angleTo(toTarget);
            if (angle < Math.PI / 4) { // Only thrust if roughly facing target
                if (this.state === 'attack') {
                    this.physics.tryBoost(); // Try to boost when attacking
                }
                this.physics.startThrust();
            } else {
                this.physics.stopThrust();
            }
        } else {
            this.physics.stopThrust();
        }
    }
    
    checkCollisions(otherShips) {
        for (const ship of otherShips) {
            if (ship === this.rotationAxes) continue;
            
            this.physics.checkCollision(this.rotationAxes, ship.physics, ship);
        }
    }
    
    remove(scene) {
        scene.remove(this.rotationAxes);
    }
} 