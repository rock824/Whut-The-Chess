import { ChessGame, PIECE_SYMBOLS, FILES, colorOf, typeOf, indexToSquare, squareToIndex, bestMove, moveCode, START } from "./engine.js";

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const lessons = [
  { piece: "♙", name: "Pawn Power", time: "3 min", lead: "Pawns look small, but they shape the entire battle. They move forward, capture diagonally, and can transform when they reach the far side.", rules: ["Move one square forward—or two from the starting line.", "Capture one square diagonally forward.", "Reach the last rank to promote, usually into a queen.", "Use pawn chains so pawns protect one another."] },
  { piece: "♘", name: "Knight Jumps", time: "3 min", lead: "The knight is the board's acrobat. It moves in an L shape and is the only piece that can jump over others.", rules: ["Move two squares one way, then one to the side.", "A knight in the center can reach up to eight squares.", "Knights are great at forks: attacking two pieces at once.", "Knights on the rim have fewer choices—bring them inward."] },
  { piece: "♗", name: "Bishop Beams", time: "3 min", lead: "Bishops glide diagonally across the board. Each bishop stays on one color for the entire game.", rules: ["Move any distance diagonally when the path is clear.", "Open the center so bishops can see across the board.", "A bishop pair can control both color complexes.", "Look for long diagonal pins against kings and queens."] },
  { piece: "♖", name: "Rook Roads", time: "3 min", lead: "Rooks race in straight lines. They become especially powerful on open files and on the seventh rank.", rules: ["Move any distance up, down, left, or right.", "Put rooks on files with no friendly pawns.", "Connected rooks protect each other.", "Castling activates a rook while protecting your king."] },
  { piece: "♕", name: "Queen Smarts", time: "4 min", lead: "The queen combines a rook and bishop's movement. She is powerful—but bringing her out too soon lets opponents chase her around.", rules: ["Move any distance in a straight or diagonal line.", "The queen is worth about nine pawns, so keep her safe.", "Team the queen with another piece for mating attacks.", "Before moving her, check whether a smaller piece can do the job."] },
  { piece: "♔", name: "King Safety", time: "4 min", lead: "The king moves slowly, but the entire game revolves around him. Checkmate ends the game, so build him a safe home early.", rules: ["Move one square in any direction, but never into check.", "Castle by moving the king two squares toward a rook.", "Keep pawns near your castled king when possible.", "In the endgame, the king becomes a strong fighting piece."] }
];

