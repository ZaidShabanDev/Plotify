# Plotify: Learning Tracker

How it works: each task has a goal and the concepts it teaches. The full lesson (Concept → Your task → Things to try → Done when) is given in chat when the task starts. After finishing, add a short note on what you learned or what broke.

**Status:** ⬜ Not started · 🟡 In progress · ✅ Done

**In progress:** Task 7 (relationship arcs). Branch `feature/<issue>-relationship-arcs`.

---

## Stage A: Sphere Foundations (mock data)

| # | Task | Learn | Status |
|---|---|---|---|
| 1 | Scene setup | Scene/camera/renderer, render loop, resize, pixel ratio, OrbitControls + damping | ✅ |
| 2 | Fibonacci sphere dots | `BufferGeometry`, position attribute, `THREE.Points`, even point distribution | ✅ |
| 3 | Custom dot shader | `ShaderMaterial`, vertex/fragment shaders, `gl_PointSize`, `gl_PointCoord`, per-dot attributes, size attenuation | ✅ |
| 4 | Structural mesh | Convex hull on a sphere, unique edge extraction, `LineSegments` | ✅ |
| 5 | Depth fade | View space, uniforms, fading back-side dots and lines in the shader | ✅ |
| 6 | Mock data | Playlist JSON (genre, track count, edges) → size and color attributes | ✅ |
| 7 | Relationship arcs | Slerp, great-circle arcs, `Line2`/`LineMaterial`, opacity by score | 🟡 |
| 8 | Hover and picking | `Raycaster` on points, hover attribute, 3D → 2D projection for an HTML tooltip | ⬜ |
| 9 | Force layout on the sphere | Springs + repulsion, projecting back onto the sphere, clustering | ⬜ |
| 10 | Atmosphere | Idle motion (noise in shader), soft ground shadow, subtle rim glow | ⬜ |
| 11 | Camera fly-to | Easing, interpolating camera position and target, fading other dots | ⬜ |
| 12 | Playlist view | Song "galaxy" around the opened dot, back navigation. Idea: split big playlists into genre/mood sub-groups here (main sphere keeps 1 dot = 1 playlist, sized by sqrt + clamp) | ⬜ |
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

## Task 7: Relationship Arcs (in progress)

Branch: `feature/<issue>-relationship-arcs`

**Steps:**
1. Playlist id → dot index map; validate every edge's `source`/`target`. ✅ `buildPlaylistIndex` + `validatePlaylistEdges` → `ResolvedEdge[]` (indices, not ids); throws on unknown id, self-loop, weight outside 0..1 (NaN too), duplicate pair (`min-max` index key).
2. Straight chord per edge (`LineSegments`, own shader) to prove the wiring.
3. Great-circle arcs: slerp between the two dot positions, N segments, slightly lifted off the surface.
4. Opacity (and width later) by `weight` via a per-vertex attribute; reuse the depth fade.
5. Compare with `Line2` + `LineMaterial` (real pixel width) and pick one.

**Things to try:**
- lerp + normalize instead of slerp: compare the spacing of the points along a long arc.
- 2 vs 8 vs 64 segments per arc.
- No lift (radius exactly 1.0): look where arcs meet the mesh lines.
- Set `linewidth: 5` on a plain line material.
- An edge between two almost opposite dots.

**Done when:** every edge is a smooth arc on the sphere surface (not through it), stronger edges are clearly more visible, back-side arcs fade like the mesh, and a bad id in `edges` throws a clear error.

---

## Task 6: Mock Data (done)

Branch: `feature/11-mock-data` · Issue #11

**Steps:**
1. Hand-write `web/src/data/playlists.json` (~30 playlists, 6–8 genre families with colors, a few edges for Task 7) and a TS type for it. ✅ 30 playlists, 8 families, `types.ts` with `PlaylistData` root type.
2. Import it; dot count comes from the data, not a constant. ✅ Plus `buildFamilyLookup` (Map, throws on duplicate family or unknown `familyId`).
3. Size: track count → `aSize` with a sqrt mapping + clamp (replaces random sizes). ✅ `playlistSizes`: sqrt + `trackCountCap`, guard for a zero range.
4. Color: family color → per-dot `aColor` attribute (item size 3) → varying → fragment shader. ✅ `playlistColors` + shared `color.glsl` chunk (linear → sRGB at output, dots and edges).

**Things to try:**
- Linear vs sqrt vs log size mapping with a 5-track and a 1500-track playlist.
- Item size 1 instead of 3 for the color attribute.
- Compare a dot's on-screen color with its hex in a color picker (color spaces).
- Sort playlists by family before placing them. What pattern appears on the Fibonacci sphere?

