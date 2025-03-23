class AssetManager {
    constructor() {
        console.log('Initializing AssetManager...');
        this.loader = new THREE.GLTFLoader();
        this.assets = new Map();
        this.isLoading = false;
        this.loadPromise = null;
        
        // Fallback geometries and materials
        this.fallbackHighDetail = new THREE.ConeGeometry(1, 2, 16);
        this.fallbackLowDetail = new THREE.ConeGeometry(1, 2, 8);
        this.fallbackMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        console.log('AssetManager initialized with fallback geometries');
    }
    
    async loadAssets() {
        console.log('loadAssets called');
        if (this.loadPromise) {
            console.log('Assets already loading, returning existing promise');
            return this.loadPromise;
        }
        
        this.isLoading = true;
        console.log('Starting asset loading process');
        
        this.loadPromise = new Promise(async (resolve, reject) => {
            try {
                console.log('Attempting to load ship model...');
                const shipModel = await this.loadModel('./assets/ship.glb');
                console.log('Ship model loaded, processing...');
                
                if (!shipModel.highDetail || !shipModel.lowDetail) {
                    throw new Error('Invalid model structure');
                }
                
                this.assets.set('ship', shipModel);
                console.log('Ship model processed and stored successfully');
            } catch (error) {
                console.warn('Failed to load ship model, using fallback:', error);
                // Use fallback geometries if model loading fails
                this.assets.set('ship', {
                    highDetail: this.fallbackHighDetail,
                    lowDetail: this.fallbackLowDetail,
                    material: this.fallbackMaterial
                });
                console.log('Fallback geometries set successfully');
            }
            
            this.isLoading = false;
            console.log('Asset loading complete');
            resolve();
        });
        
        return this.loadPromise;
    }
    
    async loadModel(url) {
        console.log('Loading model from:', url);
        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                (gltf) => {
                    console.log('GLTF loaded successfully:', gltf);
                    try {
                        // Process the model to create high and low detail versions
                        if (!gltf.scene || !gltf.scene.children || !gltf.scene.children[0]) {
                            throw new Error('Invalid GLTF structure');
                        }
                        
                        // Get the first mesh from the scene
                        const originalMesh = gltf.scene.children[0];
                        console.log('Original mesh:', originalMesh);
                        
                        // Create a copy of the entire mesh for high detail
                        const highDetailMesh = originalMesh.clone();
                        const highDetail = highDetailMesh.geometry;
                        
                        // Create another copy for low detail
                        const lowDetailMesh = originalMesh.clone();
                        const lowDetail = lowDetailMesh.geometry;
                        
                        // Scale the geometries to 25% of original size
                        const scale = 0.5;
                        highDetail.scale(scale, scale, scale);
                        lowDetail.scale(scale, scale, scale);
                        
                        // Get all materials from the original mesh
                        let materials = [];
                        originalMesh.traverse((node) => {
                            if (node.material) {
                                // If it's an array of materials, add each one
                                if (Array.isArray(node.material)) {
                                    materials = materials.concat(node.material);
                                } else {
                                    materials.push(node.material);
                                }
                            }
                        });
                        
                        // Use the first material or create a new one if none found
                        const material = materials[0] ? materials[0].clone() : new THREE.MeshStandardMaterial();
                        
                        // Make sure all textures are loaded and updated
                        if (material) {
                            // Update all possible texture maps
                            const mapTypes = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 
                                           'emissiveMap', 'aoMap', 'bumpMap', 'displacementMap'];
                            
                            mapTypes.forEach(mapType => {
                                if (material[mapType]) {
                                    material[mapType].needsUpdate = true;
                                }
                            });
                            
                            // Enable necessary material features
                            material.needsUpdate = true;
                            material.side = THREE.DoubleSide;
                            
                            // Log material properties for debugging
                            console.log('Material properties:', {
                                maps: mapTypes.filter(type => material[type]),
                                color: material.color,
                                metalness: material.metalness,
                                roughness: material.roughness
                            });
                        }
                        
                        resolve({
                            highDetail,
                            lowDetail,
                            material
                        });
                    } catch (error) {
                        console.error('Error processing GLTF:', error);
                        reject(error);
                    }
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },
                (error) => {
                    console.error('Error loading GLTF:', error);
                    reject(error);
                }
            );
        });
    }
    
    getShipGeometry(isHighDetail = true) {
        const ship = this.assets.get('ship');
        if (!ship) {
            console.warn('No ship asset found, using fallback');
            return {
                geometry: isHighDetail ? this.fallbackHighDetail : this.fallbackLowDetail,
                material: this.fallbackMaterial
            };
        }
        return {
            geometry: isHighDetail ? ship.highDetail : ship.lowDetail,
            material: ship.material
        };
    }
}

// Create and export a singleton instance
console.log('Creating AssetManager singleton');
const assetManager = new AssetManager(); 