const openings = [
  {
    category: "opening", name: "Italian Game", family: "OPEN GAME", level: "Friendly & attacking", moves: ["e2e4","e7e5","g1f3","b8c6","f1c4","g8f6","e1g1"],
    plan: "Develop quickly, castle, and aim at the sensitive f7 square.", watch: "Don't launch an attack with only one piece. Bring teammates first.",
    steps: [
      ["A fast, flexible start", "White begins by claiming the center and opening lines for the queen and bishop."],
      ["Claim e4", "The king pawn takes space and opens two pieces at once."],
      ["Meet in the center", "Black answers symmetrically and challenges White's space."],
      ["Develop with a threat", "The knight attacks e5 while moving toward the center."],
      ["Defend and develop", "Black's knight protects e5 and joins the game."],
      ["The Italian bishop", "The bishop points at f7—the pawn protected only by the king."],
      ["A natural defense", "Black develops and attacks the e4 pawn."],
      ["King tucked away", "White castles, protecting the king and activating the rook."]
    ]
  },
  {
    category: "opening", name: "Queen's Gambit", family: "QUEEN'S PAWN", level: "Space & pressure", moves: ["d2d4","d7d5","c2c4","e7e6","b1c3","g8f6"],
    plan: "Pressure d5, build a strong center, and develop smoothly. The c-pawn is offered to pull Black away from the center.", watch: "It is called a gambit, but White can usually recover the pawn.",
    steps: [["Challenge the center", "The Queen's Gambit uses a wing pawn to attack Black's central d5 pawn."],["Start with d4", "White controls e5 and opens the dark-squared bishop."],["Build a mirror", "Black plants a pawn on d5 and claims equal space."],["Offer the c-pawn", "White challenges d5. Taking it can pull Black's pawn away from center control."],["Decline the offer", "Black supports d5 with e6—the Queen's Gambit Declined."],["Add pressure", "The knight develops and attacks d5 again."],["Defend naturally", "Black's knight supports d5 and prepares to castle."]]
  },
  {
    category: "opening", name: "Ruy Lopez", family: "OPEN GAME", level: "Classic & strategic", moves: ["e2e4","e7e5","g1f3","b8c6","f1b5","a7a6","b5a4","g8f6"],
    plan: "Pressure the knight that guards e5, castle early, and slowly increase central pressure.", watch: "Bishop takes knight is not automatically a free pawn—the tactics matter.",
    steps: [["The Spanish Opening", "One of chess's deepest openings starts with quick development and pressure on e5."],["Take central space", "White opens lines and claims e4."],["Answer directly", "Black establishes a foothold on e5."],["Attack the pawn", "The knight develops with tempo against e5."],["Protect e5", "The knight blocks and defends."],["Pin the defender", "The bishop questions the knight that supports e5."],["Ask the bishop", "Black gains space and makes the bishop decide."],["Keep the bishop", "The bishop stays on the useful a4–e8 diagonal."],["Develop with pressure", "Black attacks e4 and gets ready to castle."]]
  },
  {
    category: "opening", name: "London System", family: "QUEEN'S PAWN", level: "Steady & simple", moves: ["d2d4","d7d5","g1f3","g8f6","c1f4","e7e6","e2e3"],
    plan: "Build a sturdy triangle with d4, e3, and c3; develop the bishop outside the pawn chain.", watch: "A system is not autopilot—always check what your opponent threatens.",
    steps: [["A dependable setup", "The London gives White a familiar structure against many Black defenses."],["Plant the d-pawn", "Control e5 and create room for the c1 bishop."],["Match the center", "Black claims d5."],["Knight before trouble", "White develops and supports the center."],["Black develops too", "Both sides prepare to castle."],["The London bishop", "Develop the bishop before e3 would lock it in."],["A solid shell", "Black supports the d5 pawn."],["Complete the triangle", "White supports d4 and opens the other bishop."]]
  },
  {
    category: "opening", name: "Sicilian Defense", family: "BLACK DEFENSE", level: "Sharp & exciting", moves: ["e2e4","c7c5","g1f3","d7d6","d2d4","c5d4","f3d4"],
    plan: "Black fights for d4 from the side and creates an unbalanced game with chances for both players.", watch: "Sicilian positions can become tactical quickly. Develop before grabbing pawns.",
    steps: [["Fight from the side", "Instead of copying e5, Black uses the c-pawn to challenge d4."],["White claims e4", "The most popular first move takes central space."],["The Sicilian reply", "Black controls d4 and creates an uneven pawn structure."],["Prepare d4", "White develops a knight before opening the center."],["Support the center", "Black prepares development and controls e5."],["Break now", "White challenges with d4."],["Trade a wing pawn", "Black exchanges the c-pawn for White's central d-pawn."],["Recapture and develop", "White's knight lands in the center with active options."]]
  },
  {
    category: "opening", name: "King's Indian", family: "INDIAN DEFENSE", level: "Bold counterattack", moves: ["d2d4","g8f6","c2c4","g7g6","b1c3","f8g7","e2e4","d7d6"],
    plan: "Let White build a center, then strike it with ...e5 or ...c5 while the bishop watches the long diagonal.", watch: "Black has less space at first, so timing the pawn break is essential.",
    steps: [["A coiled spring", "Black invites White forward, planning to counterattack the center later."],["White takes space", "The d-pawn controls e5 and c5."],["Flexible development", "Black develops without showing the central pawn plan."],["Build the center", "White adds more queenside space."],["Prepare the fianchetto", "Black will place the bishop on the long diagonal."],["Develop naturally", "White supports e4 and d5."],["The dragon bishop", "The bishop points through the center toward b2."],["The big center", "White plants pawns on d4 and e4."],["Prepare the strike", "Black supports an eventual ...e5 break."]]
  },
  {
    category: "opening", name: "French Defense", family: "BLACK DEFENSE", level: "Solid counterplay", moves: ["e2e4","e7e6","d2d4","d7d5","b1c3","g8f6"],
    plan: "Build a strong pawn chain, then challenge its base with c5 or f6.", watch: "The light-squared bishop can become trapped behind Black's e6 pawn.",
    steps: [["A resilient defense", "Black prepares to challenge White's center with d5."],["White claims e4", "White takes central space."],["Prepare the challenge", "Black supports the coming d5 break."],["Build the center", "White creates a broad pawn duo."],["Strike immediately", "Black attacks e4 and fixes the pawn structure."],["Add support", "White develops and protects e4."],["Pressure the center", "Black's knight attacks e4 and develops naturally."]]
  },
  {
    category: "opening", name: "Caro-Kann Defense", family: "BLACK DEFENSE", level: "Reliable & clear", moves: ["e2e4","c7c6","d2d4","d7d5","b1c3","d5e4","c3e4"],
    plan: "Challenge e4 with d5 while keeping the light-squared bishop free.", watch: "Black must develop actively after the center is exchanged.",
    steps: [["Strong and practical", "The Caro-Kann challenges White without blocking Black's bishop."],["Take space", "White claims e4."],["Support d5", "The c-pawn prepares the central challenge."],["Build a pawn duo", "White supports e4."],["Challenge now", "Black attacks the center."],["Develop", "White protects e4 with a knight."],["Clarify the center", "Black exchanges on e4."],["Centralize", "White's knight recaptures and becomes active."]]
  },
  {
    category: "opening", name: "Scotch Game", family: "OPEN GAME", level: "Direct & active", moves: ["e2e4","e7e5","g1f3","b8c6","d2d4","e5d4","f3d4"],
    plan: "Open the center early and use fast development to create activity.", watch: "An open center makes an uncastled king especially vulnerable.",
    steps: [["Open the board", "The Scotch challenges e5 before White develops the bishop."],["Claim e4", "White begins with central space."],["Answer e5", "Black builds a classical center."],["Develop with tempo", "White attacks e5."],["Defend", "Black develops and protects the pawn."],["Break in the center", "White immediately challenges e5."],["Exchange", "Black takes the d4 pawn."],["Recapture actively", "The knight occupies the center."]]
  },
  {
    category: "opening", name: "Vienna Game", family: "OPEN GAME", level: "Creative attack", moves: ["e2e4","e7e5","b1c3","g8f6","f2f4"],
    plan: "Develop the queenside knight and prepare an f-pawn attack against the king.", watch: "Moving the f-pawn exposes the diagonal toward your own king.",
    steps: [["A flexible attack", "The Vienna keeps several attacking plans available."],["Claim the center", "White opens lines with e4."],["Meet the center", "Black answers classically."],["A different knight", "White develops the b1 knight first."],["Pressure e4", "Black develops with an attack."],["The Vienna Gambit", "White offers the f-pawn to build a fast initiative."]]
  },
  {
    category: "middlegame", name: "Knight Outpost", family: "PIECE ACTIVITY", level: "Build a permanent home", startFen: "4k3/pp6/8/3N4/8/8/PP6/4K3 w - - 0 1", moves: ["d5c7","e8d7"],
    plan: "Place a knight where enemy pawns cannot chase it, especially near the center.", watch: "An outpost matters only when the knight has useful targets from that square.",
    steps: [["A powerful outpost", "The knight on d5 already controls key squares."],["Fork from c7", "The knight checks the king while also attacking a8 and b5."],["Force a response", "The king must move, showing how an active knight gains time."]]
  },
  {
    category: "middlegame", name: "Open-File Rook", family: "ROOK ACTIVITY", level: "Use clear highways", startFen: "6k1/8/8/8/8/8/4R3/4K3 w - - 0 1", moves: ["e2e8","g8f7"],
    plan: "Put rooks on files without pawns, then invade the seventh or eighth rank.", watch: "An open file is useful only if the rook has an entry square.",
    steps: [["Find the highway", "The e-file has no pawns blocking the rook."],["Invade with check", "Re8 reaches the back rank with tempo."],["Make the king react", "Black must leave the checked rank."]]
  },
  {
    category: "middlegame", name: "Passed Pawn", family: "PAWN STRATEGY", level: "Create a runner", startFen: "6k1/8/8/3P4/8/8/8/6K1 w - - 0 1", moves: ["d5d6","g8f7","d6d7"],
    plan: "Advance a passed pawn when it is safe, while using pieces to support its promotion.", watch: "Pushing too soon can make the pawn easier to blockade and capture.",
    steps: [["No pawn can stop it", "A passed pawn has no enemy pawn ahead or on neighboring files."],["Advance", "Every safe step increases the promotion threat."],["Bring the king closer", "Black tries to approach the pawn."],["Reach the seventh", "The pawn is now one step from promotion."]]
  },
  {
    category: "middlegame", name: "Create a Pin", family: "TACTICAL PRESSURE", level: "Limit a defender", startFen: "4k3/4n3/8/8/8/8/8/4R1K1 w - - 0 1", moves: ["e1e7","e8f8"],
    plan: "Attack a piece that cannot move without exposing something more valuable behind it.", watch: "Always verify that the pinned piece truly cannot move or counterattack.",
    steps: [["Line up the targets", "The knight stands between the rook and king."],["Capture with check", "The rook removes the pinned defender and attacks the king."],["The king retreats", "The tactic wins the defender with tempo."]]
  },
  {
    category: "endgame", name: "King Opposition", family: "KING & PAWN", level: "Control the doorway", startFen: "8/4k3/8/8/4K3/8/8/8 w - - 0 1", moves: ["e4e5","e7d7"],
    plan: "Face the enemy king with one square between you to control its route.", watch: "Whose turn it is changes whether opposition helps or hurts.",
    steps: [["Kings become fighters", "In the endgame, the king should move toward the center."],["Take opposition", "Ke5 places the kings face-to-face with one square between."],["Yield ground", "Black must step aside because the kings can never stand adjacent."]]
  },
  {
    category: "endgame", name: "The Rule of the Square", family: "PAWN RACE", level: "Calculate without counting", startFen: "8/8/8/8/P7/8/7k/K7 w - - 0 1", moves: ["a4a5","h2g3","a5a6"],
    plan: "Imagine a square from the pawn to the promotion rank. A king outside it cannot catch the pawn without help.", watch: "Remember to account for whose turn it is and a pawn's initial two-square move.",
    steps: [["Draw the invisible square", "The pawn's distance from promotion defines the catching zone."],["Run", "White starts the race."],["Chase", "The king heads toward the square."],["Keep going", "The pawn stays ahead and threatens promotion."]]
  },
  {
    category: "endgame", name: "Queen Ladder Mate", family: "BASIC CHECKMATE", level: "Shrink the box", startFen: "7k/8/8/8/8/8/4Q3/6K1 w - - 0 1", moves: ["e2e8","h8g7","e8e7"],
    plan: "Use the queen to make the king's available box smaller, then bring your king closer.", watch: "Leave the enemy king at least one legal square until your king is ready, or you may stalemate.",
    steps: [["Build a wall", "The queen can cut off an entire rank or file."],["Shrink the box", "Qe8 confines the king near the corner."],["The king steps away", "Black uses one of its remaining squares."],["Follow carefully", "The queen maintains the barrier without giving stalemate."]]
  },
  {
    category: "endgame", name: "Promote the Pawn", family: "PAWN ENDGAME", level: "Finish the race", startFen: "7k/P7/8/8/8/8/8/7K w - - 0 1", moves: ["a7a8"],
    plan: "Escort a passed pawn to the final rank and promote—usually to a queen.", watch: "Sometimes promoting to a rook or knight avoids stalemate or creates a tactic.",
    steps: [["One step away", "A pawn reaching the farthest rank must become another piece."],["Promotion", "The pawn becomes a queen and the winning plan becomes much easier."]]
  }
];

