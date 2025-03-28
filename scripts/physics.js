// Physics constants
const NORMAL_THRUST = 12.0;  // units/s²
const BOOST_THRUST = 40.0;   // units/s²
const DAMPING = 0.99;       // per frame
const TIME_STEP = 1/60;     // 60 FPS
const SHIP_RADIUS = 2.0;    // Collision sphere radius
const COLLISION_SHAKE_AMPLITUDE = 0.5;
const COLLISION_SHAKE_DURATION = 0.3;
const SAFE_ZONE_RADIUS = 50; // Arena boundary radius

class Physics {
    constructor() {
        this.velocity = new THREE.Vector3();
        this.acceleration = 10;
        this.drag = 0.3;
        this.boostMultiplier = 2.5;
        this.boostCooldown = 0;
        this.BOOST_COOLDOWN = 2000; // 2 seconds
        this.isThrusting = false;
        this.isBoosting = false;
        this.thrusterEffect = null;
        this.boostTimeLeft = 0;
        this.shakeTimeLeft = 0;      // Camera shake timer
        this.lastCollisionTime = 0;  // Prevent multiple collisions in same frame
        this.isOutOfBounds = false;  // Track if ship is out of bounds
    }

    // Update physics for an object
    update(object) {
        const now = performance.now();

        // Update boost cooldown
        if (this.boostCooldown > 0) {
            this.boostCooldown = Math.max(0, this.boostCooldown - 16.67);
            if (this.boostCooldown <= 0) {
                this.isBoosting = false;
                // Update thruster effect if still thrusting
                if (this.isThrusting) {
                    if (this.thrusterEffect) {
                        this.thrusterEffect.group.parent.remove(this.thrusterEffect.group);
                    }
                    this.thrusterEffect = effectsManager.createThrusterEffect(this, false);
                }
            }
        }

        // Apply thrust
        if (this.isThrusting) {
            // Get the object's forward direction
            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(object.quaternion);
            
            // Apply acceleration in that direction
            const thrustPower = this.isBoosting ? this.acceleration * this.boostMultiplier : this.acceleration;
            this.velocity.add(forward.multiplyScalar(thrustPower * (1/60)));

            // Update thruster effect
            if (this.thrusterEffect) {
                // Ensure thruster is attached to object
                if (!this.thrusterEffect.group.parent) {
                    object.add(this.thrusterEffect.group);
                }
                this.thrusterEffect.update(now);
            }
        }

        // Apply drag
        this.velocity.multiplyScalar(1 - this.drag * (1/60));

        // Update position
        object.position.add(this.velocity.clone().multiplyScalar(1/60));

        // Check if out of bounds
        const distance = object.position.length();
        const inBounds = distance <= 50;

        // If out of bounds, trigger explosion effect
        if (!inBounds) {
            effectsManager.createExplosion(object.position.clone());
        }

        // Update shake timer
        if (this.shakeTimeLeft > 0) {
            this.shakeTimeLeft -= TIME_STEP;
        }

        // Check if ship is outside safe zone
        this.isOutOfBounds = distance > SAFE_ZONE_RADIUS;

        return inBounds;
    }

    // Check for collision with another physics object
    checkCollision(object1, physics2, object2) {
        // Don't check collisions if either object is out of bounds
        if (this.isOutOfBounds || physics2.isOutOfBounds) return false;

        // Get positions
        const pos1 = object1.position.clone();
        const pos2 = object2.position.clone();

        // Calculate distance between centers
        const distance = pos1.distanceTo(pos2);

        // Check if collision occurred
        if (distance < SHIP_RADIUS * 2) {
            // Prevent multiple collisions in the same frame
            const now = performance.now();
            if (now - this.lastCollisionTime < 100) return false;
            this.lastCollisionTime = now;

            // Calculate collision normal (from ship2 to ship1)
            const normal = pos1.clone().sub(pos2).normalize();

            // Calculate relative velocity
            const relativeVelocity = this.velocity.clone().sub(physics2.velocity);

            // Calculate relative velocity along the normal
            const velAlongNormal = relativeVelocity.dot(normal);

            // If objects are moving apart, no collision response needed
            if (velAlongNormal > 0) return false;

            // Coefficient of restitution (1.0 = perfectly elastic)
            const restitution = 0.8;

            // Calculate impulse scalar
            const j = -(1 + restitution) * velAlongNormal;
            
            // Since both masses are equal (1.0), we can simplify the impulse calculation
            const impulse = normal.multiplyScalar(j * 0.5);

            // Apply impulse to both objects
            this.velocity.add(impulse);
            physics2.velocity.sub(impulse);

            // Slightly separate the objects to prevent sticking
            const penetrationDepth = (SHIP_RADIUS * 2) - distance;
            const separation = normal.clone().multiplyScalar(penetrationDepth * 0.5);
            object1.position.add(separation);
            object2.position.sub(separation);

            // Start camera shake
            this.shakeTimeLeft = COLLISION_SHAKE_DURATION;
            physics2.shakeTimeLeft = COLLISION_SHAKE_DURATION;

            return true;
        }

        return false;
    }

    // Get camera shake offset
    getShakeOffset() {
        if (this.shakeTimeLeft <= 0) return new THREE.Vector3(0, 0, 0);

        const progress = this.shakeTimeLeft / COLLISION_SHAKE_DURATION;
        const amplitude = COLLISION_SHAKE_AMPLITUDE * progress;
        
        return new THREE.Vector3(
            (Math.random() - 0.5) * amplitude,
            (Math.random() - 0.5) * amplitude,
            (Math.random() - 0.5) * amplitude
        );
    }

    // Start thrusting
    startThrust() {
        this.isThrusting = true;
        // Remove any existing thruster effect
        if (this.thrusterEffect && this.thrusterEffect.group.parent) {
            this.thrusterEffect.group.parent.remove(this.thrusterEffect.group);
        }
        // Create new thruster effect
        this.thrusterEffect = effectsManager.createThrusterEffect(this, this.isBoosting);
    }

    // Stop thrusting
    stopThrust() {
        this.isThrusting = false;
        // Remove thruster effect
        if (this.thrusterEffect && this.thrusterEffect.group.parent) {
            this.thrusterEffect.group.parent.remove(this.thrusterEffect.group);
            this.thrusterEffect = null;
        }
    }

    // Attempt to activate boost
    tryBoost() {
        if (this.boostCooldown <= 0) {
            this.isBoosting = true;
            this.boostCooldown = this.BOOST_COOLDOWN;
            // Update thruster effect if thrusting
            if (this.isThrusting) {
                if (this.thrusterEffect && this.thrusterEffect.group.parent) {
                    this.thrusterEffect.group.parent.remove(this.thrusterEffect.group);
                }
                this.thrusterEffect = effectsManager.createThrusterEffect(this, true);
            }
            return true;
        }
        return false;
    }

    // Get current velocity magnitude
    getSpeed() {
        return this.velocity.length();
    }

    // Get boost status
    getBoostStatus() {
        return {
            isActive: this.isBoosting,
            timeLeft: this.boostTimeLeft,
            cooldown: this.boostCooldown
        };
    }

    // Check if ship is out of bounds
    isOutOfSafeZone() {
        return this.isOutOfBounds;
    }
} 