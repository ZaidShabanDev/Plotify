import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// variables
const backgroundColor = new THREE.Color(0xd3d3d3);
// const dotColor = 0x222222;
const dotCount = 200;
const sphereRadius = 1;
const minSize = 0.5;
const maxSize = 2.0;

// scene
const scene = new THREE.Scene();
scene.background = backgroundColor;

// camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2;

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// shaders
const dotVertexShader = `
    attribute float aSize;
    
    void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewPosition;
        float baseSize = 20.0 / (-viewPosition.z);

        gl_PointSize = baseSize * aSize;
    }`;

const dotFragmentShader = `
    void main () {
        float dist = distance(gl_PointCoord, vec2(0.5));
        float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
        if(dist > 0.5){
            discard;
        }

        gl_FragColor = vec4(0.13, 0.13, 0.13, alpha);
    }`;

// dots
const dotGeometry = new THREE.BufferGeometry();
dotGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(fibonacciSphere(dotCount, sphereRadius), 3),
);
dotGeometry.setAttribute(
  'aSize',
  new THREE.BufferAttribute(randomDotSizes(dotCount, minSize, maxSize), 1),
);

const dotMaterial = new THREE.ShaderMaterial({
  vertexShader: dotVertexShader,
  fragmentShader: dotFragmentShader,
  transparent: true,
  depthWrite: false,
});

const dots = new THREE.Points(dotGeometry, dotMaterial);
scene.add(dots);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

function fibonacciSphere(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (2 * (i + 0.5)) / count;
    const ringRadius = Math.sqrt(1 - y * y);
    const theta = i * goldenAngle;

    positions[i * 3] = Math.cos(theta) * ringRadius * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * ringRadius * radius;
  }

  return positions;
}

function randomDotSizes(count: number, min: number, max: number): Float32Array {
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    sizes[i] = Math.random() * (max - min) + min;
  }

  return sizes;
}
