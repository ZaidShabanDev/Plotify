# Plotify: Project Plan

A personal tool that reads my Spotify Liked Songs and playlists, tags them by genre, mood and sound, and shows them as a living 3D map: each playlist is a dot on a sphere, and lines show how playlists relate.

Also a learning project for WebGL, Three.js and shaders. Task-by-task progress lives in [Learning_Tracker.md](Learning_Tracker.md).

---

## 1. What It Does

1. Logs in to my Spotify account
2. Pulls all my Liked Songs and playlists
3. Tags each song with genre and mood (Last.fm)
4. Computes each playlist's genre/mood profile and how playlists relate to each other
5. Shows playlists as dots on a 3D sphere, with a side panel for normal browsing
6. Clicking a dot flies into the playlist and shows its songs
7. (Later) Analyzes each song's sound: BPM, key, energy, danceability
8. (Optional) Saves new grouped playlists back to Spotify

---

## 2. Costs

| Item | Cost | Notes |
|---|---|---|
| Spotify Premium | Already have it | Required to own a developer app |
| Spotify developer account | Free | developer.spotify.com |
| Last.fm API | Free | Personal, non-commercial use |
| Deezer API | Free | No key needed for search/track lookup |
| Essentia | Free | Open-source audio analysis |
| Three.js, Vite, .NET, SQLite | Free | |
| Hosting | Free | Runs on my own computer |

**Total extra cost: $0**

---

## 3. Spotify API Limits to Know

- **No audio data from Spotify.** Since November 27, 2024, new apps can't use audio features, audio analysis, recommendations, or related artists. Sound values must come from our own analysis.
- **Development Mode (February 2026):** owner needs Premium, 1 Client ID per developer, max 5 authorized users.
- **Redirect URI** must use `127.0.0.1`, not `localhost`.
- **To verify before Stage B** (I couldn't confirm these):
  - Is `POST /me/playlists` the current create-playlist endpoint?
  - Is reading playlist items limited to playlists I own or collaborate on?

Changelog: https://developer.spotify.com/documentation/web-api

---

## 4. Tech Stack

| Part | Choice | Why |
|---|---|---|
| Frontend | Vanilla JS + Three.js + custom GLSL shaders | Full control over visuals; Three.js removes WebGL boilerplate but I still write the shaders |
| Build tool | Vite | Hot reload, clean imports, can import `.glsl` files as text |
| Backend | ASP.NET Core Minimal API | My strongest stack, fast, little code |
| Data access | Dapper + `Microsoft.Data.Sqlite` | I prefer raw SQL over EF |
| Database | SQLite (WAL mode) | Single user, read-heavy, one file |
| Tags | Last.fm `track.getTopTags` → fallback `artist.getTopTags` | Free, good genre/mood tags |
| Previews (Stage D) | Deezer by ISRC, iTunes as fallback | ISRC match is exact; name search often matches the wrong version |
| Audio analysis (Stage D) | Python + Essentia in WSL | Essentia has no Windows wheels |

---

## 5. Data Model (SQLite)

```sql
Track(Id, SpotifyId, Isrc, Name, Album, DurationMs,
      Bpm, MusicalKey, Energy, Danceability, Loudness)   -- sound columns filled in Stage D
Artist(Id, SpotifyId, Name)
TrackArtist(TrackId, ArtistId, Position)

Playlist(Id, SpotifyId NULL, Name, Source)       -- 'spotify' | 'liked' | 'plotify'
PlaylistTrack(PlaylistId, TrackId, Position, AddedAt)

Tag(Id, Name, Kind, FamilyId NULL, Color NULL)   -- Kind: genre | mood; Color on family rows
TrackTag(TrackId, TagId, Weight, Source)         -- Source: track | artist

PlaylistTag(PlaylistId, TagId, Weight)           -- computed profile
PlaylistEdge(PlaylistA, PlaylistB, SharedTracks,
             GenreSim, MoodSim, Score)           -- computed, CHECK (PlaylistA < PlaylistB)
```

- **Genre families:** subgenres point to a family ("doom metal" → Rock/Metal). The family holds the dot color.
- **Dot color** = strongest family in `PlaylistTag`. **Dot size** = track count.
- **Shared songs** = Jaccard overlap of track sets. **Genre/mood similarity** = cosine similarity of tag profiles.
- **Keep only the top 3–5 edges per playlist** above a minimum score, or the sphere becomes a hairball.
- Edges are computed in the backend after each sync, not in the browser.

---

## 6. The Sphere (Visual Design)

Target look: light gray background, geodesic wireframe sphere, dark dots of different sizes (see reference image in tracker).

- **Dots:** one `THREE.Points` with a custom shader; per-dot color and size attributes.
- **Placement:** Fibonacci sphere for even spread, then a force layout constrained to the sphere so similar playlists cluster.
- **Structural mesh:** faint gray triangles between nearest dots (convex hull of points on a sphere = spherical Delaunay triangulation).
- **Relationship lines:** great-circle arcs (slerp), darker/colored, opacity by score, mainly shown on hover.
- **Depth:** back-side dots and lines fade lighter; soft shadow under the sphere; subtle idle motion.
- **Interaction:** hover highlight + tooltip, camera fly-to on click, song "galaxy" inside a playlist, side panel synced both ways, genre/mood lenses, search, keyboard navigation, `prefers-reduced-motion`.

---

## 7. Build Stages

Details and status per task: [Learning_Tracker.md](Learning_Tracker.md).

| Stage | Goal |
|---|---|
| **A. Sphere foundations** | Build the full sphere experience with mock data. Learn Three.js and shaders without waiting on APIs. |
| **B. Backend & data** | .NET API, SQLite schema, Spotify sync, Last.fm tags, computed profiles and edges. |
| **C. Real data in the sphere** | Replace mock data with the API; playlist view, side panel, filters, search. |
| **D. Sound** | Previews, Web Audio playback with beat-reactive shaders, Essentia analysis, sound-based layouts. |
| **E. Extras** | Save to Spotify, auto-sync new likes, AI prompts. |

---

## 8. Known Gotchas

- Local files and unavailable tracks can return `track` or `id` as null. Skip them during sync.
- Last.fm allows about 5 requests/second. Throttle and cache every result.
- Normalize tags (lowercase, merge "hip hop" / "hip-hop").
- Previews and analysis take a long time on the first run. Cache everything and make the job resumable.

---

## 9. Future Ideas

- Keep playlists auto-updated when I like new songs
- Language detection for grouping by language
- AI-powered prompts ("sad Arabic songs from the 2010s")
