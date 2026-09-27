# Plotify: Learning Tracker

How it works: each task has a goal and the concepts it teaches. The full lesson (Concept → Your task → Things to try → Done when) is given in chat when the task starts. After finishing, add a short note on what you learned or what broke.

**Status:** ⬜ Not started · 🟡 In progress · ✅ Done

---

## Stage A: Sphere Foundations (mock data)

| # | Task | Learn | Status |
|---|---|---|---|
| 1 | Scene setup | Scene/camera/renderer, render loop, resize, pixel ratio, OrbitControls + damping | ✅ |
| 2 | Fibonacci sphere dots | `BufferGeometry`, position attribute, `THREE.Points`, even point distribution | ✅ |
| 3 | Custom dot shader | `ShaderMaterial`, vertex/fragment shaders, `gl_PointSize`, `gl_PointCoord`, per-dot attributes, size attenuation | 🟡 |
| 4 | Structural mesh | Convex hull on a sphere, unique edge extraction, `LineSegments` | ⬜ |
| 5 | Depth fade | View space, uniforms, fading back-side dots and lines in the shader | ⬜ |
| 6 | Mock data | Playlist JSON (genre, track count, edges) → size and color attributes | ⬜ |
| 7 | Relationship arcs | Slerp, great-circle arcs, `Line2`/`LineMaterial`, opacity by score | ⬜ |
| 8 | Hover and picking | `Raycaster` on points, hover attribute, 3D → 2D projection for an HTML tooltip | ⬜ |
| 9 | Force layout on the sphere | Springs + repulsion, projecting back onto the sphere, clustering | ⬜ |
| 10 | Atmosphere | Idle motion (noise in shader), soft ground shadow, subtle rim glow | ⬜ |
| 11 | Camera fly-to | Easing, interpolating camera position and target, fading other dots | ⬜ |
| 12 | Playlist view | Song "galaxy" around the opened dot, back navigation | ⬜ |
| 13 | Side panel | HTML panel synced both ways with the sphere | ⬜ |
| 14 | Lenses and search | Filtering by genre/mood in the shader, fly to a search result | ⬜ |

## Stage B: Backend & Data

| # | Task | Learn | Status |
|---|---|---|---|
| 15 | .NET API skeleton | Minimal API, SQLite schema script, Dapper, WAL mode | ⬜ |
| 16 | Spotify sync | OAuth (auth code / PKCE), paging, saving tracks and playlists | ⬜ |
| 17 | Last.fm tags | Throttling, caching, tag normalization, genre families | ⬜ |
| 18 | Profiles and edges | `PlaylistTag`, Jaccard, cosine similarity, top-k edges | ⬜ |

## Stage C: Real Data in the Sphere

| # | Task | Learn | Status |
|---|---|---|---|
| 19 | Connect the API | Replace mock data with `fetch`, loading states | ⬜ |

## Stage D: Sound

| # | Task | Learn | Status |
|---|---|---|---|
| 20 | Previews and playback | Deezer by ISRC, Web Audio, `AnalyserNode` → shader uniform (beat pulse) | ⬜ |
| 21 | Essentia analysis | Python in WSL, writing BPM/key/energy into SQLite | ⬜ |
| 22 | Sound-based song layout | Position songs by BPM and energy | ⬜ |

## Stage E: Extras

| # | Task | Learn | Status |
|---|---|---|---|
| 23 | Save to Spotify | Create playlists from groups | ⬜ |

---

## Task 3: Custom Dot Shader (current)

Branch: `feature/3-dot-shader` · Issue #3

**Steps:**
1. Swap `PointsMaterial` for a `ShaderMaterial` with minimal inline shaders (fixed pixel size, flat color).
2. Round dots: `gl_PointCoord` + `discard`, then a soft edge with `smoothstep`.
3. Size attenuation: scale `gl_PointSize` by view-space depth.
4. Per-dot size: custom `aSize` attribute read in the vertex shader.

**Things to try:**
- Set `gl_Position` to `vec4(position, 1.0)` (skip the matrices). What happens to the camera?
- Make the fragment color depend on `gl_PointCoord`.
- Remove `discard`, and set alpha to 0 instead (without `transparent: true`).
- Change the order of the matrices.

**Done when:** round, soft-edged dots, bigger when close and smaller when far, each with its own size.

---

## Task 2: Fibonacci Sphere Dots (done)

**Your task:**
1. Remove the red/green test meshes.
2. Fill a `Float32Array` with N = 200 points on a sphere of radius 1 (Fibonacci / golden angle method).
3. Put it in a `BufferGeometry` as the `position` attribute (item size 3).
4. Draw it with `THREE.Points` + `PointsMaterial` (dark color, small size).

**Things to try:**
- N = 10, 1000, 5000.
- Random `y` and angle instead of Fibonacci. Where do dots clump?
- Remove the `+ 0.5` from the `y` formula. What happens at the poles?
- `size` 0.05 vs 5, and `sizeAttenuation: false`.
- Item size 2 instead of 3 in the attribute.

**Done when:** ~200 dots spread evenly over the sphere, no clumps at the poles, and it rotates with the controls.

---

## Task 1: Scene Setup (done)

**Setup options:**
- **Vite (recommended):** `npm create vite@latest web` → Vanilla → JavaScript, then `npm i three`.
- No build tool: HTML + import map from a CDN. Nothing to install, but no hot reload, and `.glsl` imports get messy.

**Your task:**
1. Create the `web/` project.
2. Full-screen canvas, light gray background.
3. Temporary `SphereGeometry` + `MeshBasicMaterial({ wireframe: true })`.
4. OrbitControls with damping; handle resize.

**Things to try:**
- `fov` = 120, then 10.
- `near` = 5 with the camera 4 units away. Why does the sphere disappear?
- Remove `controls.update()` from the loop.
- Low segments (6, 4). Notice triangles bunch at the poles.

**Done when:** drag and zoom are smooth, and resizing doesn't stretch the sphere.

---

## Learning Notes

Add a line per task: what you learned, what broke, what surprised you.

- **Task 1:** Used Vite + TypeScript (not JS). `scene.background` is a property (use `=`), not a method. JS comma operator: `(a, b)` returns `b` with no error. Resize = `aspect` + `updateProjectionMatrix()` (matrix is cached) + `setSize`. Damping needs `controls.update()` every frame, or it lags and stops dead. `near`/`far` clip anything outside the frustum. UV sphere bunches at poles; icosahedron is even. Each geometry has its own args (`Icosahedron(radius, detail)`). Off-center objects stretch with high FOV.
- **Task 2:** Built it in steps: 3 hand-placed dots → line of dots → Fibonacci sphere. `BufferGeometry` holds one flat `Float32Array`; the attribute's item size cuts it into vertices (vertex count = floor(length ÷ itemSize), leftovers ignored). Point `i` lives at `[i*3]`, `[i*3+1]`, `[i*3+2]`: index goes inside the brackets, value on the right. Same data draws differently by object type (`Points` = sprites, `Mesh` = triangles). Item size 2 → z filled with 0, flat scrambled plane. Material `size` (dot size) ≠ attribute item size: mixed them up once, `size: 2` made one solid block. Random y/θ is even on average but clumps and leaves gaps; Fibonacci (golden angle + equal-height slices) is even everywhere.
