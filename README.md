# Whit the Chess?

A colorful, kid-friendly chess game and adaptive learning lab. The frontend runs on GitHub Pages; an optional Kubernetes API keeps invited players' progress synchronized across devices.

## Game features

- Fully playable chess against five coach levels, from Pet O'Wand to Jedi Mustard
- Legal moves, castling, en passant, promotion, hints, undo, check, and checkmate
- Six piece lessons and five opening principles
- Strategy Lab with 44 guided opening, middlegame, and endgame lessons
- Progressive tactics that unlock with XP
- Procedurally changing Piece Quest boards with multiple pieces and blockers
- Square Sprint and Piece Points mini-games
- Animated praise, confetti, audible celebrations, and sound controls
- Light/dark display modes and five selectable chess-piece styles
- Browser-cached XP, lesson progress, puzzle history, and streaks
- Invite-only username and PIN profiles with names, verified email recovery, and cross-device progress
- Responsive touch-friendly design

## Local frontend

```bash
python3 -m http.server 8080
```

Visit `http://localhost:8080`. The game remains usable without the API and stores progress locally.

## Tests

```bash
npm test
```

## Kubernetes deployment

The backend uses FastAPI, Argon2id PIN hashing, signed HTTP-only cookies, PostgreSQL, Traefik ingress, Longhorn storage, and optional NFS backups.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete GitHub Pages, Cloudflare, Argo CD, secret, health-check, and backup procedure.
