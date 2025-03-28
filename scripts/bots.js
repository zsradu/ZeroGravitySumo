class Bot {
    constructor(scene, position) {
        // Get ship geometry and material from asset manager
        const highDetailAsset = assetManager.getShipGeometry(true);
        const lowDetailAsset = assetManager.getShipGeometry(false);
        
        // Create materials for high and low detail (clone to allow individual coloring)
        const botMaterialHigh = highDetailAsset.material.clone();
        const botMaterialLow = lowDetailAsset.material.clone();
        
        // Function to tint a material red while preserving its properties
        const tintMaterialRed = (material) => {
            const textureMap = material.map;
            material.metalness = 0;
            material.roughness = 0.67;
            material.map = textureMap;
            material.color.setRGB(1.0, 0.3, 0.3);
            if (material.map) {
                material.map.needsUpdate = true;
            }
            material.needsUpdate = true;
        };
        
        // Apply red tinting to both materials
        tintMaterialRed(botMaterialHigh);
        tintMaterialRed(botMaterialLow);
        
        // Create both LOD meshes
        this.highDetailMesh = new THREE.Mesh(highDetailAsset.geometry, botMaterialHigh);
        this.lowDetailMesh = new THREE.Mesh(lowDetailAsset.geometry, botMaterialLow);
        
        // Create LOD group
        this.lod = new THREE.LOD();
        this.lod.addLevel(this.highDetailMesh, 0);
        this.lod.addLevel(this.lowDetailMesh, 30);
        
        // Create rotation axes for the bot
        this.rotationAxes = new THREE.Group();
        this.rotationAxes.position.copy(position);
        scene.add(this.rotationAxes);
        this.rotationAxes.add(this.lod);
        
        // Rotate ship to point "forward" along its length and flip 180 degrees
        this.highDetailMesh.rotation.x = Math.PI / 2;
        this.highDetailMesh.rotation.z = Math.PI;
        this.lowDetailMesh.rotation.x = Math.PI / 2;
        this.lowDetailMesh.rotation.z = Math.PI;
        
        this.lod.position.set(0, 0, 0);
        
        // Initialize physics
        this.physics = new Physics();
        
        // Movement constants
        this.MOVE_SPEED = 4.0; // 4 units per second
        this.MOVE_PHASE_DURATION = 3000; // 3 seconds
        this.STOP_PHASE_DURATION = 3000; // 3 seconds
        this.DIRECTION_ADJUSTMENT_RATE = 0.10; // 10% per frame
        
        // Movement state
        this.currentPhase = 'moving';
        this.phaseTimer = this.MOVE_PHASE_DURATION;
        this.lastPosition = position.clone();
        this.isRecoveringFromCollision = false;
        
        // Calculate initial orbit radius (distance from center)
        this.orbitRadius = position.length();
        if (this.orbitRadius === 0) {
            // If spawned at center, move to default radius
            this.orbitRadius = 40;
            position.set(40, 0, 0);
            this.rotationAxes.position.copy(position);
        }

        // Initialize movement direction
        const toCenter = this.rotationAxes.position.clone().normalize();
        const initialDirection = new THREE.Vector3();
        initialDirection.crossVectors(toCenter, new THREE.Vector3(0, 1, 0)).normalize();
        this.physics.velocity.copy(initialDirection.multiplyScalar(this.MOVE_SPEED));
    }
    
    update(otherShips, camera) {
        // Update LOD based on distance to camera
        this.lod.update(camera);
        
        // Check for significant position change (possible collision)
        const currentPosition = this.rotationAxes.position;
        const moveDistance = currentPosition.distanceTo(this.lastPosition);
        const expectedMove = this.MOVE_SPEED / 30; // More lenient collision detection
        
        if (moveDistance > expectedMove && !this.isRecoveringFromCollision) {
            this.isRecoveringFromCollision = true;
            // Let physics handle the collision response
        }
        
        // Update last position
        this.lastPosition.copy(currentPosition);
        
        // Handle movement phases
        this.phaseTimer -= 16.67; // Assume 60fps for timing
        if (this.phaseTimer <= 0) {
            // Switch phases
            this.currentPhase = this.currentPhase === 'moving' ? 'stopped' : 'moving';
            this.phaseTimer = this.currentPhase === 'moving' ? 
                this.MOVE_PHASE_DURATION : this.STOP_PHASE_DURATION;
        }
        
        if (!this.isRecoveringFromCollision) {
            // Calculate ideal circular movement direction
            const toCenter = currentPosition.clone().normalize();
            const idealDirection = new THREE.Vector3();
            idealDirection.crossVectors(toCenter, new THREE.Vector3(0, 1, 0)).normalize();
            idealDirection.multiplyScalar(this.MOVE_SPEED);
            
            if (this.currentPhase === 'moving') {
                // Smoothly adjust velocity towards ideal direction
                const currentDir = this.physics.velocity.clone().normalize();
                const idealDir = idealDirection.normalize();
                
                // Calculate angle between current and ideal direction
                let angle = Math.acos(currentDir.dot(idealDir));
                if (isNaN(angle)) angle = 0;
                
                // Adjust direction by percentage of angle
                if (angle > 0.01) {
                    const adjustmentAngle = angle * this.DIRECTION_ADJUSTMENT_RATE;
                    const rotationAxis = new THREE.Vector3();
                    rotationAxis.crossVectors(currentDir, idealDir).normalize();
                    
                    // Create rotation quaternion
                    const rotationQuaternion = new THREE.Quaternion();
                    rotationQuaternion.setFromAxisAngle(rotationAxis, adjustmentAngle);
                    
                    // Apply rotation to velocity
                    this.physics.velocity.applyQuaternion(rotationQuaternion);
                    this.physics.velocity.normalize().multiplyScalar(this.MOVE_SPEED);
                }
            } else {
                // In stopped phase, gradually reduce velocity
                this.physics.velocity.multiplyScalar(0.95);
            }
        } else {
            // Check if recovered from collision
            if (this.physics.velocity.length() < this.MOVE_SPEED * 0.5) {
                this.isRecoveringFromCollision = false;
                this.orbitRadius = currentPosition.length(); // Update orbit radius after recovery
            }
        }
        
        // Update ship rotation to face movement direction
        if (this.physics.velocity.length() > 0.1) {
            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(this.rotationAxes.quaternion);
            
            const targetDirection = this.physics.velocity.clone().normalize();
            const rotationAxis = new THREE.Vector3();
            rotationAxis.crossVectors(forward, targetDirection);
            
            if (rotationAxis.length() > 0.001) {
                const rotationQuaternion = new THREE.Quaternion();
                rotationQuaternion.setFromAxisAngle(rotationAxis.normalize(), 0.1);
                this.rotationAxes.quaternion.multiply(rotationQuaternion);
            }
        }
        
        // Update physics
        const inBounds = this.physics.update(this.rotationAxes);
        return inBounds;
    }
    
    remove(scene) {
        scene.remove(this.rotationAxes);
    }
} 