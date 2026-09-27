// ======================================================================
// BASIC SETUP
// ======================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// MAIN CAMERA (free camera)
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);

// FIRST PERSON CAMERA (dock view)
const fpCamera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);

let firstPerson = false;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);



// ======================================================================
// TEXTURE LOADER
// ======================================================================
const textureLoader = new THREE.TextureLoader();

// Solar panel texture 
const solarPanelTexture = textureLoader.load( 
	"https://threejs.org/examples/textures/uv_grid_opengl.jpg" 
);

// Docking module texture
const dockingTexture = textureLoader.load(
	"https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/corrugated_iron_02/corrugated_iron_02_diff_2k.jpg"
);

// Normal map for large cargo cylinders
const cargoNormalTexture = textureLoader.load(
	"https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/corrugated_iron_02/corrugated_iron_02_nor_gl_2k.jpg"
);

// Environment map for metallic centre cylinder
const environmentTexture = new THREE.CubeTextureLoader().load([
	"https://threejs.org/examples/textures/cube/Bridge2/posx.jpg",
	"https://threejs.org/examples/textures/cube/Bridge2/negx.jpg",
	"https://threejs.org/examples/textures/cube/Bridge2/posy.jpg",
	"https://threejs.org/examples/textures/cube/Bridge2/negy.jpg",
	"https://threejs.org/examples/textures/cube/Bridge2/posz.jpg",
	"https://threejs.org/examples/textures/cube/Bridge2/negz.jpg"
]);



// ======================================================================
// LIGHTING
// ======================================================================
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.04);
scene.add(ambientLight);



// ======================================================================
// SUN / DIRECTIONAL LIGHT
// ======================================================================
const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);

dirLight.position.set(20, 10, 10);

scene.add(dirLight);



// ======================================================================
// DAY / ECLIPSE MODE
// ======================================================================
let eclipseMode = false;

function updateSunLighting() {

    if (eclipseMode) {

        // Eclipse: greatly reduce sunlight
        dirLight.intensity = 0.08;
        ambientLight.intensity = 0.015;

    } else {

        // Day: normal sunlight
        dirLight.intensity = 0.7;
        ambientLight.intensity = 0.04;

    }

}



// ======================================================================
// VISIBLE SUN
// ======================================================================
const sunGeometry = new THREE.SphereGeometry(40, 32, 32);

const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa22
});

const sunMesh = new THREE.Mesh(
    sunGeometry,
    sunMaterial
);

// Sun in the same direction as the DirectionalLight
sunMesh.position.set(250, 150, 150);

scene.add(sunMesh);



// ======================================================================
// PAUSE TEXT
// ======================================================================
const pauseText = document.createElement("div");

pauseText.style.position = "absolute";
pauseText.style.top = "10px";
pauseText.style.left = "10px";
pauseText.style.color = "white";
pauseText.style.fontFamily = "Arial";
pauseText.style.fontSize = "16px";
pauseText.style.zIndex = "100";

document.body.appendChild(pauseText);

const controlsText = document.createElement("div");

controlsText.style.position = "absolute";
controlsText.style.top = "10px";
controlsText.style.right = "10px";
controlsText.style.color = "white";
controlsText.style.fontFamily = "Arial";
controlsText.style.fontSize = "14px";
controlsText.style.background = "rgba(0,0,0,0.6)";
controlsText.style.padding = "10px";
controlsText.style.border = "1px solid white";
controlsText.style.zIndex = "100";

controlsText.innerHTML = `
<b>CONTROLS</b><br>
W - Forward<br>
S - Backward<br>
A - Left<br>
D - Right<br>
SHIFT - Up<br>
CTRL - Down<br>
SPACEBAR - Pause / Resume<br>
C - Camera View Toggle<br>
E - Day / Eclipse Toggle<br>
1 - Flat Shading Toggle<br>
2 - Gouraud Shading Toggle<br>
3 - Phong Shading Toggle<br>
Mouse Wheel - Zoom<br>
`;

document.body.appendChild(controlsText);



// ======================================================================
// STATION GROUP
// ======================================================================
const station = new THREE.Group();
scene.add(station);



