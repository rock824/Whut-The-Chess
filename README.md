# Whut The Chess

A colorful, kid-friendly chess game and learning lab. It runs entirely in the browser and is ready for GitHub Pages.

## Features

- Fully playable chess against a two-level coach bot
- Legal move highlighting, hints, undo, checkmate, castling, en passant, and promotion
- Six piece lessons and five opening principles
- Interactive walkthroughs for the Italian Game, Queen's Gambit, Ruy Lopez, London System, Sicilian Defense, and King's Indian Defense
- Tactics puzzles, Knight Quest, Square Sprint, and Piece Points mini-games
- Browser-saved XP, lesson progress, puzzle progress, and practice streak
- Responsive touch-friendly design

## Run locally

Because the JavaScript uses browser modules, serve the folder with any static server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Publish with GitHub Pages

In the repository settings, open **Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.

No build step or API key is required.
