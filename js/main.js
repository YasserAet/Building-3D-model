// js/main.js

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x808080); // Set background to grey

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 2, 5); // Move the camera closer to the model
controls.minDistance = 1; // Set minimum zoom distance
controls.maxDistance = 3; // Set maximum zoom distance
controls.update();

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 7.5).normalize();
scene.add(directionalLight);

// Load the 3D model
let floors = {};
const loader = new THREE.GLTFLoader();
loader.load('models/b.glb', function(gltf) {
    const model = gltf.scene;
    model.scale.set(0.5 ,0.5, 0.5); // Scale down the model
    scene.add(model);

    // Traverse the model to find floors by name
    model.traverse((child) => {
        if (child.isMesh) {
            console.log('Found mesh:', child.name); // Debugging line
            if (child.name.includes('floor')) {
                floors[child.name] = child;
                console.log(`Added floor: ${child.name}`); // Debugging line
            }
        }
    });

    // Initially show the first floor and below
    // showFloorsUpTo('floor01');
}, undefined, function(error) {
    console.error('Error loading model:', error); // Debugging line
});

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Floor selection logic
function showFloor(floorName) {
    // Debugging: Log the floorName and available floors
    console.log('Attempting to show floor:', floorName);
    console.log('Available floors:', Object.keys(floors));

    // Hide all floors first
    Object.values(floors).forEach(floor => {
        floor.visible = false;
    });

    // Sort floor names to determine visibility order
    const sortedFloorNames = Object.keys(floors).sort();

    // Find the index of the specified floor
    const floorIndex = sortedFloorNames.indexOf(floorName);

    // Make the specified floor and all floors below it visible
    if (floorIndex !== -1) {
        for (let i = 0; i <= floorIndex; i++) {
            floors[sortedFloorNames[i]].visible = true;
        }
        console.log(`Floors up to "${floorName}" are now visible.`);
    } else {
        console.warn(`Floor "${floorName}" not found.`);
    }
}

// Optional: Hover effects
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(Object.values(floors));

    // Reset color of all floors
    Object.values(floors).forEach(floor => {
        floor.material.color.set(0xffffff); // Assuming white is the default color
    });

    if (intersects.length > 0) {
        const intersected = intersects[0].object;
        intersected.material.color.set(0xff0000);
    }
}

window.addEventListener('mousemove', onMouseMove, false);