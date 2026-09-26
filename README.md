# Plotify

A personal music organizer. It reads my Spotify library, tags songs by genre and mood (later also by sound), and shows my playlists as dots on an interactive 3D sphere.

- **Dot** = playlist, **size** = song count, **color** = genre family
- **Faint mesh** links nearby dots, **stronger lines** show relationships (shared songs, mood, genre) on hover
- Back-side dots fade out for depth

It is also a learning project for WebGL, Three.js and GLSL shaders.

## Status

**Stage A: sphere foundations (mock data).** Scene setup is done; the Fibonacci sphere dots are in progress.
See the [learning tracker](docs/Plotify/notes/Learning_Tracker.md) for all tasks.

## Tech Stack

| Part | Choice |
|---|---|
| Frontend | TypeScript + Three.js, custom GLSL shaders, Vite |
| Backend | ASP.NET Core Minimal API *(Stage B)* |
| Data | SQLite + Dapper *(Stage B)* |
| Tags | Last.fm API *(Stage B)* |
| Audio analysis | Python + Essentia in WSL *(Stage D)* |
| Previews | Deezer API *(Stage D)* |

## Getting Started

Requires **Node 20.19+ or 22.12+** (needed by Vite 8).

```bash
cd web
npm install
cp .env.example .env   # then fill in the values
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

> Only public values go in `web/.env`: every `VITE_` variable ends up in the browser.
> API keys and secrets belong to the backend (user secrets), never the frontend.

## Project Structure

```
Plotify/
├── web/     # Vite + Three.js frontend
├── api/     # .NET Minimal API (Stage B)
├── audio/   # Python Essentia script (Stage D)
└── docs/    # plan, tracker, task notes
```

## Roadmap

1. **Stage A:** sphere, dots, mesh, depth fade, hover, layout, camera fly-to (mock data)
2. **Stage B:** .NET API, Spotify sync, Last.fm tags, playlist similarity
3. **Stage C:** connect the sphere to real data
4. **Stage D:** audio previews, Essentia analysis, sound-based layout
5. **Stage E:** save groups back to Spotify as playlists

Full plan: [docs/Plotify/notes/plotify-plan.md](docs/Plotify/notes/plotify-plan.md)
