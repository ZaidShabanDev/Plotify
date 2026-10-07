import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import dotVertexShader from './shaders/dot.vert.glsl?raw';
import dotFragmentShader from './shaders/dot.frag.glsl?raw';
import lineVertexShader from './shaders/line.vert.glsl?raw';
import lineFragmentShader from './shaders/line.frag.glsl?raw';
import fadeShaderChunk from './shaders/fade.glsl?raw';
import data from './data/playlists.json';
import type { Family, Playlist, PlaylistData } from './data/types';

// variables
const playlistData: PlaylistData = data;
const backgroundColor = new THREE.Color(0xd9ead3);
const edgeColor = 0x999999;
const edgeOpacity = 0.3;
const dotCount = playlistData.playlists.length;
const sphereRadius = 1.0;
const minSize = 0.5;
const maxSize = 2.0;
const backOpacity = 0.05;
const sharedUniforms = {
  uBackOpacity: { value: backOpacity },
  uRadius: { value: sphereRadius },
};

const familyLookup = buildFamilyLookup(playlistData);

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

// dots
const dotPositions = fibonacciSphere(dotCount, sphereRadius);
const dotGeometry = new THREE.BufferGeometry();
dotGeometry.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
dotGeometry.setAttribute(
  'aColor',
  new THREE.BufferAttribute(playlistColors(playlistData, familyLookup), 3),
);
dotGeometry.setAttribute(
  'aSize',
  new THREE.BufferAttribute(randomDotSizes(dotCount, minSize, maxSize), 1),
);

const dotMaterial = new THREE.RawShaderMaterial({
  vertexShader: fadeShaderChunk + '\n' + dotVertexShader,
  fragmentShader: dotFragmentShader,
  transparent: true,
  depthWrite: false,
  uniforms: { ...sharedUniforms },
});

const dots = new THREE.Points(dotGeometry, dotMaterial);
scene.add(dots);
dots.renderOrder = 1;

// hull
const hullGeometry = new ConvexGeometry(toVector3Array(dotPositions));
hullGeometry.deleteAttribute('normal');

// edges
const mergedHull = mergeVertices(hullGeometry);
const edgePositions = extractUniqueEdges(mergedHull);
const edgeGeometry = new THREE.BufferGeometry();
edgeGeometry.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3));
const edgeMaterial = new THREE.RawShaderMaterial({
  vertexShader: fadeShaderChunk + '\n' + lineVertexShader,
  fragmentShader: lineFragmentShader,
  transparent: true,
  uniforms: {
    ...sharedUniforms,
    uColor: { value: new THREE.Color(edgeColor) },
    uLineOpacity: { value: edgeOpacity },
  },
  depthWrite: false,
});
const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
scene.add(edges);

// resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// render loop
function animate() {
  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// helper functions
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

function toVector3Array(positions: Float32Array): THREE.Vector3[] {
  const vectors: THREE.Vector3[] = [];

  for (let i = 0; i < positions.length / 3; i++) {
    vectors.push(new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]));
  }

  return vectors;
}

function extractUniqueEdges(geometry: THREE.BufferGeometry): Float32Array {
  const seenEdges = new Set<string>();
  const edgePositions: number[] = [];
  const index = geometry.index!;
  const position = geometry.attributes.position;

  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i);
    const b = index.getX(i + 1);
    const c = index.getX(i + 2);

    addEdgeIfNew(a, b, seenEdges, edgePositions, position);
    addEdgeIfNew(b, c, seenEdges, edgePositions, position);
    addEdgeIfNew(c, a, seenEdges, edgePositions, position);
  }

  return new Float32Array(edgePositions);
}

function addEdgeIfNew(
  cornerA: number,
  cornerB: number,
  seenEdges: Set<string>,
  edgePositions: number[],
  position: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
): void {
  const key = `${Math.min(cornerA, cornerB)}-${Math.max(cornerA, cornerB)}`;
  if (!seenEdges.has(key)) {
    seenEdges.add(key);

    edgePositions.push(
      // corner A
      position.getX(cornerA),
      position.getY(cornerA),
      position.getZ(cornerA),
      // corner B
      position.getX(cornerB),
      position.getY(cornerB),
      position.getZ(cornerB),
    );
  }
}

function buildFamilyLookup(data: PlaylistData): Map<string, Family> {
  const map = new Map<string, Family>();

  data.families.forEach((family: Family) => {
    if (map.has(family.id)) {
      throw new Error(`Duplicate family id "${family.id}"`);
    }
    map.set(family.id, family);
  });

  data.playlists.forEach((playlist: Playlist) => {
    if (!map.has(playlist.familyId)) {
      throw new Error(`Playlist "${playlist.id}" has unknown familyId "${playlist.familyId}"`);
    }
  });

  return map;
}

function playlistColors(data: PlaylistData, lookup: Map<string, Family>): Float32Array {
  const colors = new Float32Array(data.playlists.length * 3);

  data.playlists.forEach((playlist, i) => {
    const family = lookup.get(playlist.familyId)!;
    const color = new THREE.Color(family.color);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  });

  return colors;
}