**Done when:** every dot is a playlist from the JSON, size follows track count without giant outliers, color follows genre family, and the depth fade still works.

---

## Task 5: Depth Fade (done)

Branch: `feature/7-depth-fade` · Issue #7

**Steps:**
1. Dots: in the vertex shader, find how far each dot is in front of / behind the sphere center (view space), turn it into a 0..1 `vFade` varying, multiply the fragment alpha by it. ✅ Tried depth-based, switched to facing-based (`dot(normalView, toCamera)`); fade is turned off when the camera is inside the sphere (`length(centerView.xyz)` vs radius).
2. Uniforms: move the tuning numbers (`uRadius`, `uBackOpacity`) into uniforms; change one from JS each frame to prove it updates live. ✅
2b. Move the shaders out of `main.ts` into `src/shaders/*.glsl` files (Vite `?raw` import). ✅ Switched to `RawShaderMaterial` so the files are complete (no hidden prefix, no linter false alarms).
3. Lines: swap `LineBasicMaterial` for a `ShaderMaterial` with the same fade; share the uniform objects with the dots. ✅ (`RawShaderMaterial`, `sharedUniforms` spread into both materials)

**Things to try:**
- Use `position.z` (object space) instead of view space, then orbit. What goes wrong?
- Hard cut with `step()` instead of a smooth fade. Look at a line that crosses the edge.
- `scene.fog` + plain `LineBasicMaterial`, then zoom in and out. Compare with the shader version.
- Use a uniform in GLSL without adding it to `uniforms` in JS.
- Remove `transparent: true` from the line material.

**Done when:** back-side dots and lines are clearly lighter, front side stays strong, the fade follows the camera while orbiting, and one uniform controls both.

---

## Task 4: Structural Mesh (done)

Branch: `feature/5-structural-mesh` · Issue #5

**Steps:**
1. Convex hull of the dot positions with `ConvexGeometry` (Three.js addon), shown as a wireframe mesh.
2. Unique edges: merge duplicate vertices, then collect each triangle edge once (key = smaller index + larger index).
3. Draw the edges with `LineSegments` + a faint gray `LineBasicMaterial`; remove the wireframe mesh.

**Things to try:**
- Count the edges with and without removing duplicates.
- Use the hull wireframe directly as the "mesh". Why is it wasteful?
- Dot count 20 vs 2000: does the mesh stay even?
- Move one dot off the sphere (radius 0.8 or 1.2). What happens to the hull?

**Done when:** faint gray triangle lines link each dot to its nearest neighbors, each edge drawn once, dots on top.

---

