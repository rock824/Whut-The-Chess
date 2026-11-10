# Coach Whit Academy — implementation plan

Status: design and implementation branch; do not deploy until reviewed and tested.

## Existing foundations
- Static frontend: `index.html`, `styles.css`, `app.js`, `engine.js`, `strategy-data.js`.
- Existing learning: six piece lessons, opening principles, 44 Strategy Lab lessons, progressive tactics, Piece Quest, Square Sprint, Piece Points.
- Existing progress: XP, streaks, browser cache and optional API sync.
- Existing tests: `npm test` runs `tests/engine.test.js` and `tests/curriculum.test.js`.

## Phase 1: Coach Whit and animation
1. Add an optional coach panel to the existing Learn and Strategy views; do not replace working views.
2. Add a `coach-whit` asset slot with states: neutral, thinking, hint, success, mistake, celebrating. Keep content readable when assets are absent.
3. Build an accessible Toasty Easter egg overlay: cropped transparent head-and-shoulders photo supplied by the owner; no black backdrop, no flames or lettering required. Slide in from the lower-right for ~1 second; optional owner-recorded 'Toasty!' sound. Respect muted audio and `prefers-reduced-motion`.
4. Trigger sparingly after exceptional puzzle results or checkmate; never on every move, and never block board interaction.
5. Add lightweight piece move/capture animation using CSS transforms, while the chess engine remains the single source of legal moves and state.
6. Ensure mobile sizing, keyboard controls and reduced-motion fallback.

## Phase 2: Learning path
- Index existing lessons rather than duplicate them.
- Organize Foundations, Tactics, Checkmates, Openings, Endgames, Strategy.
- Add short guided lessons with legal board state, hints, retry and explanations.
- Preserve existing XP/streak/profile schemas until migrations are reviewed.
- Add spaced review based on missed lesson concepts.

## Phase 3: Coaching
- Stockfish determines move quality; never let LLM text decide legality.
- Ollama may explain engine-backed feedback using age-appropriate language.
- Do not send account identifiers, PINs or unnecessary personal data to the AI server.

## Acceptance criteria for first implementation PR
- Existing `npm test` passes; add tests for new lesson/coach triggers.
- No changes to login, PIN recovery, invite code or Kubernetes manifests.
- Coach panel and Toasty can be disabled; sound respects existing preference.
- No gameplay input blocked by animation; all effects work on touch screens.
- Production branch remains unchanged until review.

## Asset requirements
- Owner-provided reference photo is for the Toasty cutout; create a transparent PNG/WebP and obtain an owner-approved audio clip or synthesize an original one.
- Avoid distributing the raw photograph in the public repo unless owner explicitly approves; consider a private asset delivery path.
