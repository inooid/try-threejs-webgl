import * as THREE from 'three';
import { KeyDownManager } from './utils';

const keyDownManager = new KeyDownManager();

// Setup scene
const scene = new THREE.Scene();

// Setup camera
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight);
camera.position.set(1, 2, 2.5);
camera.lookAt(scene.position);

// Room
const room = new THREE.Mesh(
  new THREE.BoxGeometry(6, 6, 6, 8, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0x404040, wireframe: true })
);
room.position.y = 3;
scene.add(room);

// Add lighting
const lightY = 0.6;
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

const light = new THREE.PointLight(0xff0000, 2, undefined, 2);
light.position.y = lightY;
scene.add(light);

const debugLightBox = new THREE.Mesh(
  new THREE.BoxGeometry(0.1, 0.1, 0.1),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
debugLightBox.position.y = lightY;
scene.add(debugLightBox);

// Create the cube
const geometry = new THREE.BoxGeometry(3, 1, 3);
const material = new THREE.MeshPhongMaterial({ color: 0xffbf00, lights: true });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Create the WebGL renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

// Add canvas to the DOM
document.body.appendChild(renderer.domElement);

const updatePosition = (axis, operation) => {
  const incrementalValue = 0.15;
  const updateValue = operation === 'INC' ? incrementalValue : -incrementalValue;

  return object3d => {
    object3d.position[axis] = object3d.position[axis] += updateValue;
  };
};

function changeLightPosition(axis, operation) {
  const updateMethod = updatePosition(axis, operation);

  updateMethod(light);
  updateMethod(debugLightBox);
}

function handleKeyDown(e) {
  keyDownManager.register(e.key);
}

function handleKeyUp(e) {
  keyDownManager.remove(e.key);
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

function animate() {
  requestAnimationFrame(animate);

  // Lets rotate the cube every time we call animate
  cube.rotation.y += 0.01;

  // Lets handle keypresses fluidly
  const pressedKeys = keyDownManager.allPressedKeys();

  if (pressedKeys.includes('ArrowUp')) {
    changeLightPosition('z', 'DEC');
  }
  if (pressedKeys.includes('ArrowDown')) {
    changeLightPosition('z', 'INC');
  }
  if (pressedKeys.includes('ArrowLeft')) {
    changeLightPosition('x', 'DEC');
  }
  if (pressedKeys.includes('ArrowRight')) {
    changeLightPosition('x', 'INC');
  }

  // Render the scene with the camera
  renderer.render(scene, camera);
}
animate();