const puzzles = [
  { name: "Back-rank Beam", difficulty: 1, minLevel: 1, fen: "7k/6pp/8/8/8/8/6PP/5RK1 w - - 0 1", prompt: "White to move: find checkmate in one.", answer: "f1f8", hint: "The rook wants the eighth rank. Black's own pawns trap the king." },
  { name: "Queen Elevator", difficulty: 1, minLevel: 1, fen: "6k1/5ppp/8/8/8/8/6PP/3Q2K1 w - - 0 1", prompt: "White to move: deliver checkmate.", answer: "d1d8", hint: "Look for a queen move that attacks across the entire back rank." },
  { name: "Protected Rook", difficulty: 2, minLevel: 2, fen: "7k/5K2/8/8/8/3B4/8/6R1 w - - 0 1", prompt: "White to move: mate the cornered king.", answer: "g1g8", hint: "Your king protects g8, and the bishop quietly covers h7." },
  { name: "Win the Queen", difficulty: 2, minLevel: 2, fen: "8/8/3q1k2/8/8/2N5/8/4K3 w - - 0 1", prompt: "Fork practice: check the king and attack the queen.", answer: "c3e4", hint: "Find the knight jump that checks f6 and attacks d6." },
  { name: "Left-side Ladder", difficulty: 2, minLevel: 3, fen: "k7/pp6/8/8/8/8/PP6/2R3K1 w - - 0 1", prompt: "Find the rook checkmate on the far rank.", answer: "c1c8", hint: "Black's pawns leave the king no flight square." },
  { name: "Mirror Elevator", difficulty: 2, minLevel: 3, fen: "1k6/ppp5/8/8/8/8/PP6/4Q1K1 w - - 0 1", prompt: "Use the queen to mate on the eighth rank.", answer: "e1e8", hint: "The queen can attack sideways after reaching e8." },
  { name: "Queen Beam", difficulty: 3, minLevel: 4, fen: "7k/6pp/8/8/8/8/6PP/5QK1 w - - 0 1", prompt: "Find the quiet-looking queen move that is checkmate.", answer: "f1f8", hint: "The back rank is sealed by Black's own pawns." },
  { name: "Central Knight Fork", difficulty: 3, minLevel: 5, fen: "8/8/2q3k1/8/8/3N4/8/4K3 w - - 0 1", prompt: "Check the king and attack the queen at the same time.", answer: "d3e5", hint: "A knight on e5 attacks both g6 and c6." }
];

const state = {
  xp: 0, lessons: [], puzzles: [], streak: 1, lastVisit: null,
  sessionScore: 0, soundEnabled: true, skills: {}, player: null, updatedAt: null
};

const API_BASE = (window.WHIT_CHESS_CONFIG?.apiBase || "").replace(/\/$/, "");
let syncTimer;

function loadProgress() {
  try { Object.assign(state, JSON.parse(localStorage.getItem("whutTheChessProgress") || "{}")); } catch { /* start clean */ }
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastVisit !== today) {
    if (state.lastVisit) {
      const days = Math.round((new Date(today) - new Date(state.lastVisit)) / 86400000);
      state.streak = days === 1 ? (state.streak || 0) + 1 : 1;
    }
    state.lastVisit = today;
    saveProgress();
  }
  updateProgressUI();
}

function saveProgress() {
  state.updatedAt = new Date().toISOString();
  const progress = progressSnapshot();
  localStorage.setItem("whutTheChessProgress", JSON.stringify(progress));
  if (state.player) {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncProgress(progress), 650);
  }
}

function progressSnapshot() {
  return { xp: state.xp, lessons: state.lessons, puzzles: state.puzzles, streak: state.streak, lastVisit: state.lastVisit, soundEnabled: state.soundEnabled, skills: state.skills, updatedAt: state.updatedAt };
}

async function apiRequest(path, options = {}) {
  if (!API_BASE) throw new Error("Progress server is not configured.");
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.detail || "The progress server could not complete that request.");
  return payload;
}

async function syncProgress(progress = progressSnapshot()) {
  try {
    const result = await apiRequest("/api/progress", { method: "PUT", body: JSON.stringify(progress) });
    if (result?.progress) applyRemoteProgress(result.progress, false);
    setProfileStatus(true, `Signed in as ${state.player.username}. Progress synced.`);
  } catch {
    setProfileStatus(false, "You're still signed in, but sync is temporarily unavailable. Local progress is safe.");
  }
}

