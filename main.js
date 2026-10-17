import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- 1. SETUP SCENE, CAMERA, RENDERER ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 4); 
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x05000a, 1); 
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false;
controls.enablePan = false;
controls.maxPolarAngle = Math.PI / 1.5; 

// --- 2. CREATE THE SURFACE GRID ---
const radius = 30; 
const latCount = 150; 
const lonCount = 250; 
const points = [];
const colors = [];
const originalPositions = [];

const colorDeepPurple = new THREE.Color('#4a00e0');
const colorNeonPink = new THREE.Color('#ff00ea');
const colorWhite = new THREE.Color('#ffffff');
const colorLightBlue = new THREE.Color('#00d4ff'); 

for (let i = 0; i <= latCount; i++) {
    const phi = (i / latCount) * Math.PI;
    
    for (let j = 0; j < lonCount; j++) {
        const theta = (j / lonCount) * Math.PI * 2;
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi); 
        const z = radius * Math.sin(phi) * Math.sin(theta);

        points.push(x, y, z);
        originalPositions.push(x, y, z);

        let finalColor = new THREE.Color();
        const normalizedY = (y / radius) + 1; 

        if (normalizedY > 1.2) {
            finalColor.lerpColors(colorNeonPink, colorWhite, Math.random());
        } else if (normalizedY > 0.8) {
            finalColor.lerpColors(colorDeepPurple, colorNeonPink, (normalizedY - 0.8) / 0.4);
        } else {
            finalColor.copy(colorDeepPurple);
        }

        if (Math.random() > 0.98) {
            finalColor.copy(colorLightBlue);
        }

        colors.push(finalColor.r, finalColor.g, finalColor.b);
    }
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

const createCircleTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
};

const material = new THREE.PointsMaterial({
    size: 0.12,
    map: createCircleTexture(),
    vertexColors: true, 
    transparent: true,
    opacity: 1.0,
    depthWrite: false,
    blending: THREE.AdditiveBlending 
});

const gridGlobe = new THREE.Points(geometry, material);
gridGlobe.rotation.x = -0.5; 
gridGlobe.rotation.z = 0.2;
scene.add(gridGlobe);

// --- 3. CREATE BOKEH / DUST ---
const bokehGeometry = new THREE.BufferGeometry();
const bokehCount = 300;
const bokehPositions = new Float32Array(bokehCount * 3);
const bokehColors = new Float32Array(bokehCount * 3);

for (let i = 0; i < bokehCount; i++) {
    bokehPositions[i * 3] = (Math.random() - 0.5) * 60;
    bokehPositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    bokehPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;

    let c = Math.random() > 0.5 ? colorNeonPink : colorDeepPurple;
    if (Math.random() > 0.9) c = colorWhite;

    bokehColors[i * 3] = c.r;
    bokehColors[i * 3 + 1] = c.g;
    bokehColors[i * 3 + 2] = c.b;
}
bokehGeometry.setAttribute('position', new THREE.BufferAttribute(bokehPositions, 3));
bokehGeometry.setAttribute('color', new THREE.BufferAttribute(bokehColors, 3));

const createBlurTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
};

const bokehMaterial = new THREE.PointsMaterial({
    size: 1.5, 
    map: createBlurTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.4, 
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const bokehDust = new THREE.Points(bokehGeometry, bokehMaterial);
scene.add(bokehDust);

// --- 4. INTERACTION LOGIC ---
let mouse = new THREE.Vector2(-100, -100);
let isHovering = false;
const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 1.0; 

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('mouseleave', () => {
    mouse.set(-100, -100);
});

// --- 5. ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    bokehDust.rotation.y = time * 0.02;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(gridGlobe);
    
    if (intersects.length > 0) {
        isHovering = true;
    } else {
        isHovering = false;
    }

    const positionAttribute = geometry.attributes.position;
    const posArray = positionAttribute.array;
    const targetSpread = isHovering ? 1.05 : 1.0; 
    
    if (!gridGlobe.userData.spread) gridGlobe.userData.spread = 1.0;
    gridGlobe.userData.spread += (targetSpread - gridGlobe.userData.spread) * 0.1;

    const currentSpread = gridGlobe.userData.spread;

    for (let i = 0; i < posArray.length; i += 3) {
        const ox = originalPositions[i];
        const oy = originalPositions[i + 1];
        const oz = originalPositions[i + 2];

        if (isHovering) {
            const jitter = 0.1;
            posArray[i] = ox * currentSpread + (Math.random() - 0.5) * jitter;
            posArray[i + 1] = oy * currentSpread + (Math.random() - 0.5) * jitter;
            posArray[i + 2] = oz * currentSpread + (Math.random() - 0.5) * jitter;
        } else {
            posArray[i] = ox * currentSpread;
            posArray[i + 1] = oy * currentSpread;
            posArray[i + 2] = oz * currentSpread;
        }
    }
    
    positionAttribute.needsUpdate = true;
    material.size = 0.12 + Math.sin(time * 5) * 0.02;

    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});