// ======================================================================
// STARFIELD
// ======================================================================
function createStars(count, size) {
	const geometry = new THREE.BufferGeometry();

	const vertices = [];

	for (let i = 0; i < count; i++) {
		vertices.push(
		(Math.random() - 0.5) * 1000,
		(Math.random() - 0.5) * 1000,
		(Math.random() - 0.5) * 1000
		);
	}
	
	geometry.setAttribute(
	"position", new THREE.Float32BufferAttribute(vertices, 3)
	);

	const material = new THREE.PointsMaterial({
	color: 0xffffff,
	size: size,
	sizeAttenuation: true,
	transparent: true,
	opacity: 1.0
	});

	const stars = new THREE.Points(geometry, material);
	
	scene.add(stars);
	
	return stars;
}

const smallStars = createStars(3000, 0.8);
const mediumStars = createStars(800, 1.5);
const brightStars = createStars(150, 3.0);



// ======================================================================
// EARTH
// ======================================================================
const earthDayMap = textureLoader.load(
	"https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg"
);

const earthNightMap = textureLoader.load(
	"https://threejs.org/examples/textures/earth_at_night.jpg"
);

const earth = new THREE.Mesh(
	new THREE.SphereGeometry(15, 64, 64),
	new THREE.MeshStandardMaterial({
	map: earthDayMap,
	emissiveMap: earthNightMap,
	emissive: new THREE.Color(0x88aaff),
	emissiveIntensity: 0.35
	})
);

earth.position.set(-25, -10, -50);
scene.add(earth);



// ======================================================================
// MOON
// ======================================================================
const moonGeo = new THREE.SphereGeometry(3, 32, 32);

const moonMat = new THREE.MeshStandardMaterial({
	color: 0xcccccc,
	roughness: 0.9,
	metalness: 0.0
});

const moon = new THREE.Mesh(moonGeo, moonMat);
scene.add(moon);

let moonAngle = 0;
const moonRadius = 25;



// ======================================================================
// MATERIALS
// ======================================================================
const dockLightMat = new THREE.MeshBasicMaterial({
	color: 0x00ffff
});

const darkGrey = new THREE.MeshStandardMaterial({
	color: 0xd6d6d6,
	metalness: 1.15,
	emissive: 0x222222,
	emissiveIntensity: 0.6
});

const dockMat = new THREE.MeshStandardMaterial({
	map: dockingTexture,
	metalness: 0.5,
	roughness: 0.5,
	emissive: 0x1a1a1a,
	emissiveIntensity: 0.3
});

// Normal-mapped material for large cargo cylinders
const cargoNormalMat = new THREE.MeshStandardMaterial({
	color: 0xd6d6d6,
	metalness: 1.0,
	roughness: 0.5,
	normalMap: cargoNormalTexture
});

// Environment-mapped material for metallic centre cylinder
const environmentMat = new THREE.MeshStandardMaterial({
	color: 0xd6d6d6,
	metalness: 1.0,
	roughness: 0.15,
	envMap: environmentTexture,
	envMapIntensity: 1.5
});

const yellow = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
const red = new THREE.MeshBasicMaterial({ color: 0xff0000 });


// ======================================================================
// SHADING MATERIALS
// ======================================================================
// Flat shading
const flatShadeMat = new THREE.MeshStandardMaterial({
	color: 0xd6d6d6,
	roughness: 0.8,
	flatShading: true
});

// Gouraud shading
const gouraudShadeMat = new THREE.MeshLambertMaterial({
	color: 0xaaaaaa
});

// Phong shading
const phongShadeMat = new THREE.MeshPhongMaterial({
	color: 0xaaaaaa,
	shininess: 100,
	specular: 0xffffff
});

const shipPhongMat = new THREE.MeshPhongMaterial({
	color: 0x9aa0a6,
	shininess: 100,
	specular: 0xffffff
});


// ======================================================================
// SHADING TOGGLE
// ======================================================================
let shadingMode = 0;