## Task 3: Custom Dot Shader (done)

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
- **Task 3:** Vertex shader runs per dot (`gl_Position`, `gl_PointSize`), fragment shader per pixel (`gl_FragColor`); written as GLSL in backtick strings, `void main()` is the entry point. GLSL is strict: floats need `.0`, types never auto-convert, `distance()` returns a `float`, and naming a variable `distance` hides the built-in. A point is a camera-facing square; round dots = `discard` pixels where `distance(gl_PointCoord, vec2(0.5)) > 0.5` (`gl_PointCoord` starts top-left). Hard `discard` edges are jagged (antialias doesn't help) → soft edge with `1.0 - smoothstep(0.4, 0.5, dist)` as alpha + `transparent: true`. Transparent edges still write depth and cut halos into dots behind, depending on draw order (index 0 = top) → `depthWrite: false`. Size attenuation: split into `viewPosition`; camera looks down -z, so distance = `-viewPosition.z`, size = base ÷ distance (subtracting made far dots bigger). Per-dot `aSize` attribute (item size 1) must be declared in the shader; a name typo gives no error, the attribute just reads 0 (shaders fail silently). Item size 3 ran out of data after 66 dots (only the top third kept sizes). `Math.floor` random formula is for integers only. Wide size ranges look bad → `sqrt`/`log` mapping in Task 6. Also: OrbitControls calls `update()` in its own handlers, so damping only breaks subtly (no glide) without it in the loop.
- **Task 4:** Convex hull = the tight "plastic wrap" around the points; since every dot is on the sphere, every dot is a hull corner and each hull triangle joins 3 neighbors. `ConvexGeometry` wants `Vector3[]` (one `Vector3` with all 3 numbers per dot; missing args default to 0 → all points on one axis gave a flat line). Mesh = triangles; every visible object = geometry + material + object type (`Mesh`/`Points`/`LineSegments`); lights/`Group` have none. Wireframe draws each edge twice (shared by 2 triangles): V = 200 → 396 triangles, 594 edges (3V − 6), ~6 edges per dot. `ConvexGeometry` is non-indexed; `mergeVertices` only merges when all attributes match, so flat per-face `normal`s blocked it (1188 → 1188) until `deleteAttribute('normal')` (→ 200). Loop the index 3 at a time with `getX(i + 1)` (offset inside the brackets, not on the value). Edge key = `min-max` in a `Set` (Set ignores duplicate adds; `has` tells if new). Scope: a Set created inside the helper was new and empty on every call → pass it in (or closure). Store return values, or they're lost. File order: build → run → helpers. Transparent objects at the same center draw in add order, and dots with `depthWrite: false` got painted over by lines → `dots.renderOrder = 1`.
- **Task 5:** Object space (`position`, never changes) vs view space (camera at 0, looking down −z): "back side" must be measured in view space. Tried depth vs sphere center (`(dot z − center z) / radius` → −1..1), then switched to facing: `dot(viewNormal, toCamera)` (+1 faces camera, 0 at the visible rim, −1 faces away). Normal = perpendicular to the surface; on a sphere it's `normalize(position)`, moved to view space once with `normalMatrix` (never twice). `w = 1.0` = point, `w = 0.0` = direction; `length(vec4)` silently includes w → `.xyz`. Inside the sphere every dot faces away → blend the fade off by camera distance (`length(viewCenter.xyz)` vs radius). `smoothstep(e0, e1, x)` = how far through the range (edge0 > edge1 is undefined); `mix(a, b, t)` = a at 0, b at 1; a 0..1 visibility is not an opacity. Attribute = per vertex from JS; uniform = one value per draw, changeable every frame with no recompile (pulse test, `sin × 0.5 + 0.5` → 0..1); varying = vertex → fragment, interpolated (lines get a gradient even with `step()`). Only turn a number into a uniform if it *means* that thing (most `1.0`s weren't the radius). Pass the function to `setAnimationLoop`, don't call it. `0 - vec3` fails (int vs float). Shaders moved to `.glsl` with Vite `?raw`; Prettier has no GLSL → WebGL GLSL Editor via `"[glsl]"`. `ShaderMaterial` adds a hidden prefix (precision + built-ins) → linter false alarms → `RawShaderMaterial`: declare everything, built-ins only get data with the exact name. `{ ...sharedUniforms }` copies references, so one `.value` updates dots and lines. `depthWrite: false` on faint lines stops them cutting slices out of back dots.
- **Refactor (shared fade):** GLSL has no imports; sharing = gluing strings before compiling (`fadeChunk + '\n' + shader`, the newline guards against a trailing `//` comment eating the next line). Chose concatenation over `vite-plugin-glsl` (one chunk isn't worth a package; revisit for Task 10 noise). GLSL functions: return type first, typed params, must be defined above the call. Params are copies (`in`), so assigning a param inside doesn't reach the caller → return the value and store it (`vOpacity = f(...)`); calling without storing throws the result away. Pass values as params instead of declaring uniforms in the chunk (avoids double declarations). Don't name params with the `u` prefix. Vertex shaders have a default float precision; fragment shaders don't.
- **Task 6:** JSON can't use TS types; the type annotates the import in `main.ts` (`import type`, erased at build). Literal union for `familyId` didn't fit: JSON values are typed `string`, so it needs a cast that turns the check off → `string` + runtime check. `Map<id, Family>` = C# Dictionary: one `set` per family (not the whole array under one key); `set` overwrites silently → check `has` first and throw; return the map and store it. Typed arrays have a fixed length (`new Float32Array()` = 0, writes ignored) → `playlists.length * 3`; hex string → `THREE.Color` → `.r .g .b`. Varying needs the same name/type in both shaders (`a` = attribute, `v` = varying). Don't rename built-ins (`position` → `aPosition` breaks draw count, culling, raycasting). Colors were darker: `THREE.Color` decodes sRGB → linear, `RawShaderMaterial` skips the output encode → exact sRGB formula (`step` + `mix`, no `if`) in a shared fragment chunk, which needs its own `precision` line. Size = two stages: normalize in track space (sqrt on value, min and max) → `t` 0..1, then a plain linear map into dot size; mixing variables from the two spaces caused every bug. Sqrt because the eye reads area (area ∝ width²); log squashes too hard, linear lets one outlier shrink everyone. Cap = `Math.min(value, cap)` on every count before sqrt, max included (putting the cap inside `Math.max` made it a floor). Guard the zero range (all equal after capping → NaN) with the middle size. With cap 200 the curves look alike; differences show only without the cap. Item size 1 on `aColor` → dot `i` reads float `i`, g/b filled with 0 → black-to-red dots. Sorting by family → horizontal bands, because index alone sets `y` in the Fibonacci formula: position knows nothing about the data yet (Task 9).
