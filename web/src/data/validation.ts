import type { Edge, Family, Playlist, PlaylistData, ResolvedEdge } from './types';

export function buildFamilyLookup(data: PlaylistData): Map<string, Family> {
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

export function buildPlaylistIndex(data: PlaylistData): Map<string, number> {
  const map = new Map<string, number>();

  data.playlists.forEach((playlist, i) => {
    if (map.has(playlist.id)) {
      throw new Error(`Duplicate playlist id "${playlist.id}"`);
    }
    map.set(playlist.id, i);
  });

  return map;
}

export function validatePlaylistEdges(
  data: PlaylistData,
  map: Map<string, number>,
): ResolvedEdge[] {
  const resolvedEdges: ResolvedEdge[] = [];
  const seenEdges = new Set<string>();

  data.edges.forEach((edge) => {
    if (!map.has(edge.source)) {
      throw new Error(`Unknown source node: ${edge.source}`);
    }

    if (!map.has(edge.target)) {
      throw new Error(`Unknown target node: ${edge.target}`);
    }

    if (edge.source === edge.target) {
      throw new Error(`Self-loop not allowed on node: ${edge.source} -> ${edge.target}`);
    }

    if (!(edge.weight >= 0 && edge.weight <= 1)) {
      throw new Error(
        `Weight must be between 0 and 1, got: ${edge.weight} related to edge ${edge.source}-> ${edge.target}`,
      );
    }

    const sourceIdx = map.get(edge.source)!;
    const targetIdx = map.get(edge.target)!;
    assertUniqueEdge(sourceIdx, targetIdx, edge, seenEdges);

    resolvedEdges.push({ sourceIndex: sourceIdx, targetIndex: targetIdx, weight: edge.weight });
  });
  return resolvedEdges;
}

function assertUniqueEdge(
  source: number,
  target: number,
  edge: Edge,
  seenEdges: Set<string>,
): void {
  const key = `${Math.min(source, target)}-${Math.max(source, target)}`;

  if (seenEdges.has(key)) {
    throw new Error(
      `Duplicate edge ${edge.source} -> ${edge.target} (same pair as an earlier edge)`,
    );
  }
  seenEdges.add(key);
}