function applyShadingMode() {

	// ==============================================================
	// NORMAL / ORIGINAL MATERIALS
	// ==============================================================

	if (shadingMode === 0) {

		// Large cylinders to normal-mapped material
		leftBig.material = cargoNormalMat;
		rightBig.material = cargoNormalMat;

		// Small outer cylinders to original material
		leftSmall.material = darkGrey;
		rightSmall.material = darkGrey;

		// Centre core to original material
		core.material = environmentMat;

		shipBodies.forEach((body) => {
			body.material = body.userData.originalMaterials;
		});
	}


	// ==============================================================
	// 1 = FLAT SHADING
	// Large cylinders only
	// ==============================================================

	else if (shadingMode === 1) {

		// ONLY change the large cylinders
		leftBig.material = flatShadeMat;
		rightBig.material = flatShadeMat;
	}


	// ==============================================================
	// 2 = GOURAUD SHADING
	// Small outer cylinders only
	// ==============================================================

	else if (shadingMode === 2) {

		// ONLY change the small cylinders
		leftSmall.material = gouraudShadeMat;
		rightSmall.material = gouraudShadeMat;
	}


	// ==============================================================
	// 3 = PHONG SHADING
	// Centre cylinder only
	// ==============================================================

	else if (shadingMode === 3) {

	// Centre core to Phong shading
	core.material = phongShadeMat;

	// Ships to Phong shading
	shipBodies.forEach((body) => {
		body.material = shipPhongMat;
		});
	}
}



// ======================================================================
// DIMENSIONS
// ======================================================================
const CORE_LENGTH = 2;
const BIG_LENGTH = 3;
const SMALL_LENGTH = 1.5;



// ======================================================================
// CENTER CYLINDER
// ======================================================================
const core = new THREE.Mesh(
	new THREE.CylinderGeometry(0.5, 0.5, CORE_LENGTH, 32), environmentMat
);

core.rotation.z = Math.PI / 2;
station.add(core);



// ======================================================================
// SEARCHLIGHT MOUNT
// ======================================================================
const searchlightMountGeo = new THREE.CylinderGeometry(
	0.08,
	0.08,
	0.2,
	16
);

const searchlightMountMat = new THREE.MeshStandardMaterial({
	color: 0x333333,
	metalness: 0.8,
	roughness: 0.3
});

const searchlightMount = new THREE.Mesh(
	searchlightMountGeo,
	searchlightMountMat
);

// Mounted on top of the centre cylinder
searchlightMount.position.set(0, 0.6, 0);

station.add(searchlightMount);

// Small visible searchlight bulb
const searchlightBulbGeo = new THREE.SphereGeometry(
	0.12,
	16,
	16
);

const searchlightBulbMat = new THREE.MeshBasicMaterial({
	color: 0xffffff
});

const searchlightBulb = new THREE.Mesh(
	searchlightBulbGeo,
	searchlightBulbMat
);

searchlightBulb.position.set(0, 0.15, 0);

searchlightMount.add(searchlightBulb);



// ======================================================================
// DOCKING MODULES (CENTER)
// ======================================================================
function addDockLights(x, y, z) {
	const lightGeo = new THREE.SphereGeometry(0.05, 8, 8);

	// Point light for the docking bay
	const dockPointLight = new THREE.PointLight(0x00ffff, 1.5, 4);
	dockPointLight.position.set(x, y, z);
	station.add(dockPointLight);

	const offset = 0.45* Math.sign(z);

	const positions = [
		[0, 0.30, offset],   // top front
		[0, -0.30, offset],  // bottom front
		[0.30, 0, offset],   // right front
		[-0.30, 0, offset]   // left front
	];

	positions.forEach(([dx, dy, dz]) => {
	const light = new THREE.Mesh(lightGeo, dockLightMat);
	light.position.set(x + dx, y + dy, z + dz);
	station.add(light);
	});
}

const dockGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.9, 24);

const centerDockFront = new THREE.Mesh(dockGeo, dockMat);
centerDockFront.rotation.x = Math.PI / 2;
centerDockFront.position.set(0, 0, 0.85);
station.add(centerDockFront);
centerDockFront.add(fpCamera);
	fpCamera.position.set(0, 0, 0.6);
	fpCamera.lookAt(0, 0, 5);
addDockLights(0, 0, 0.85);

