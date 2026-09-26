import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const lightGray = new THREE.Color(0xd3d3d3);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);

const sphereGeometry = new THREE.SphereGeometry(1, 16, 12);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

const geometry_2 = new THREE.IcosahedronGeometry(1, 2);
const material_2 = new THREE.MeshBasicMaterial({ color: 0x8fce00, wireframe: true });
const cosahedron = new THREE.Mesh(geometry_2, material_2);

cosahedron.position.x = -2.5;
sphere.position.x = 2.5;

scene.background = lightGray;
scene.add(sphere);
scene.add(cosahedron);

camera.position.z = 4;

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

controls.enableDamping = true;

function animate() {
  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);