function applyRemoteProgress(progress, persist = true) {
  if (!progress) return;
  ["xp", "streak", "lastVisit", "soundEnabled", "updatedAt"].forEach(key => {
    if (progress[key] !== undefined && progress[key] !== null) state[key] = progress[key];
  });
  state.lessons = Array.isArray(progress.lessons) ? progress.lessons : state.lessons;
  state.puzzles = Array.isArray(progress.puzzles) ? progress.puzzles : state.puzzles;
  state.skills = progress.skills && typeof progress.skills === "object" ? progress.skills : state.skills;
  if (persist) localStorage.setItem("whutTheChessProgress", JSON.stringify(progressSnapshot()));
  updateProgressUI(); renderLessons(); renderChallenge(); updateSoundButton();
}

function awardXP(amount, reason = "Nice work!") {
  state.xp += amount;
  state.sessionScore += amount;
  saveProgress(); updateProgressUI();
  showToast(`+${amount} XP · ${reason}`);
}

function updateProgressUI() {
  const level = Math.floor((state.xp || 0) / 100) + 1;
  const within = (state.xp || 0) % 100;
  $("#levelBadge").textContent = `LV ${level}`;
  $("#xpLabel").textContent = `${state.xp || 0} XP`;
  $("#xpBar").style.width = `${within}%`;
  $("#streakCount").textContent = state.streak || 1;
  $("#sessionScore").textContent = state.sessionScore;
  const pieceLessonsDone = (state.lessons || []).filter(index => index < lessons.length).length;
  $("#lessonCount").textContent = `${pieceLessonsDone} / ${lessons.length}`;
  $("#profileLabel").textContent = state.player?.username || "Local player";
}

function showToast(message) {
  const toast = $("#toast"); toast.textContent = message; toast.classList.add("show");
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function celebrate() {
  const colors = ["#7258e8", "#ff6b6b", "#ffc947", "#48c9a6", "#5c9df5"];
  const cheers = ["YAY!", "AWESOME!", "YOU DID IT!", "HOORAY!", "NICE MOVE!"];
  const wrap = $("#confetti"); wrap.innerHTML = "";
  for (let i = 0; i < 50; i += 1) {
    const bit = document.createElement("i");
    bit.style.left = `${Math.random() * 100}%`; bit.style.background = colors[i % colors.length];
    if (i % 5 === 0) { bit.className = "yay-word"; bit.textContent = cheers[(i / 5) % cheers.length]; }
    bit.style.setProperty("--drift", `${Math.random() * 220 - 110}px`); bit.style.animationDelay = `${Math.random() * .35}s`;
    wrap.append(bit);
  }
  cheerSound();
  setTimeout(() => wrap.innerHTML = "", 2200);
}

function cheerSound() {
  if (!state.soundEnabled || !("speechSynthesis" in window)) return;
  const cheer = new SpeechSynthesisUtterance("Yay! Yay! We did it!");
  cheer.pitch = 1.55; cheer.rate = 1.22; cheer.volume = .75;
  window.speechSynthesis.speak(cheer);
}

let audioContext;
function sound(kind = "move") {
  if (!state.soundEnabled) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator(), gain = audioContext.createGain();
    const frequencies = { move: 310, capture: 180, success: 620, error: 120 };
    osc.frequency.value = frequencies[kind]; gain.gain.setValueAtTime(.05, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .13);
    osc.connect(gain).connect(audioContext.destination); osc.start(); osc.stop(audioContext.currentTime + .14);
  } catch { /* audio is optional */ }
}

function updateSoundButton() {
  const button = $("#soundToggle");
  button.textContent = state.soundEnabled ? "🔊 Sound on" : "🔇 Sound off";
  button.setAttribute("aria-pressed", String(state.soundEnabled));
}

function setProfileStatus(online, message) {
  const status = $("#profileStatus");
  status.classList.toggle("online", online);
  status.querySelector("p").textContent = message;
  $("#loginForm").hidden = Boolean(state.player);
  $(".register-panel").hidden = Boolean(state.player);
  $("#signoutButton").hidden = !state.player;
  updateProgressUI();
}

async function restoreRemoteSession() {
  try {
    const session = await apiRequest("/api/me");
    state.player = session.player;
    applyRemoteProgress(session.progress);
    setProfileStatus(true, `Signed in as ${state.player.username}. Progress synced.`);
  } catch {
    state.player = null;
    setProfileStatus(false, "Playing locally. Progress is saved on this device.");
  }
}

async function submitProfileForm(event, mode) {
  event.preventDefault();
  const form = event.currentTarget;
  const username = form.elements.username.value.trim();
  const pin = form.elements.pin.value;
  const body = { username, pin };
  if (mode === "register") body.inviteCode = form.elements.inviteCode.value;
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true; submit.textContent = mode === "register" ? "Creating player…" : "Signing in…";
  try {
    const result = await apiRequest(`/auth/${mode}`, { method: "POST", body: JSON.stringify(body) });
    state.player = result.player;
    const local = progressSnapshot();
    const remote = result.progress || {};
    const merged = (remote.xp || 0) >= (local.xp || 0) ? remote : local;
    applyRemoteProgress(merged);
    await syncProgress(progressSnapshot());
    setProfileStatus(true, `Signed in as ${state.player.username}. Progress synced.`);
    form.reset(); showToast(`Welcome, ${state.player.username}!`); sound("success");
  } catch (error) {
    setProfileStatus(false, error.message);
    sound("error");
  } finally {
    submit.disabled = false; submit.textContent = mode === "register" ? "Create player" : "Sign in and sync";
  }
}

$("#profileButton").addEventListener("click", () => { $("#profileModal").hidden = false; $("#loginUsername").focus(); });
$$('[data-close-profile]').forEach(control => control.addEventListener("click", () => { $("#profileModal").hidden = true; }));
$("#loginForm").addEventListener("submit", event => submitProfileForm(event, "login"));
$("#registerForm").addEventListener("submit", event => submitProfileForm(event, "register"));
$("#signoutButton").addEventListener("click", async () => {
  try { await apiRequest("/auth/logout", { method: "POST" }); } catch { /* local sign-out still completes */ }
  state.player = null; setProfileStatus(false, "Signed out. Progress remains saved on this device."); showToast("Signed out");
});
$("#soundToggle").addEventListener("click", () => { state.soundEnabled = !state.soundEnabled; saveProgress(); updateSoundButton(); if (state.soundEnabled) sound("success"); });

