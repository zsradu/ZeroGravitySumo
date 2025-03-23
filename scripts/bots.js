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
        this.state = 'attack';
        this.lastStateChange = performance.now();
        this.stateUpdateInterval = 500; // 0.5 second
        
        // Target for movement
        this.targetPosition = new THREE.Vector3();
        this.targetRotation = new THREE.Quaternion();
        
        // Last target update
        this.lastTargetUpdate = 0;
        this.targetUpdateInterval = 100; // Update target 10 times per second
    }
    
    update(otherShips, camera) {
        const now = performance.now();
        
        // Update LOD based on distance to camera
        this.lod.update(camera);
        
        // Update state every interval
        if (now - this.lastStateChange >= this.stateUpdateInterval) {
            this.updateState(otherShips);
            this.lastStateChange = now;
        }
        
        // Update target position more frequently
        if (now - this.lastTargetUpdate >= this.targetUpdateInterval) {
            this.updateTargetPosition(otherShips);
            this.lastTargetUpdate = now;
        }
        
        // Execute current state behavior
        this.executeBehavior();
        
        // Update physics
        const inBounds = this.physics.update(this.rotationAxes);
        return inBounds;
    }
    
    updateState(otherShips) {
        // Always be in attack state - we want aggressive bots
        this.state = 'attack';
    }
    
    updateTargetPosition(otherShips) {
        // Check if we're too close to the boundary
        const distanceFromCenter = this.rotationAxes.position.length();
        const ARENA_RADIUS = 50;
        const SAFETY_THRESHOLD = 40;
        
        if (distanceFromCenter > SAFETY_THRESHOLD) {
            // If too close to boundary, target slightly inside the center
            // Use the bot's current position to calculate a safe point towards center
            const safeTarget = this.rotationAxes.position.clone()
                .normalize()
                .multiplyScalar(-20); // Target point 20 units towards center
            this.targetPosition.copy(safeTarget);
            return;
        }
        
        // Normal targeting behavior when safe from boundary
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
        
        if (nearestShip) {
            // Set target to intercept the nearest ship
            const predictedPosition = nearestShip.position.clone();
            // Add a small random offset to create more dynamic behavior
            predictedPosition.add(new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ));
            
            // If target would lead us too close to boundary, adjust it inward
            const targetDistanceFromCenter = predictedPosition.length();
            if (targetDistanceFromCenter > SAFETY_THRESHOLD) {
                predictedPosition.normalize().multiplyScalar(SAFETY_THRESHOLD * 0.8); // Aim for 80% of safety threshold
            }
            
            this.targetPosition.copy(predictedPosition);
        } else {
            // If no ships found, move towards center with random offset
            this.targetPosition.set(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            );
        }
    }
    
    executeBehavior() {
        // Calculate direction to target
        const toTarget = new THREE.Vector3();
        toTarget.copy(this.targetPosition).sub(this.rotationAxes.position);
        
        // Check if we're too close to the boundary
        const distanceFromCenter = this.rotationAxes.position.length();
        const ARENA_RADIUS = 50;
        const SAFETY_THRESHOLD = 40;
        
        // Calculate desired rotation
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this.rotationAxes.quaternion);
        
        if (distanceFromCenter > SAFETY_THRESHOLD) {
            // In danger zone - calculate direction to center
            const toCenter = new THREE.Vector3(0, 0, 0).sub(this.rotationAxes.position).normalize();
            const rotationAxis = new THREE.Vector3();
            rotationAxis.crossVectors(forward, toCenter);
            
            // Apply faster rotation when in danger
            if (rotationAxis.length() > 0.001) {
                const rotationQuaternion = new THREE.Quaternion();
                rotationQuaternion.setFromAxisAngle(rotationAxis.normalize(), 0.15); // Even faster rotation in danger
                this.rotationAxes.quaternion.multiply(rotationQuaternion);
            }
            
            // Check if we're facing roughly towards center
            const angleToCenter = forward.angleTo(toCenter);
            if (angleToCenter < Math.PI / 2) { // Thrust if pointing even roughly towards center
                this.physics.startThrust();
                this.physics.tryBoost(); // Always try to boost when in danger
            }
            return; // Skip normal behavior when in danger zone
        }
        
        // Normal behavior when in safe zone
        if (toTarget.length() > 0.1) {
            const rotationAxis = new THREE.Vector3();
            rotationAxis.crossVectors(forward, toTarget.normalize());
            
            // Apply rotation
            if (rotationAxis.length() > 0.001) {
                const rotationQuaternion = new THREE.Quaternion();
                rotationQuaternion.setFromAxisAngle(rotationAxis.normalize(), 0.05);
                this.rotationAxes.quaternion.multiply(rotationQuaternion);
            }
            
            // Apply thrust based on alignment
            const angle = forward.angleTo(toTarget);
            if (angle < Math.PI / 3) { // Only thrust if roughly facing target
                this.physics.startThrust();
                if (angle < Math.PI / 4) { // Try to boost if well-aligned
                    this.physics.tryBoost();
                }
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