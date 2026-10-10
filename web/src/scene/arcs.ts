import * as THREE from 'three';
import type { ResolvedEdge } from '../data/types';

export function buildArcPositions(
  validEdges: ResolvedEdge[],
  dotPositions: Float32Array,
  segments: number,
  liftHeight: number,
): Float32Array {
  const arcPositions: number[] = [];

  validEdges.forEach((edge) => {
    const sourceIdx = edge.sourceIndex;
    const targetIdx = edge.targetIndex;
    const a = new THREE.Vector3().fromArray(dotPositions, sourceIdx * 3);
    const b = new THREE.Vector3().fromArray(dotPositions, targetIdx * 3);

    for (let k = 0; k < segments; k++) {
      const tStart = k / segments;
      const tEnd = (k + 1) / segments;
      const p0 = slerpOnSphere(a, b, tStart);
      const p1 = slerpOnSphere(a, b, tEnd);
      const scaleStart = 1 + liftHeight * Math.sin(Math.PI * tStart);
      const scaleEnd = 1 + liftHeight * Math.sin(Math.PI * tEnd);

      p0.multiplyScalar(scaleStart);
      p1.multiplyScalar(scaleEnd);
      arcPositions.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);
    }
  });
  return new Float32Array(arcPositions);
}

export function slerpOnSphere(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
  const angle = a.angleTo(b);
  const axis = new THREE.Vector3().crossVectors(a, b);

  // opposite points: a × b is zero and every great circle is a shortest path, so any axis ⟂ a works
  if (axis.lengthSq() < 1e-12) {
    const pointsUp = Math.abs(a.y) > 0.9 * a.length();
    axis.crossVectors(a, pointsUp ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0));
  }

  axis.normalize();
  const result = a.clone().applyAxisAngle(axis, angle * t);
  return result;
}

export function buildArcWeights(validEdges: ResolvedEdge[], segments: number): Float32Array {
  const arcWeights: number[] = [];

  validEdges.forEach((edge) => {
    for (let k = 0; k < segments; k++) {
      arcWeights.push(edge.weight, edge.weight);
    }
  });
  return new Float32Array(arcWeights);
}