function renderBoard(element, board, options = {}) {
  const { selected = null, legal = [], hint = [], lastMove = null, onClick = null, target = null, labels = true } = options;
  element.innerHTML = "";
  board.forEach((piece, index) => {
    const row = Math.floor(index / 8), col = index % 8;
    const square = document.createElement("button");
    square.className = `square ${(row + col) % 2 ? "dark" : "light"}`;
    square.type = "button"; square.dataset.index = index;
    square.setAttribute("role", "gridcell");
    square.setAttribute("aria-label", `${indexToSquare(index)}${piece ? `, ${colorOf(piece) === "w" ? "white" : "black"} ${pieceName(piece)}` : ""}`);
    if (index === selected) square.classList.add("selected");
    const move = legal.find(item => item.to === index);
    if (move) square.classList.add("legal", move.captured ? "capture" : "quiet");
    if (lastMove && (lastMove.from === index || lastMove.to === index)) square.classList.add("last");
    if (hint.includes(index)) square.classList.add("hint");
    if (piece) {
      const token = document.createElement("span"); token.className = `piece ${colorOf(piece) === "w" ? "white" : "black"}`;
      token.textContent = PIECE_SYMBOLS[piece]; square.append(token);
      if (lastMove?.to === index) square.classList.add("just-moved");
    }
    if (target === index) { const star = document.createElement("span"); star.className = "piece"; star.textContent = "⭐"; square.append(star); }
    if (labels && col === 0) { const label = document.createElement("span"); label.className = "coord rank"; label.textContent = 8 - row; square.append(label); }
    if (labels && row === 7) { const label = document.createElement("span"); label.className = "coord file"; label.textContent = FILES[col]; square.append(label); }
    if (onClick) square.addEventListener("click", () => onClick(index)); else square.disabled = true;
    element.append(square);
  });
}

