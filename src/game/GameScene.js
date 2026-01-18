// Three.js Scene Setup

import * as THREE from 'three';

export class GameScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Three.js essentials
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Game objects
        this.ground = null;
        this.detector = null;
        this.detectorLight = null;
        this.buriedItems = [];
        this.particles = [];

        // Mouse/touch tracking
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        // Pre-allocated objects (performance optimization)
        this._intersectionPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        this._intersectionPoint = new THREE.Vector3();
        this._tempColor = new THREE.Color();

        this.init();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
        this.scene.fog = new THREE.Fog(0x87ceeb, 50, 150);

        // Camera - Isometric-ish view
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
        this.camera.position.set(0, 25, 35);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Lighting
        this.setupLighting();

        // Ground
        this.createGround();

        // Metal Detector
        this.createDetector();

        // Event listeners
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }

    setupLighting() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        // Sun light
        const sun = new THREE.DirectionalLight(0xfff5e6, 1);
        sun.position.set(30, 50, 30);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 1024;
        sun.shadow.mapSize.height = 1024;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 150;
        sun.shadow.camera.left = -50;
        sun.shadow.camera.right = 50;
        sun.shadow.camera.top = 50;
        sun.shadow.camera.bottom = -50;
        this.scene.add(sun);

        // Fill light
        const fill = new THREE.DirectionalLight(0x8ecae6, 0.3);
        fill.position.set(-20, 20, -20);
        this.scene.add(fill);
    }

    createGround() {
        // Beach ground
        const groundGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);

        // Add some height variation
        const positions = groundGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getZ(i);
            // Gentle waves in the terrain
            const height = Math.sin(x * 0.1) * 0.3 + Math.sin(z * 0.1) * 0.2;
            positions.setZ(i, height);
        }
        groundGeometry.computeVertexNormals();

        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0xf4d03f, // Sandy yellow
            roughness: 0.9,
            metalness: 0.0
        });

        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        // Water in background
        const waterGeometry = new THREE.PlaneGeometry(100, 50);
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x219ebc,
            roughness: 0.2,
            metalness: 0.1,
            transparent: true,
            opacity: 0.8
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.set(0, -0.5, -50);
        this.scene.add(water);

        // Some beach decorations
        this.addBeachDecorations();
    }

    // Load a specific area theme
    loadArea(theme, color) {
        // Update ground color
        if (this.ground) {
            this.ground.material.color.setHex(color);
        }

        // Clear existing decorations
        this.clearDecorations();

        // Add new decorations based on theme
        switch (theme) {
            case 'park':
                this.addParkDecorations();
                break;
            case 'farm':
                this.addFarmDecorations();
                break;
            case 'ruins':
                this.addRuinsDecorations();
                break;
            case 'cemetery':
                this.addCemeteryDecorations();
                break;
            default: // beach
                this.addBeachDecorations();
                break;
        }
    }

    clearDecorations() {
        if (this.decorations) {
            for (const dec of this.decorations) {
                this.scene.remove(dec);
            }
        }
        this.decorations = [];
    }

    addDecoration(mesh) {
        this.scene.add(mesh);
        if (!this.decorations) this.decorations = [];
        this.decorations.push(mesh);
    }

    addBeachDecorations() {
        // Palms and Rocks
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 6, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const leafGeo = new THREE.ConeGeometry(3, 4, 6);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });

        for (let i = 0; i < 8; i++) {
            const group = new THREE.Group();
            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.y = 3;
            trunk.castShadow = true;
            group.add(trunk);

            const leaves = new THREE.Mesh(leafGeo, leafMat);
            leaves.position.y = 7;
            leaves.castShadow = true;
            group.add(leaves);

            group.position.set(
                (Math.random() - 0.5) * 80,
                0,
                (Math.random() - 0.5) * 60
            );
            this.addDecoration(group);
        }
    }

    addParkDecorations() {
        // Deciduous Trees
        const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 4, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
        const leafGeo = new THREE.DodecahedronGeometry(2.5);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 });

        for (let i = 0; i < 10; i++) {
            const group = new THREE.Group();
            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.y = 2;
            trunk.castShadow = true;
            group.add(trunk);

            const leaves = new THREE.Mesh(leafGeo, leafMat);
            leaves.position.y = 5;
            leaves.castShadow = true;
            group.add(leaves);

            group.position.set(
                (Math.random() - 0.5) * 80,
                0,
                (Math.random() - 0.5) * 60
            );
            this.addDecoration(group);
        }

        // Benches
        const benchGeo = new THREE.BoxGeometry(4, 1, 1.5);
        const benchMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63 });
        for (let i = 0; i < 5; i++) {
            const bench = new THREE.Mesh(benchGeo, benchMat);
            bench.position.set(
                (Math.random() - 0.5) * 60,
                0.5,
                (Math.random() - 0.5) * 40
            );
            bench.rotation.y = Math.random() * Math.PI;
            bench.castShadow = true;
            this.addDecoration(bench);
        }
    }

    addFarmDecorations() {
        // Fences
        const postGeo = new THREE.BoxGeometry(0.3, 2, 0.3);
        const railGeo = new THREE.BoxGeometry(3, 0.2, 0.1);
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63 });

        for (let x = -40; x <= 40; x += 10) {
            const post = new THREE.Mesh(postGeo, woodMat);
            post.position.set(x, 1, -20);
            post.castShadow = true;
            this.addDecoration(post);

            if (x < 40) {
                const rail = new THREE.Mesh(railGeo, woodMat);
                rail.position.set(x + 5, 1.5, -20);
                this.addDecoration(rail);
            }
        }

        // Crop rows (simple boxes)
        const cropGeo = new THREE.BoxGeometry(80, 0.2, 2);
        const cropMat = new THREE.MeshStandardMaterial({ color: 0x3e2723 }); // Dark soil
        for (let z = 0; z < 40; z += 8) {
            const row = new THREE.Mesh(cropGeo, cropMat);
            row.position.set(0, 0.1, z - 10);
            row.receiveShadow = true;
            this.addDecoration(row);
        }
    }

    addRuinsDecorations() {
        // Broken Pillars
        const pillarGeo = new THREE.CylinderGeometry(0.8, 0.8, 4, 8);
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9e9e9e });

        for (let i = 0; i < 12; i++) {
            const pillar = new THREE.Mesh(pillarGeo, stoneMat);
            pillar.position.set(
                (Math.random() - 0.5) * 80,
                2,
                (Math.random() - 0.5) * 60
            );
            // Tip some over
            if (Math.random() > 0.7) {
                pillar.rotation.z = Math.PI / 2;
                pillar.position.y = 0.8;
            }
            pillar.castShadow = true;
            this.addDecoration(pillar);
        }
    }

    addCemeteryDecorations() {
        // Tombstones
        const tombGeo = new THREE.BoxGeometry(1.5, 2.5, 0.5);
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x424242 });

        for (let i = 0; i < 20; i++) {
            const tomb = new THREE.Mesh(tombGeo, stoneMat);
            tomb.position.set(
                (Math.random() - 0.5) * 70,
                1.25,
                (Math.random() - 0.5) * 50
            );
            tomb.rotation.y = (Math.random() - 0.5) * 0.5; // Slight crookedness
            tomb.castShadow = true;
            this.addDecoration(tomb);
        }

        // Dead Trees
        const deadTreeGeo = new THREE.CylinderGeometry(0.2, 0.6, 6, 5);
        const deadTreeMat = new THREE.MeshStandardMaterial({ color: 0x212121 });

        for (let i = 0; i < 6; i++) {
            const tree = new THREE.Mesh(deadTreeGeo, deadTreeMat);
            tree.position.set(
                (Math.random() - 0.5) * 80,
                3,
                (Math.random() - 0.5) * 60
            );
            tree.rotation.z = (Math.random() - 0.5) * 0.5;
            tree.castShadow = true;
            this.addDecoration(tree);
        }
    }

    createDetector() {
        // Metal detector group
        this.detector = new THREE.Group();

        // Handle
        const handleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
        const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.y = 2;
        handle.rotation.x = Math.PI / 6;
        this.detector.add(handle);

        // Coil (detection head)
        const coilGeometry = new THREE.TorusGeometry(0.8, 0.15, 8, 16);
        const coilMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.5,
            roughness: 0.3
        });
        const coil = new THREE.Mesh(coilGeometry, coilMaterial);
        coil.rotation.x = Math.PI / 2;
        coil.position.y = 0.2;
        this.detector.add(coil);

        // Detection light
        const lightGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const lightMaterial = new THREE.MeshStandardMaterial({
            color: 0x22c55e,
            emissive: 0x22c55e,
            emissiveIntensity: 0.5
        });
        this.detectorLight = new THREE.Mesh(lightGeometry, lightMaterial);
        this.detectorLight.position.set(0, 3.5, 0);
        this.detector.add(this.detectorLight);

        // Control box
        const boxGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.2);
        const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.set(0, 3, 0.2);
        box.rotation.x = -Math.PI / 6;
        this.detector.add(box);

        this.detector.position.y = 1;
        this.detector.castShadow = true;
        this.scene.add(this.detector);
    }

    // Spawn buried items in the ground
    spawnBuriedItems(items) {
        // Clear existing
        for (const item of this.buriedItems) {
            this.scene.remove(item.mesh);
        }
        this.buriedItems = [];

        for (const itemData of items) {
            // Create visual marker (invisible until dug)
            const markerGeometry = new THREE.SphereGeometry(0.3, 8, 8);
            const markerMaterial = new THREE.MeshBasicMaterial({
                color: 0xffd700,
                transparent: true,
                opacity: 0
            });
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.set(itemData.position.x, -0.5, itemData.position.z);
            this.scene.add(marker);

            this.buriedItems.push({
                data: itemData,
                mesh: marker,
                found: false
            });
        }
    }

    // Update detector position based on mouse
    updateDetectorPosition(targetX, targetZ) {
        // Clamp to ground bounds
        const clampedX = Math.max(-40, Math.min(40, targetX));
        const clampedZ = Math.max(-30, Math.min(30, targetZ));

        // Smooth movement
        this.detector.position.x += (clampedX - this.detector.position.x) * 0.1;
        this.detector.position.z += (clampedZ - this.detector.position.z) * 0.1;

        // Slight tilt based on movement
        const dx = clampedX - this.detector.position.x;
        const dz = clampedZ - this.detector.position.z;
        this.detector.rotation.z = -dx * 0.5;
        this.detector.rotation.x = dz * 0.3;

        return { x: this.detector.position.x, z: this.detector.position.z };
    }

    // Update detector light color based on signal strength
    updateDetectorSignal(strength) {
        if (!this.detectorLight) return;

        // Green to yellow to red based on strength (reuse pre-allocated color)
        if (strength < 0.5) {
            this._tempColor.setRGB(0.13 + strength * 1.7, 0.77, 0.22 - strength * 0.4);
        } else {
            this._tempColor.setRGB(1, 0.77 - (strength - 0.5) * 1.5, 0.22 - strength * 0.4);
        }

        this.detectorLight.material.color.copy(this._tempColor);
        this.detectorLight.material.emissive.copy(this._tempColor);
        this.detectorLight.material.emissiveIntensity = 0.5 + strength * 1.5;
    }

    // Get closest buried item to detector
    getClosestItem() {
        if (this.buriedItems.length === 0) return null;

        let closest = null;
        let minDistance = Infinity;

        for (const item of this.buriedItems) {
            if (item.found) continue;

            const dx = this.detector.position.x - item.data.position.x;
            const dz = this.detector.position.z - item.data.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance < minDistance) {
                minDistance = distance;
                closest = { item, distance };
            }
        }

        return closest;
    }

    // Mark item as found and return it
    digItem(item) {
        item.found = true;

        // Make marker visible briefly
        item.mesh.material.opacity = 1;
        item.mesh.material.color.setHex(parseInt(item.data.metal.color.replace('#', '0x')));

        // Animate up
        const startY = item.mesh.position.y;
        const targetY = 2;
        let progress = 0;

        const animate = () => {
            progress += 0.05;
            item.mesh.position.y = startY + (targetY - startY) * progress;
            item.mesh.rotation.y += 0.1;
            item.mesh.scale.setScalar(1 + progress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Hide after animation
                setTimeout(() => {
                    item.mesh.material.opacity = 0;
                }, 500);
            }
        };
        animate();

        return item.data;
    }

    // Add sparkle particles at position
    addSparkles(x, y, z, color = 0xffd700) {
        const particleCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            velocities.push({
                x: (Math.random() - 0.5) * 0.4,
                y: Math.random() * 0.3 + 0.1,
                z: (Math.random() - 0.5) * 0.4
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.2,
            transparent: true,
            opacity: 1
        });

        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);

        // Animate particles
        let life = 1;
        const animateParticles = () => {
            life -= 0.02;
            if (life <= 0) {
                this.scene.remove(particles);
                return;
            }

            const pos = geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                pos[i * 3] += velocities[i].x;
                pos[i * 3 + 1] += velocities[i].y;
                pos[i * 3 + 2] += velocities[i].z;
                velocities[i].y -= 0.01; // gravity
            }
            geometry.attributes.position.needsUpdate = true;
            material.opacity = life;

            requestAnimationFrame(animateParticles);
        };
        animateParticles();
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / this.width) * 2 - 1;
        this.mouse.y = -(event.clientY / this.height) * 2 + 1;
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
    }

    // Get world position from mouse (reuses pre-allocated objects)
    getMouseWorldPosition() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        this.raycaster.ray.intersectPlane(this._intersectionPlane, this._intersectionPoint);
        return this._intersectionPoint;
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