const centerDockBack = new THREE.Mesh(dockGeo, dockMat);
centerDockBack.rotation.x = Math.PI / 2;
centerDockBack.position.set(0, 0, -0.85);
station.add(centerDockBack);
addDockLights(0, 0, -0.85);



// ======================================================================
// SPOTLIGHTS
// ======================================================================
const dockingSpotlight = new THREE.SpotLight(
	0x00ffff,
	8.0,
	20,
	Math.PI / 6,
	0.5
);

// Mounted at the front docking bay
dockingSpotlight.position.set(0, 0, 1.3);

// Point outward from the docking bay
dockingSpotlight.target.position.set(0, 0, 8);

station.add(dockingSpotlight);
station.add(dockingSpotlight.target);


// ======================================================================
// ROTATING SEARCHLIGHT
// ======================================================================
const searchlight = new THREE.SpotLight(
	0xffffff,
	12,
	30,
	Math.PI / 8,
	0.5
);

// Searchlight mounted on top of the centre cylinder
searchlight.position.set(0, 0.7, 0);

const searchlightTarget = new THREE.Object3D();

searchlightTarget.position.set(10, 0, 0);

station.add(searchlight);
station.add(searchlightTarget);

searchlight.target = searchlightTarget;

// Rotation angle for the searchlight
let searchlightAngle = 0;



// ======================================================================
// LARGE CYLINDERS
// ======================================================================
const bigOffset = CORE_LENGTH / 2 + BIG_LENGTH / 2;

const bigGeo = new THREE.CylinderGeometry(0.7, 0.7, BIG_LENGTH, 32);

const leftBig = new THREE.Mesh(bigGeo, cargoNormalMat);
leftBig.rotation.z = Math.PI / 2;
leftBig.position.x = -bigOffset;
station.add(leftBig);

const rightBig = new THREE.Mesh(bigGeo, cargoNormalMat);
rightBig.rotation.z = Math.PI / 2;
rightBig.position.x = bigOffset;
station.add(rightBig);



// ======================================================================
// LARGE CYLINDER DOCKS
// ======================================================================
function addLargeCylinderDocks(xPos) {
	const dockLength = 0.9;

	const cylinderRadius = 0.7;

	// Push the docks outside the cylinder surface
	const offsetZ = cylinderRadius + dockLength / 2;

	// FRONT DOCK
	const frontDock = new THREE.Mesh(dockGeo, dockMat);
	frontDock.rotation.x = Math.PI / 2;
	frontDock.position.set(xPos, 0, offsetZ);
	station.add(frontDock);

	addDockLights(xPos, 0, offsetZ);

	// BACK DOCK
	const backDock = new THREE.Mesh(dockGeo, dockMat);
	backDock.rotation.x = Math.PI / 2;
	backDock.position.set(xPos, 0, -offsetZ);
	station.add(backDock);

	addDockLights(xPos, 0, -offsetZ);
}

addLargeCylinderDocks(-bigOffset);
addLargeCylinderDocks(bigOffset);



// ======================================================================
// OUTER CYLINDERS
// ======================================================================
const smallOffset = bigOffset + BIG_LENGTH / 2 + SMALL_LENGTH / 2;

const smallGeo = new THREE.CylinderGeometry(0.25, 0.25, SMALL_LENGTH, 32);

const leftSmall = new THREE.Mesh(smallGeo, darkGrey);
leftSmall.rotation.z = Math.PI / 2;
leftSmall.position.x = -smallOffset;
station.add(leftSmall);

const rightSmall = new THREE.Mesh(smallGeo, darkGrey);
rightSmall.rotation.z = Math.PI / 2;
rightSmall.position.x = smallOffset;
station.add(rightSmall);



// ======================================================================
// SOLAR PANELS
// ======================================================================
function createSolarArray(x, y, z, scaleY = 1, tilt = 0) {
	const group = new THREE.Group();

	const cellGeo = new THREE.BoxGeometry(0.08, 0.3, 1.2);

	const cellMat = new THREE.MeshStandardMaterial({
	map: solarPanelTexture,
	roughness: 0.5,
	metalness: 0.3
	});

    for (let i = -5; i <= 5; i++) {

        const cell = new THREE.Mesh(cellGeo, cellMat);
        cell.position.y = i * 0.35;

        group.add(cell);
    }

    group.position.set(x, y, z);

    group.scale.y = scaleY;

    group.rotation.z = tilt;

    station.add(group);

    return group;
}