function pieceName(piece) {
  return ({ p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" })[typeOf(piece)] || "piece";
}

function switchView(name) {
  $$(".view").forEach(v => v.classList.toggle("active", v.id === `view-${name}`));
  $$(".nav-tab").forEach(v => v.classList.toggle("active", v.dataset.viewTarget === name));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$$('[data-view-target]').forEach(button => button.addEventListener("click", () => switchView(button.dataset.viewTarget)));

// Play mode
let playGame = new ChessGame();
let playSelected = null;
let playLegal = [];
let playHint = [];
let botThinking = false;
let moveStory = [];
let gameXP = 0;
const missions = { center: false, develop: false, castle: false };

function renderPlay() {
  renderBoard($("#playBoard"), playGame.board, { selected: playSelected, legal: playLegal, hint: playHint, lastMove: playGame.lastMove, onClick: playClick });
  const status = playGame.status();
  const turnLabel = $("#turnLabel"), turnDot = $("#turnDot");
  if (status.over) { turnLabel.textContent = status.type === "checkmate" ? (status.winner === "w" ? "You won!" : "Coach wins") : "Draw game"; turnDot.style.background = "#ff6b6b"; }
  else if (botThinking) { turnLabel.textContent = "Coach is thinking…"; turnDot.style.background = "#ffc947"; }
  else { turnLabel.textContent = playGame.turn === "w" ? (status.type === "check" ? "Your king is in check!" : "Your turn") : "Coach's turn"; turnDot.style.background = playGame.turn === "w" ? "#48c9a6" : "#ffc947"; }
  $("#undoButton").disabled = botThinking || playGame.history.length === 0;
  renderMoveLog(); updateMissions();
}

function playClick(index) {
  if (botThinking || playGame.turn !== "w" || playGame.status().over) return;
  const piece = playGame.board[index];
  if (playSelected !== null) {
    const move = playLegal.find(item => item.to === index);
    if (move) { makePlayerMove(move); return; }
  }
  if (piece && colorOf(piece) === "w") {
    playSelected = index; playLegal = playGame.moves(index); playHint = [];
    coachForSelection(piece, playLegal.length); sound("move"); renderPlay();
  } else { playSelected = null; playLegal = []; renderPlay(); }
}

function makePlayerMove(move) {
  const before = playGame.board[move.to];
  const moved = playGame.move(move.from, move.to);
  if (!moved) return;
  sound(before || moved.enPassant ? "capture" : "move");
  moveStory.push({ side: "You", text: prettyMove(moved) });
  gameXP += 1; if (gameXP <= 20) awardXP(1, "Legal move");
  trackMission(moved); playSelected = null; playLegal = []; playHint = [];
  const status = playGame.status();
  if (status.over) { finishGame(status); renderPlay(); return; }
  coachAfterMove(moved); botThinking = true; renderPlay();
  setTimeout(botMove, 460);
}

function botMove() {
  const depth = Number($("#difficultySelect").value);
  let move = bestMove(playGame, depth);
  if (depth === 1) {
    const choices = playGame.moves();
    const captures = choices.filter(m => m.captured);
    move = (captures.length ? captures : choices)[Math.floor(Math.random() * (captures.length ? captures.length : choices.length))] || move;
  }
  if (move) {
    playGame.move(move.from, move.to); moveStory.push({ side: "Nova", text: prettyMove(move) });
    sound(move.captured ? "capture" : "move");
  }
  botThinking = false;
  const status = playGame.status();
  if (status.over) finishGame(status); else if (status.type === "check") setCoach("⚠️", "Check alert!", "Your king is attacked. Block the attack, capture the attacker, or move the king.");
  renderPlay();
}

function prettyMove(move) {
  const icon = PIECE_SYMBOLS[move.piece];
  return `${icon} ${indexToSquare(move.from)} → ${indexToSquare(move.to)}${move.captured ? " ×" : ""}${move.castle ? " castle" : ""}`;
}

function coachForSelection(piece, count) {
  const type = pieceName(piece);
  const tips = {
    pawn: "Pawns control the two diagonal squares ahead—even though they move straight.", knight: "Knights jump in an L and love central squares.",
    bishop: "Bishops need open diagonals. Scan all the way to the board's edge.", rook: "Rooks become strongest on open files with no pawns in the way.",
    queen: "Your queen is powerful. Check that a smaller piece cannot chase her after the move.", king: "Safety first. Never move your king onto an attacked square."
  };
  setCoach("🔎", `${count} legal ${count === 1 ? "move" : "moves"} for that ${type}`, tips[type]);
}

function coachAfterMove(move) {
  const destination = indexToSquare(move.to);
  if (["d4","e4","d5","e5"].includes(destination)) setCoach("🎯", "Center control!", `${destination} is one of the four key center squares. Pieces placed there influence more of the board.`);
  else if (move.castle) setCoach("🏰", "King secured!", "Castling protects your king and brings a rook closer to the action. Two jobs with one move!");
  else if (move.captured) setCoach("⚔️", "Capture made", "Before celebrating a capture, check whether the capturing piece can be taken back.");
  else setCoach("🧠", "Good—now scan the board", "Ask what your opponent can check, capture, or threaten after your move.");
}

function setCoach(icon, title, text) {
  $("#coachMessage").innerHTML = `<span class="message-icon">${icon}</span><div><strong>${title}</strong><p>${text}</p></div>`;
}

function trackMission(move) {
  const to = indexToSquare(move.to);
  if (typeOf(move.piece) === "p" && ["d4","e4"].includes(to)) missions.center = true;
  if (["n","b"].includes(typeOf(move.piece)) && move.from >= 56) missions.develop = true;
  if (move.castle) missions.castle = true;
}

function updateMissions() {
  let done = 0;
  Object.entries(missions).forEach(([key, value]) => {
    const item = $(`[data-mission="${key}"]`); item.classList.toggle("done", value); item.querySelector("span").textContent = value ? "✓" : "○"; if (value) done += 1;
  });
  $("#missionProgress").textContent = `${done} / 3`;
  if (done === 3 && !missions.awarded) { missions.awarded = true; awardXP(30, "Opening mission complete"); celebrate(); }
}

function renderMoveLog() {
  const log = $("#moveLog");
  if (!moveStory.length) { log.innerHTML = '<p class="empty-log">Your moves will appear here.</p>'; return; }
  log.innerHTML = moveStory.map((move, i) => `<span><b class="move-number">${i + 1}.</b> ${move.text}</span>`).join("");
  log.scrollTop = log.scrollHeight;
}

function finishGame(status) {
  if (status.type === "checkmate" && status.winner === "w") { setCoach("🏆", "Checkmate!", "You won by trapping the king. That's worth a big victory bonus!"); awardXP(50, "Game won"); celebrate(); sound("success"); }
  else if (status.type === "checkmate") setCoach("🤝", "Good game", "Coach Nova found checkmate. Review the last few moves, then try again—you get stronger every game.");
  else setCoach("🤝", "Draw", "Neither side can force a win from this position. A draw can be a smart result!");
}

$("#hintButton").addEventListener("click", () => {
  if (botThinking || playGame.turn !== "w" || playGame.status().over) return;
  const move = bestMove(playGame, 2); if (!move) return;
  playHint = [move.from, move.to];
  setCoach("💡", `Try ${indexToSquare(move.from)} → ${indexToSquare(move.to)}`, "This move improves your position based on safety, activity, and material. Can you see what it changes?");
  renderPlay();
});

$("#undoButton").addEventListener("click", () => {
  if (botThinking) return;
  if (playGame.undo()) { if (playGame.turn === "b" && playGame.history.length) playGame.undo(); moveStory.splice(-2); playSelected = null; playLegal = []; playHint = []; setCoach("↶", "Position restored", "Try a different plan and compare what changes."); renderPlay(); }
});

$("#newGameButton").addEventListener("click", newGame);
$("#clearLog").addEventListener("click", () => { moveStory = []; renderMoveLog(); });

function newGame() {
  playGame = new ChessGame(); playSelected = null; playLegal = []; playHint = []; moveStory = []; botThinking = false; gameXP = 0;
  Object.keys(missions).forEach(key => delete missions[key]); Object.assign(missions, { center: false, develop: false, castle: false });
  setCoach("🎯", "First mission: own the center!", "Try moving the pawn in front of your king or queen two squares. That opens paths for your bishops and queen."); renderPlay();
}

// Lessons
let activeLesson = 0;
function renderLessons() {
  $("#lessonList").innerHTML = lessons.map((lesson, i) => `<button class="lesson-button ${i === activeLesson ? "active" : ""}" data-lesson="${i}"><span class="mini-piece">${lesson.piece}</span><span><strong>${lesson.name}</strong><small>${lesson.time}</small></span><span class="check">${state.lessons.includes(i) ? "✓" : ""}</span></button>`).join("");
  $$('[data-lesson]').forEach(button => button.addEventListener("click", () => { activeLesson = Number(button.dataset.lesson); renderLessons(); }));
  const lesson = lessons[activeLesson];
  $("#lessonPiece").textContent = lesson.piece; $("#lessonKicker").textContent = `LESSON ${activeLesson + 1} OF ${lessons.length}`; $("#lessonTitle").textContent = lesson.name; $("#lessonLead").textContent = lesson.lead;
  $("#lessonRules").innerHTML = lesson.rules.map(rule => `<div class="lesson-rule"><span>✦</span><p>${rule}</p></div>`).join("");
  const done = state.lessons.includes(activeLesson); $("#completeLesson").textContent = done ? "✓ Lesson complete" : "Mark lesson complete +20 XP"; $("#completeLesson").classList.toggle("done", done); $("#completeLesson").disabled = done;
  updateProgressUI();
}

$("#completeLesson").addEventListener("click", () => {
  if (state.lessons.includes(activeLesson)) return;
  state.lessons.push(activeLesson); awardXP(20, "Lesson complete"); celebrate(); sound("success"); renderLessons();
});

// Strategy lab
let activeStrategyCategory = "opening", activeOpening = 0, openingStep = 0, openingGame = new ChessGame();
function newStrategyGame(strategy = openings[activeOpening]) { return new ChessGame(strategy.startFen || START); }
function selectOpening(index) { activeOpening = index; openingStep = 0; openingGame = newStrategyGame(); renderOpenings(); }
function renderOpenings() {
  const opening = openings[activeOpening];
  const filtered = openings.map((item, index) => ({ item, index })).filter(({ item }) => item.category === activeStrategyCategory);
  $("#openingMenu").innerHTML = filtered.map(({ item, index }) => `<button class="opening-choice ${index === activeOpening ? "active" : ""}" data-opening="${index}"><strong>${item.name}</strong><small>${item.level}</small></button>`).join("");
  $$('[data-opening]').forEach(button => button.addEventListener("click", () => selectOpening(Number(button.dataset.opening))));
  renderBoard($("#openingBoard"), openingGame.board, { lastMove: openingGame.lastMove });
  $("#openingFamily").textContent = opening.family; $("#openingName").textContent = opening.name;
  $("#openingCounter").textContent = openingStep ? `Move ${openingStep} / ${opening.moves.length}` : "Start";
  const note = opening.steps[openingStep] || opening.steps.at(-1); $("#openingMoveTitle").textContent = note[0]; $("#openingExplanation").textContent = note[1]; $("#openingPlan").textContent = opening.plan; $("#openingWatch").textContent = opening.watch;
  $("#openingPrev").disabled = openingStep === 0; $("#openingNext").disabled = openingStep === opening.moves.length;
  $("#openingNext").textContent = openingStep === opening.moves.length - 1 ? "Finish lesson →" : "Next move →";
}

$("#openingNext").addEventListener("click", () => {
  const opening = openings[activeOpening]; if (openingStep >= opening.moves.length) return;
  const code = opening.moves[openingStep]; openingGame.move(code.slice(0,2), code.slice(2,4)); openingStep += 1; sound("move"); renderOpenings();
  if (openingStep === opening.moves.length) {
    const key = 100 + activeOpening; if (!state.lessons.includes(key)) { state.lessons.push(key); awardXP(25, `${opening.name} explored`); celebrate(); }
  }
});
$("#openingPrev").addEventListener("click", () => { if (!openingStep) return; openingStep -= 1; openingGame = newStrategyGame(); for (let i = 0; i < openingStep; i += 1) { const code = openings[activeOpening].moves[i]; openingGame.move(code.slice(0,2), code.slice(2,4)); } renderOpenings(); });
$("#openingReset").addEventListener("click", () => selectOpening(activeOpening));
$$('[data-strategy]').forEach(button => button.addEventListener("click", () => {
  activeStrategyCategory = button.dataset.strategy;
  $$('[data-strategy]').forEach(item => item.classList.toggle("active", item === button));
  activeOpening = openings.findIndex(item => item.category === activeStrategyCategory);
  selectOpening(activeOpening);
}));

// Challenge arcade
let challengeMode = "puzzles", puzzleIndex = 0, puzzleGame = new ChessGame(puzzles[0].fen), puzzleSelected = null, puzzleLegal = [];
let coordinateTarget = "e4", valuePiece = "N", quest = null;

function playerLevel() { return Math.floor((state.xp || 0) / 100) + 1; }
function unlockedPuzzles() { return puzzles.map((puzzle, index) => ({ puzzle, index })).filter(({ puzzle }) => puzzle.minLevel <= playerLevel()); }

function setChallengeMode(mode) {
  challengeMode = mode; $$("#challengeTabs button").forEach(button => button.classList.toggle("active", button.dataset.mode === mode));
  $("#nextChallenge").style.display = mode === "puzzles" ? "block" : "none";
  resetChallenge();
}

function resetChallenge() {
  puzzleSelected = null; puzzleLegal = [];
  if (challengeMode === "puzzles") {
    const available = unlockedPuzzles();
    if (!available.some(item => item.index === puzzleIndex)) puzzleIndex = available[0].index;
    puzzleGame = new ChessGame(puzzles[puzzleIndex].fen);
  }
  if (challengeMode === "quest") quest = generateQuest();
  if (challengeMode === "coordinates") coordinateTarget = randomSquare();
  if (challengeMode === "values") valuePiece = ["P","N","B","R","Q"][Math.floor(Math.random()*5)];
  feedback("🧠", "Take your time.", challengeMode === "puzzles" ? "Look for checks, captures, and threats—in that order." : "Every attempt trains your board vision."); renderChallenge();
}

function renderChallenge() {
  const board = Array(64).fill(null);
  if (challengeMode === "puzzles") {
    const puzzle = puzzles[puzzleIndex], available = unlockedPuzzles();
    $("#challengeKicker").textContent = `LEVEL ${puzzle.difficulty} TACTIC · ${available.findIndex(item => item.index === puzzleIndex) + 1} OF ${available.length}`; $("#challengePrompt").textContent = puzzle.prompt; $("#challengeTimer").textContent = "∞";
    renderBoard($("#challengeBoard"), puzzleGame.board, { selected: puzzleSelected, legal: puzzleLegal, lastMove: puzzleGame.lastMove, onClick: puzzleClick });
    $("#challengeContent").innerHTML = `<span class="eyebrow">UNLOCKED FOR LEVEL ${playerLevel()}</span><div class="puzzle-list">${available.map(({puzzle:p,index:i})=>`<button class="puzzle-choice ${i===puzzleIndex?"active":""}" data-puzzle="${i}"><span>${p.name}</span><b>${state.puzzles.includes(i) ? "✓" : i + 1}</b></button>`).join("")}</div><p class="profile-copy">New tactics unlock as your XP level grows. Missed patterns return for more practice.</p><button class="action wide" id="puzzleHint" style="margin-top:12px">💡 Give me a clue</button>`;
    $$('[data-puzzle]').forEach(button => button.addEventListener("click", () => { puzzleIndex = Number(button.dataset.puzzle); resetChallenge(); }));
    $("#puzzleHint").addEventListener("click", () => feedback("💡", "Clue", puzzle.hint));
  } else if (challengeMode === "quest") {
    const legal = questMoves(quest.index, quest.piece, quest.board).map(to => ({ to, captured: quest.board[to] }));
    $("#challengeKicker").textContent = `PIECE QUEST · LEVEL ${playerLevel()}`; $("#challengePrompt").textContent = `Guide the ${pieceName(quest.piece)} to ${indexToSquare(quest.target)}.`; $("#challengeTimer").textContent = `${quest.movesLeft} moves`;
    renderBoard($("#challengeBoard"), quest.board, { legal, target: quest.target, onClick: questClick });
    $("#challengeContent").innerHTML = `<span class="difficulty-tag">DIFFICULTY ${quest.difficulty}</span><div class="quest-piece-card"><span class="quest-icon">${PIECE_SYMBOLS[quest.piece]}</span><span><strong>${pieceName(quest.piece)[0].toUpperCase()+pieceName(quest.piece).slice(1)} Quest</strong><small>Target: ${indexToSquare(quest.target)}</small></span></div><p>${quest.instructions}</p><div class="mini-stat"><span>Moves remaining</span><b>${quest.movesLeft}</b></div><div class="mini-stat"><span>Other pieces</span><b>${quest.blockers}</b></div><button class="action wide" id="resetQuest" style="margin-top:15px">↻ New random board</button>`;
    $("#resetQuest").addEventListener("click", resetChallenge);
  } else if (challengeMode === "coordinates") {
    $("#challengeKicker").textContent = "SQUARE SPRINT"; $("#challengePrompt").textContent = `Tap square ${coordinateTarget}.`; $("#challengeTimer").textContent = "⌖";
    renderBoard($("#challengeBoard"), board, { onClick: coordinateClick });
    $("#challengeContent").innerHTML = `<span class="eyebrow">BOARD VISION</span><h2>Find ${coordinateTarget}</h2><p>Files are letters a–h. Ranks are numbers 1–8. White's lower-left corner is a1.</p><div class="mini-stat"><span>Target file</span><b>${coordinateTarget[0]}</b></div><div class="mini-stat"><span>Target rank</span><b>${coordinateTarget[1]}</b></div>`;
  } else {
    board[squareToIndex("d4")] = valuePiece;
    $("#challengeKicker").textContent = "PIECE POINTS"; $("#challengePrompt").textContent = `How many points is a ${pieceName(valuePiece)} usually worth?`; $("#challengeTimer").textContent = "★";
    renderBoard($("#challengeBoard"), board);
    $("#challengeContent").innerHTML = `<span class="eyebrow">MATERIAL MATH</span><h2>${PIECE_SYMBOLS[valuePiece]} ${pieceName(valuePiece)}</h2><p>Choose the standard teaching value.</p><div class="value-options">${[1,3,5,9].map(v=>`<button data-value="${v}">${v} ${v===1?"point":"points"}</button>`).join("")}</div>`;
    $$('[data-value]').forEach(button => button.addEventListener("click", () => valueClick(Number(button.dataset.value))));
  }
}

function puzzleClick(index) {
  const piece = puzzleGame.board[index];
  if (puzzleSelected !== null) {
    const move = puzzleLegal.find(item => item.to === index);
    if (move) {
      const code = moveCode(move), correct = code === puzzles[puzzleIndex].answer;
      state.skills.tactics ||= { attempts: 0, correct: 0 }; state.skills.tactics.attempts += 1;
      if (correct) {
        state.skills.tactics.correct += 1;
        puzzleGame.move(move.from, move.to); sound("success"); feedback("🏆", "Pattern found!", "Excellent. You found the forcing move before the opponent could escape.");
        if (!state.puzzles.includes(puzzleIndex)) { state.puzzles.push(puzzleIndex); awardXP(30, "Puzzle solved"); celebrate(); }
      } else { sound("error"); feedback("↶", "Good try—look again", puzzles[puzzleIndex].hint); }
      puzzleSelected = null; puzzleLegal = []; renderChallenge(); return;
    }
  }
  if (piece && colorOf(piece) === "w") { puzzleSelected = index; puzzleLegal = puzzleGame.moves(index); sound("move"); renderChallenge(); }
}

function generateQuest() {
  const level = playerLevel();
  const available = level < 2 ? ["N","R"] : level < 4 ? ["N","R","B","Q"] : ["N","R","B","Q","K","P"];
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const piece = available[Math.floor(Math.random() * available.length)];
    const board = Array(64).fill(null);
    let index = Math.floor(Math.random() * 64);
    if (piece === "P") index = 24 + Math.floor(Math.random() * 32);
    board[index] = piece;
    const blockers = Math.min(3 + Math.floor(level / 2), 10);
    const enemyPieces = ["p","n","b","r"];
    for (let i = 0; i < blockers; i += 1) {
      let spot = Math.floor(Math.random() * 64), guard = 0;
      while (board[spot] && guard++ < 80) spot = Math.floor(Math.random() * 64);
      if (!board[spot]) board[spot] = Math.random() < .48 ? "P" : enemyPieces[Math.floor(Math.random() * enemyPieces.length)];
    }
    const steps = Math.min(1 + Math.floor(level / 2), 3);
    let cursor = index, target = null;
    for (let step = 0; step < steps; step += 1) {
      const choices = questMoves(cursor, piece, board).filter(to => !board[to]);
      if (!choices.length) break;
      target = choices[Math.floor(Math.random() * choices.length)]; cursor = target;
    }
    if (target !== null && target !== index) {
      const instructions = ({ N:"Jump in an L shape. Other pieces cannot block a knight.", R:"Travel in straight lines, but stop when another piece blocks the road.", B:"Stay on your diagonal color and look for open lanes.", Q:"Combine rook roads and bishop diagonals to find the cleanest route.", K:"Move one square at a time and choose the safest path.", P:"Move forward into empty squares and capture only on a diagonal." })[piece];
      return { piece, board, index, start: index, target, movesLeft: Math.max(steps, 2), difficulty: Math.min(5, 1 + Math.floor(level / 2)), blockers, instructions };
    }
  }
  const fallbackBoard = Array(64).fill(null); fallbackBoard[squareToIndex("b1")] = "N";
  return { piece:"N", board:fallbackBoard, index:squareToIndex("b1"), start:squareToIndex("b1"), target:squareToIndex("e5"), movesLeft:3, difficulty:1, blockers:0, instructions:"Jump in an L shape. Other pieces cannot block a knight." };
}

function questMoves(from, piece, board) {
  const row = Math.floor(from / 8), col = from % 8, moves = [];
  const add = (r,c) => { if (r<0||r>7||c<0||c>7) return false; const to=r*8+c, target=board[to]; if (!target || colorOf(target)==="b") moves.push(to); return !target; };
  const slide = dirs => dirs.forEach(([dr,dc]) => { let r=row+dr,c=col+dc; while(r>=0&&r<8&&c>=0&&c<8){ if(!add(r,c)) break; r+=dr;c+=dc; } });
  if (piece === "N") [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc])=>add(row+dr,col+dc));
  if (piece === "B") slide([[-1,-1],[-1,1],[1,-1],[1,1]]);
  if (piece === "R") slide([[-1,0],[1,0],[0,-1],[0,1]]);
  if (piece === "Q") slide([[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]);
  if (piece === "K") [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc])=>add(row+dr,col+dc));
  if (piece === "P") {
    if (row>0 && !board[(row-1)*8+col]) moves.push((row-1)*8+col);
    [-1,1].forEach(dc=>{ const r=row-1,c=col+dc; if(r>=0&&c>=0&&c<8&&board[r*8+c]&&colorOf(board[r*8+c])==="b") moves.push(r*8+c); });
  }
  return moves;
}

