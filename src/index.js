import * as THREE from 'three';
import { KeyDownManager } from './utils';

const keyDownManager = new KeyDownManager();

const totalAmountOfLights = 128;

// Setup scene
const scene = new THREE.Scene();

// Setup camera
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight);
camera.position.set(5, 2, 5);
// camera.lookAt(scene.position);

// Music
// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add(listener);

// create a global audio source
const sound = new THREE.Audio(listener);

// the analyser
const audioAnalyser = new THREE.AudioAnalyser(sound, totalAmountOfLights * 2);

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load('./music/OX2 - Flamingos (ft. Davide Mozart).mp3', buffer => {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.1);
});

// Room
// const room = new THREE.Mesh(
//   new THREE.BoxGeometry(6, 6, 6, 8, 8, 8),
//   new THREE.MeshBasicMaterial({ color: 0x404040, wireframe: true })
// );
// room.position.y = 3;
// scene.add(room);

// Add ambient lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);


class FakeLight {
  static get defaultY() {
    return 0.6;
  }

  constructor({ x, scene }) {
    this.light = new THREE.PointLight(0xff0000, 2, undefined, 2);

    this.box = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.1),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );

    this.setX(x * 0.1);
    this.setY(FakeLight.defaultY);

    this.scene = scene;
    this.scene.add(this.light);
    this.scene.add(this.box);
  }

  setY(y) {
    this.light.position.y = y;
    this.box.position.y = y;
  }

  setX(x) {
    this.light.position.x = x;
    this.box.position.x = x;
  }
}

class LightSupervisor {
  constructor({ scene }) {
    this.fakeLights = [];
    this.scene = scene;
  }

  createLightsForAudio() {
    for (let i = 0; i < totalAmountOfLights; i += 1) {
      const x = i * 1;
      this.fakeLights[i] = new FakeLight({ scene: this.scene, x });
    }

    return this;
  }

  setHeightsForFrequencies(frequencyData) {
    frequencyData.forEach((frequency, i) => {
      const fakeLight = this.fakeLights[i];
      fakeLight.setY(frequency * 0.009);
      console.log(fakeLight.box.position);
    })
  }

  get(index) {
    return this.fakeLights[index];
  }
}

const lightSupervisor = new LightSupervisor({ scene }).createLightsForAudio();


// Create the cube
const geometry = new THREE.BoxGeometry(3, 1, 3);
const material = new THREE.MeshPhongMaterial({ color: 0xffbf00, lights: true });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// Create the WebGL renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

function init() {
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

  const changeCameraPosition = (axis, operation) => {
    const incrementalValue = 0.15;
    const updateValue = operation === 'INC' ? incrementalValue : -incrementalValue;

    camera.position[axis] = camera.position[axis] += updateValue;
  };

  function animate() {
    requestAnimationFrame(animate);

    lightSupervisor.setHeightsForFrequencies(audioAnalyser.getFrequencyData());

    if (keyDownManager.isPressing('ArrowUp')) {
      changeCameraPosition('z', 'DEC');
    }
    if (keyDownManager.isPressing('ArrowDown')) {
      changeCameraPosition('z', 'INC');
    }
    if (keyDownManager.isPressing('ArrowLeft')) {
      changeCameraPosition('x', 'DEC');
    }
    if (keyDownManager.isPressing('ArrowRight')) {
      changeCameraPosition('x', 'INC');
    }
    if (keyDownManager.isPressing('w')) {
      changeCameraPosition('y', 'INC');
    }
    if (keyDownManager.isPressing('s')) {
      changeCameraPosition('y', 'DEC');
    }

    // Render the scene with the camera
    renderer.render(scene, camera);
  }
  animate();
}

const enableAudioBtn = document.querySelector('.js-enable-audio-btn');
function initAndStartAudio() {
  init();
  sound.play();
  enableAudioBtn.removeEventListener('click', initAndStartAudio);
  enableAudioBtn.parentNode.removeChild(enableAudioBtn);
};

enableAudioBtn.addEventListener('click', initAndStartAudio);
