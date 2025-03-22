// Physics constants
const NORMAL_THRUST = 2.5;  // units/s²
const BOOST_THRUST = 10.0;   // units/s²
const DAMPING = 0.99;       // per frame
const TIME_STEP = 1/60;     // 60 FPS

class Physics {
    constructor() {
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.isThrusting = false;
        this.isBoosting = false;
        this.boostTimeLeft = 0;
        this.boostCooldown = 0;
        this.BOOST_DURATION = 2;     // seconds
        this.BOOST_COOLDOWN = 10;    // seconds
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

        // Apply velocity to position
        object.position.addScaledVector(this.velocity, TIME_STEP);

        // Apply damping
        this.velocity.multiplyScalar(DAMPING);
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
} 