function questClick(index) {
  if (!quest || quest.movesLeft <= 0) return;
  const legal = questMoves(quest.index, quest.piece, quest.board);
  if (!legal.includes(index)) { sound("error"); feedback("↶", "That piece can't move there", quest.instructions); return; }
  quest.board[quest.index] = null; quest.board[index] = quest.piece; quest.index = index; quest.movesLeft -= 1; sound("move");
  if (index === quest.target) {
    state.skills.pieceQuest = (state.skills.pieceQuest || 0) + 1;
    awardXP(10 + quest.difficulty * 3, `${pieceName(quest.piece)} Quest complete`); celebrate();
    feedback("⭐", "Perfect route!", "A new board with a different piece is coming next."); renderChallenge();
    setTimeout(() => { if (challengeMode === "quest") { quest = generateQuest(); renderChallenge(); } }, 1200); return;
  }
  if (quest.movesLeft <= 0) { sound("error"); feedback("↻", "Out of moves", "Try a different route or generate a fresh board."); }
  renderChallenge();
}

function coordinateClick(index) {
  if (indexToSquare(index) === coordinateTarget) { sound("success"); awardXP(5, "Square found"); feedback("🎯", "Bullseye!", `${coordinateTarget} is exactly right. Here's another one.`); coordinateTarget = randomSquare(); renderChallenge(); }
  else { sound("error"); feedback("⌖", "Check the edges", `Find file ${coordinateTarget[0]} first, then rank ${coordinateTarget[1]}.`); }
}

