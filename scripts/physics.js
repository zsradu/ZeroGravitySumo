// Physics constants
const NORMAL_THRUST = 2.5;  // units/s²
const BOOST_THRUST = 10.0;   // units/s²
const DAMPING = 0.99;       // per frame
const TIME_STEP = 1/60;     // 60 FPS
const SHIP_RADIUS = 1.5;    // Collision sphere radius
const COLLISION_SHAKE_AMPLITUDE = 0.5;
const COLLISION_SHAKE_DURATION = 0.3;
const SAFE_ZONE_RADIUS = 50; // Arena boundary radius

class Physics {
    constructor() {
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.isThrusting = false;
        this.isBoosting = false;
        this.boostTimeLeft = 0;
        this.boostCooldown = 0;
        this.BOOST_DURATION = 2;     // seconds
        this.BOOST_COOLDOWN = 10;    // seconds
        this.shakeTimeLeft = 0;      // Camera shake timer
        this.lastCollisionTime = 0;  // Prevent multiple collisions in same frame
        this.isOutOfBounds = false;  // Track if ship is out of bounds
    }

    // Update physics for an object
    update(object) {
        // Apply thrust if active
        if (this.isThrusting) {
            // Get the object's forward direction (negative z-axis in local space)
            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(object.quaternion);
            
            // Calculate thrust force
            const thrustForce = this.isBoosting ? BOOST_THRUST : NORMAL_THRUST;
            
            // Apply thrust to velocity
            this.velocity.addScaledVector(forward, thrustForce * TIME_STEP);
        }

        // Update boost status
        if (this.isBoosting) {
            this.boostTimeLeft -= TIME_STEP;
            if (this.boostTimeLeft <= 0) {
                this.isBoosting = false;
                this.boostCooldown = this.BOOST_COOLDOWN;
            }
        } else if (this.boostCooldown > 0) {
            this.boostCooldown -= TIME_STEP;
        }

        // Update shake timer
        if (this.shakeTimeLeft > 0) {
            this.shakeTimeLeft -= TIME_STEP;
        }

        // Apply velocity to position
        object.position.addScaledVector(this.velocity, TIME_STEP);

        // Apply damping
        this.velocity.multiplyScalar(DAMPING);

        // Check if ship is outside safe zone
        const distanceFromCenter = object.position.length();
        this.isOutOfBounds = distanceFromCenter > SAFE_ZONE_RADIUS;

        return !this.isOutOfBounds; // Return false if ship should be removed
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
    }

    // Stop thrusting
    stopThrust() {
        this.isThrusting = false;
    }

    // Attempt to activate boost
    tryBoost() {
        if (!this.isBoosting && this.boostCooldown <= 0) {
            this.isBoosting = true;
            this.boostTimeLeft = this.BOOST_DURATION;
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