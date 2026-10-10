import * as THREE from 'three';

export function extractUniqueEdges(geometry: THREE.BufferGeometry): Float32Array {
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