const panelEndOffset = smallOffset + SMALL_LENGTH / 2;

// LEFT SIDE PANELS (moved to end of cylinder)
const lp1 = createSolarArray(-panelEndOffset, 2.1, 0);
const lp2 = createSolarArray(-panelEndOffset, -2.1, 0);

// RIGHT SIDE PANELS (moved to end of cylinder)
const rp1 = createSolarArray(panelEndOffset, 2.1, 0);
const rp2 = createSolarArray(panelEndOffset, -2.1, 0);



// ======================================================================
// SOLAR PANEL MOUNT ARMS 
// ======================================================================
const armGeo = new THREE.BoxGeometry(0.15, 0.15, 4);

const armMat = new THREE.MeshStandardMaterial({
	color: 0xbfbfbf,
	metalness: 0.8,
	roughness: 0.25,
	emissive: 0x111111
});

function makeArm(x, y, z) {
	const arm = new THREE.Mesh(armGeo, armMat);

	// Rotate so the long axis (Z) becomes vertical (Y)
	arm.rotation.x = Math.PI / 2;

	arm.position.set(x, y, z);
	station.add(arm);

	return arm;
}

// LEFT TOP ARM
const armL1 = makeArm(-panelEndOffset, 2.1, 0);

// LEFT BOTTOM ARM
const armL2 = makeArm(-panelEndOffset, -2.1, 0);

// RIGHT TOP ARM
const armR1 = makeArm(panelEndOffset, 2.1, 0);

// RIGHT BOTTOM ARM
const armR2 = makeArm(panelEndOffset, -2.1, 0);



// ======================================================================
// COMMUNICATION TOWERS
// ======================================================================
const tallTowerHeight = 2.2;
const shortTowerHeight = 1.4;

const tallTowerGeo = new THREE.CylinderGeometry(0.05, 0.05, tallTowerHeight, 12);
const shortTowerGeo = new THREE.CylinderGeometry(0.05, 0.05, shortTowerHeight, 12);

const towerMat = new THREE.MeshStandardMaterial({
	color: 0xcfcfcf,
	metalness: 1.0,
	roughness: 0.15,
	emissive: 0x222222,
	envMapIntensity: 1.2
});

// LEFT TOWER
const leftTower = new THREE.Mesh(tallTowerGeo, towerMat);
leftTower.position.set(-bigOffset, tallTowerHeight / 2, 0);
station.add(leftTower);

// RIGHT TOWER
const rightTower = new THREE.Mesh(shortTowerGeo, towerMat);
rightTower.position.set(bigOffset, shortTowerHeight / 2, 0);
station.add(rightTower);



// ======================================================================
// COMMUNICATION BEACONS
// ======================================================================
const beaconGeo = new THREE.SphereGeometry(0.12, 12, 12);

const leftBeaconMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
const rightBeaconMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

const leftBeacon = new THREE.Mesh(beaconGeo, leftBeaconMat);
leftBeacon.position.set(-bigOffset, tallTowerHeight + 0.12, 0);
station.add(leftBeacon);

const rightBeacon = new THREE.Mesh(beaconGeo, rightBeaconMat);
rightBeacon.position.set(bigOffset, shortTowerHeight + 0.12, 0);
station.add(rightBeacon);



// ======================================================================
// 4 SPACECRAFTS
// ======================================================================
const ships = [];
const shipBodies = [];

