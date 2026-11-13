# BENGDA

A single-file 3D campus demolition game with an online campus leaderboard.

## Live site

https://markszt.github.io/bengda/

## Files in this repository

- `index.html` — the whole game: Three.js, map data, embedded textures/audio, UI and styles.
- `online.js` — starts a run, auto-uploads damage every 6 seconds, sends the current campus ID.
- `online-rank.js` — in-game HUD rank/gap display and the online university ranking.
- `README.md` — this file.

The Cloudflare Worker and D1 database are deployed separately and are not in this repository.

Backend:

https://fh-aachen-leaderboard.markszt0311-a52.workers.dev
