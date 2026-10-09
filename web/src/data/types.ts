export interface Family {
  id: string;
  name: string;
  color: string;
}

export interface Playlist {
  id: string;
  name: string;
  trackCount: number;
  familyId: string;
}

export interface Edge {
  source: string;
  target: string;
  weight: number;
}

export interface PlaylistData {
  families: Family[];
  playlists: Playlist[];
  edges: Edge[];
}

export interface ResolvedEdge {
  sourceIndex: number;
  targetIndex: number;
  weight: number;
}
