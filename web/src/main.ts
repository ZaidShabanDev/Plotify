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
import colorShaderChunk from './shaders/color.glsl?raw';
import relationVertexShader from './shaders/relation.vert.glsl?raw';
import data from './data/playlists.json';
import type { PlaylistData } from './data/types';
import { buildFamilyLookup, buildPlaylistIndex, validatePlaylistEdges } from './data/validation';
import { fibonacciSphere, toVector3Array } from './scene/sphere';
import { extractUniqueEdges } from './scene/mesh';
import { playlistColors, playlistSizes } from './scene/dots';
import { buildArcPositions, buildArcWeights } from './scene/arcs';

// variables
const playlistData: PlaylistData = data;
const backgroundColor = new THREE.Color(0xf3f0ff);
const edgeColor = 0x999999;
const edgeOpacity = 0.3;
const relationColor = 0xcc0000;
const relationOpacity = 1.0;
const dotCount = playlistData.playlists.length;
const sphereRadius = 1.0;
const minSize = 0.5;
const maxSize = 2.0;
const backOpacity = 0.05;
const trackCountCap = 150;
const arcSegments = 32;
const arcLiftHeight = 0.01;
const minRelationOpacity = 0.2;
const sharedUniforms = {
  uBackOpacity: { value: backOpacity },
  uRadius: { value: sphereRadius },
};

// data
const familyLookup = buildFamilyLookup(playlistData);
const playlistIndex = buildPlaylistIndex(playlistData);
const validEdges = validatePlaylistEdges(playlistData, playlistIndex);

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
  new THREE.BufferAttribute(playlistSizes(playlistData, minSize, maxSize, trackCountCap), 1),
);

const dotMaterial = new THREE.RawShaderMaterial({
  vertexShader: fadeShaderChunk + '\n' + dotVertexShader,
  fragmentShader: colorShaderChunk + '\n' + dotFragmentShader,
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
  fragmentShader: colorShaderChunk + '\n' + lineFragmentShader,
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

// relations
const arcWeights = buildArcWeights(validEdges, arcSegments);
const arcPositions = buildArcPositions(validEdges, dotPositions, arcSegments, arcLiftHeight);
const relationGeometry = new THREE.BufferGeometry();
relationGeometry.setAttribute('position', new THREE.BufferAttribute(arcPositions, 3));
relationGeometry.setAttribute('aWeight', new THREE.BufferAttribute(arcWeights, 1));
const relationMaterial = new THREE.RawShaderMaterial({
  vertexShader: fadeShaderChunk + '\n' + relationVertexShader,
  fragmentShader: colorShaderChunk + '\n' + lineFragmentShader,
  transparent: true,
  uniforms: {
    ...sharedUniforms,
    uColor: { value: new THREE.Color(relationColor) },
    uLineOpacity: { value: relationOpacity },
    uMinRelationOpacity: { value: minRelationOpacity },
  },
  depthWrite: false,
});
const relations = new THREE.LineSegments(relationGeometry, relationMaterial);
scene.add(relations);

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