function valueClick(value) {
  const answer = ({ p:1,n:3,b:3,r:5,q:9 })[typeOf(valuePiece)];
  if (value === answer) { sound("success"); awardXP(5, "Material math"); feedback("★", "Correct!", `${pieceName(valuePiece)[0].toUpperCase()+pieceName(valuePiece).slice(1)} = ${answer} ${answer===1?"point":"points"}. A new piece is ready.`); valuePiece = ["P","N","B","R","Q"][Math.floor(Math.random()*5)]; renderChallenge(); }
  else { sound("error"); feedback("🧮", "Not quite", "Pawn 1 · Knight 3 · Bishop 3 · Rook 5 · Queen 9."); }
}

function feedback(icon, title, text) { $("#challengeFeedback").innerHTML = `<span>${icon}</span><div><strong>${title}</strong><p>${text}</p></div>`; }
function randomSquare() { return `${FILES[Math.floor(Math.random()*8)]}${Math.floor(Math.random()*8)+1}`; }

$$('#challengeTabs button').forEach(button => button.addEventListener("click", () => setChallengeMode(button.dataset.mode)));
$("#nextChallenge").addEventListener("click", () => { const available = unlockedPuzzles(); const current = available.findIndex(item => item.index === puzzleIndex); puzzleIndex = available[(current + 1) % available.length].index; resetChallenge(); });

loadProgress(); updateSoundButton(); renderPlay(); renderLessons(); renderOpenings(); renderChallenge(); restoreRemoteSession();
