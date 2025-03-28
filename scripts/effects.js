class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeSystems = [];
    }

    createExplosion(position) {
        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const velocities = [];

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            // All particles start at explosion center
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y;
            positions[i * 3 + 2] = position.z;

            // Random colors between red and yellow
            colors[i * 3] = Math.random() * 0.5 + 0.5; // Red
            colors[i * 3 + 1] = Math.random() * 0.5; // Green
            colors[i * 3 + 2] = 0; // Blue

            // Random sizes
            sizes[i] = Math.random() * 2 + 1;

            // Random velocities in sphere
            const velocity = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize().multiplyScalar(Math.random() * 20);
            velocities.push(velocity);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            sizeAttenuation: true
        });

        const points = new THREE.Points(geometry, material);
        this.scene.add(points);

        const startTime = performance.now();
        const duration = 2000; // 2 seconds

        const explosionSystem = {
            points,
            velocities,
            startTime,
            duration,
            update: (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = elapsed / duration;

                if (progress >= 1) {
                    this.scene.remove(points);
                    return false;
                }

                const positions = points.geometry.attributes.position.array;
                const opacity = 1 - progress;
                points.material.opacity = opacity;

                for (let i = 0; i < particleCount; i++) {
                    positions[i * 3] += velocities[i].x * (1 - progress) * 0.1;
                    positions[i * 3 + 1] += velocities[i].y * (1 - progress) * 0.1;
                    positions[i * 3 + 2] += velocities[i].z * (1 - progress) * 0.1;
                }

                points.geometry.attributes.position.needsUpdate = true;
                return true;
            }
        };

        this.activeSystems.push(explosionSystem);
    }

    createThrusterEffect(ship, isBoost = false) {
        const scale = isBoost ? 2 : 1;
        const color = isBoost ? 0x00ffff : 0x00ff00;
        
        // Create cone for thruster
        const geometry = new THREE.ConeGeometry(0.2 * scale, 1 * scale, 8);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        
        const thruster = new THREE.Mesh(geometry, material);
        
        // Position behind the ship
        thruster.position.z = 1.5;
        thruster.rotation.x = Math.PI / 2;
        
        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(0.3 * scale);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.z = 1.2;
        
        const thrusterGroup = new THREE.Group();
        thrusterGroup.add(thruster);
        thrusterGroup.add(glow);
        
        // Animation properties
        const startTime = performance.now();
        const flickerSpeed = isBoost ? 0.2 : 0.1;
        
        const thrusterSystem = {
            group: thrusterGroup,
            startTime,
            update: (currentTime) => {
                const elapsed = currentTime - startTime;
                const flicker = Math.sin(elapsed * flickerSpeed) * 0.2 + 0.8;
                
                thruster.material.opacity = 0.7 * flicker;
                glow.material.opacity = 0.3 * flicker;
                
                return true;
            }
        };
        
        return thrusterSystem;
    }

    update() {
        const currentTime = performance.now();
        this.activeSystems = this.activeSystems.filter(system => system.update(currentTime));
    }
}
