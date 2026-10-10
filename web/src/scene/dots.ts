import * as THREE from 'three';
import type { Family, PlaylistData } from '../data/types';

export function playlistColors(data: PlaylistData, lookup: Map<string, Family>): Float32Array {
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

export function playlistSizes(
  data: PlaylistData,
  min: number,
  max: number,
  cap: number,
): Float32Array {
  const sizes = new Float32Array(data.playlists.length);

  const maxTrackCount = Math.max(...data.playlists.map((p) => p.trackCount));
  const minTrackCount = Math.min(...data.playlists.map((p) => p.trackCount));
  const sqrtMaxTracks = Math.sqrt(Math.min(maxTrackCount, cap));
  const sqrtMinTracks = Math.sqrt(Math.min(minTrackCount, cap));
  const sqrtRange = sqrtMaxTracks - sqrtMinTracks;

  data.playlists.forEach((playlist, i) => {
    const cappedTrackCount = Math.min(playlist.trackCount, cap);
    // all playlists equal after capping → no range to spread over, use the middle size
    const t = sqrtRange > 0 ? (Math.sqrt(cappedTrackCount) - sqrtMinTracks) / sqrtRange : 0.5;
    const size = min + t * (max - min);
    sizes[i] = size;
  });

  return sizes;
}