function createShip(radius, speed, yOffset, tiltX, tiltZ) {
	const ship = new THREE.Group();

	// =========================
	// MAIN BODY
	// =========================
	const geometry = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 24);

	const body = new THREE.Mesh(
	geometry,
		[
		new THREE.MeshStandardMaterial({ color: 0x9aa0a6 }), // side
		new THREE.MeshStandardMaterial({ color: 0x9aa0a6 }), // side
		new THREE.MeshBasicMaterial({ color: 0xffffff }), // top cap (front)
		new THREE.MeshBasicMaterial({ color: 0xff0000 }), // bottom cap (back)
		new THREE.MeshStandardMaterial({ color: 0x9aa0a6 }), // side
		new THREE.MeshStandardMaterial({ color: 0x9aa0a6 })  // side
		]
	);

	body.rotation.z = Math.PI / 2;
	ship.add(body);
	body.userData.originalMaterials = body.material;
	shipBodies.push(body);

	// =========================
	// SIDE WINGS
	// =========================
	const wingGeo = new THREE.BoxGeometry(0.02, 0.12, 0.6);
	const wingMat = new THREE.MeshStandardMaterial({
		color: 0x8ecbff,
		metalness: 0.6,
		roughness: 0.3
	});

	const wing1 = new THREE.Mesh(wingGeo, wingMat);
	wing1.position.y = 0.30;
	wing1.rotation.x = Math.PI / 2;

	const wing2 = new THREE.Mesh(wingGeo, wingMat);
	wing2.position.y = -0.30;
	wing2.rotation.x = Math.PI / 2;

	ship.add(wing1);
	ship.add(wing2);

	// =========================
	// NAV LIGHTS
	// =========================
	const frontLight = new THREE.PointLight(0xffffff, 0, 2);
	frontLight.position.set(0, 0, 0.3);
	ship.add(frontLight);

	const rearLight = new THREE.PointLight(0xff0000, 0, 2);
	rearLight.position.set(0, 0, -0.3);
	ship.add(rearLight);

	// =========================
	// ADD TO SCENE
	// =========================
	station.add(ship);

	// =========================
	// STORE SHIP
	// =========================
	ships.push({
		mesh: ship,
		radius,
		speed,
		angle: Math.random() * Math.PI * 2,
		y: yOffset,
		tiltX,
		tiltZ,
		frontLight,
		rearLight
		});
	}

	// 4 ships
	createShip(6, 0.004, 0, 0.3, 0.0);
	createShip(8, 0.003, 0, 0.8, 0.4);
	createShip(10, 0.0025, 0, -0.5, 0.6);
	createShip(12, 0.002, 0, 1.0, -0.3);



// ======================================================================
// CAMERA
// ======================================================================
camera.position.z = 15;
camera.position.y = 2;



// ======================================================================
// PAUSE / RESUME SYSTEM
// ======================================================================
let paused = false;

window.addEventListener("keydown", (e) => {
	if (e.code === "Space") {
		paused = !paused;
		}
});



// ======================================================================
// CAMERA CONTROLS
// ======================================================================
const keys = {};

window.addEventListener("keydown", (e) => {
	keys[e.key.toLowerCase()] = true;

	if (e.key.toLowerCase() === "c") {
		firstPerson = !firstPerson;
		}

	 // Day / Eclipse toggle
    if (e.key.toLowerCase() === "e") {
        eclipseMode = !eclipseMode;
        updateSunLighting();
    }

	// Shading controls
	if (e.key === "1") {

		if (shadingMode === 1) {
			shadingMode = 0;
		} else {
			shadingMode = 1;
		}

	applyShadingMode();
	}

	if (e.key === "2") {

		if (shadingMode === 2) {
			shadingMode = 0;
		} else {
		shadingMode = 2;
		}

	applyShadingMode();
	}

	if (e.key === "3") {

		if (shadingMode === 3) {
			shadingMode = 0;
		} else {
			shadingMode = 3;
		}

	applyShadingMode();
	}	
});

window.addEventListener("keyup", (e) => {
	keys[e.key.toLowerCase()] = false;
});

// MOUSE WHEEL ZOOM
window.addEventListener("wheel", (e) => {
	camera.position.z += e.deltaY * 0.01;
});



// ======================================================================
// RESIZE
// ======================================================================
window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
});



// ======================================================================
// ANIMATION
// ======================================================================
let pulseTime = 0;
let twinkleTime = 0;

