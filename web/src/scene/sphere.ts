import * as THREE from 'three';

export function fibonacciSphere(count: number, radius: number): Float32Array {
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

export function toVector3Array(positions: Float32Array): THREE.Vector3[] {
  const vectors: THREE.Vector3[] = [];

  for (let i = 0; i < positions.length / 3; i++) {
    vectors.push(new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]));
  }

  return vectors;
}