function animate() {
	requestAnimationFrame(animate);

	// ==========================
	// CAMERA MOVEMENT AND ZOOM
	// ==========================
	const moveSpeed = 0.08;

	if (keys["w"]) camera.position.z -= moveSpeed;
	if (keys["s"]) camera.position.z += moveSpeed;
	if (keys["a"]) camera.position.x -= moveSpeed;
	if (keys["d"]) camera.position.x += moveSpeed;
	if (keys["shift"]) camera.position.y += moveSpeed;
	if (keys["control"]) camera.position.y -= moveSpeed;

	// ==========================
	// SKIP ANIMATION IF PAUSED
	// ==========================
	if (!paused) {
		station.rotation.y += 0.0007;
		earth.rotation.y += 0.0003;

		// ==========================
		// ROTATING SEARCHLIGHT
		// ==========================
		searchlightAngle += 0.003;

		searchlightTarget.position.x =
		Math.cos(searchlightAngle) * 10;

		searchlightTarget.position.z =
		Math.sin(searchlightAngle) * 10;

		//MOON ORBIT
		moonAngle += 0.001;
	
		moon.position.x = earth.position.x + Math.cos(moonAngle) * moonRadius;
		moon.position.z = earth.position.z + Math.sin(moonAngle) * moonRadius;
		moon.position.y = earth.position.y + Math.sin(moonAngle * 0.5) * 1.5;
	
		twinkleTime += 0.01;

		// ==========================
		// PULSING BEACONS
		// ==========================
		pulseTime += 0.02;

		// LEFT BEACON (YELLOW)
		const leftPulse = (Math.sin(pulseTime) + 1) / 2;

		// RIGHT BEACON (RED & FASTER PULSE)
		const rightPulse = (Math.sin(pulseTime * 1.8 + 1.5) + 1) / 2;

		// Brightness range
		const min = 0.05;
		const max = 1.0;

		const leftIntensity = min + (max - min) * leftPulse;
		const rightIntensity = min + (max - min) * rightPulse;

		// LEFT BEACON (YELLOW)
		leftBeacon.material.color.setRGB(
		leftIntensity,
		leftIntensity * 0.85,
		0
		);

		// RIGHT BEACON (RED)
		rightBeacon.material.color.setRGB(
		rightIntensity,
		0,
		0
		);

		smallStars.material.opacity = 0.8 + Math.sin(twinkleTime * 1.4) * 0.2;
		mediumStars.material.opacity = 0.75 + Math.sin(twinkleTime * 0.9 + 2) * 0.25;
		brightStars.material.opacity = 0.9 + Math.sin(twinkleTime * 0.5 + 5) * 0.1;

		smallStars.rotation.y += 0.00001;
		mediumStars.rotation.y += 0.000005;
		brightStars.rotation.y += 0.000002;

		// ==========================
		// ORBITING SHIPS
		// ==========================
		ships.forEach((ship) => {
			ship.angle = (ship.angle + ship.speed) % (Math.PI * 2);
			
			let x = Math.cos(ship.angle) * ship.radius;
			let y = 0;
			let z = Math.sin(ship.angle) * ship.radius;

			let cosX = Math.cos(ship.tiltX);
			let sinX = Math.sin(ship.tiltX);
	
			let y1 = y * cosX - z * sinX;
			let z1 = y * sinX + z * cosX;

			y = y1;
			z = z1;

			let cosZ = Math.cos(ship.tiltZ);
			let sinZ = Math.sin(ship.tiltZ);

			let x1 = x * cosZ - y * sinZ;
			let y2 = x * sinZ + y * cosZ;

			x = x1;
			y = y2;

			ship.mesh.position.set(x, y, z);
			ship.mesh.lookAt(0, 0, 0);

			const blink = Math.sin(pulseTime * 6) * 0.5 + 0.5;

			// front white light
			ship.frontLight.intensity = blink * 2.0;

			// rear red light (slower + offset phase)
			ship.rearLight.intensity = (Math.sin(pulseTime * 4 + 2) * 0.5 + 0.5) * 1.5;
			});
	}

	pauseText.innerHTML = `
	<b>${paused ? "PAUSED" : "RUNNING"}</b><br>
	Press SPACE to PAUSE / RESUME
	`;

	renderer.render(
		scene,
		firstPerson ? fpCamera : camera
	);
}

animate();