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
    name: "Italian Game", family: "OPEN GAME", level: "Friendly & attacking", moves: ["e2e4","e7e5","g1f3","b8c6","f1c4","g8f6","e1g1"],
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
    name: "Queen's Gambit", family: "QUEEN'S PAWN", level: "Space & pressure", moves: ["d2d4","d7d5","c2c4","e7e6","b1c3","g8f6"],
    plan: "Pressure d5, build a strong center, and develop smoothly. The c-pawn is offered to pull Black away from the center.", watch: "It is called a gambit, but White can usually recover the pawn.",
    steps: [["Challenge the center", "The Queen's Gambit uses a wing pawn to attack Black's central d5 pawn."],["Start with d4", "White controls e5 and opens the dark-squared bishop."],["Build a mirror", "Black plants a pawn on d5 and claims equal space."],["Offer the c-pawn", "White challenges d5. Taking it can pull Black's pawn away from center control."],["Decline the offer", "Black supports d5 with e6—the Queen's Gambit Declined."],["Add pressure", "The knight develops and attacks d5 again."],["Defend naturally", "Black's knight supports d5 and prepares to castle."]]
  },
  {
    name: "Ruy Lopez", family: "OPEN GAME", level: "Classic & strategic", moves: ["e2e4","e7e5","g1f3","b8c6","f1b5","a7a6","b5a4","g8f6"],
    plan: "Pressure the knight that guards e5, castle early, and slowly increase central pressure.", watch: "Bishop takes knight is not automatically a free pawn—the tactics matter.",
    steps: [["The Spanish Opening", "One of chess's deepest openings starts with quick development and pressure on e5."],["Take central space", "White opens lines and claims e4."],["Answer directly", "Black establishes a foothold on e5."],["Attack the pawn", "The knight develops with tempo against e5."],["Protect e5", "The knight blocks and defends."],["Pin the defender", "The bishop questions the knight that supports e5."],["Ask the bishop", "Black gains space and makes the bishop decide."],["Keep the bishop", "The bishop stays on the useful a4–e8 diagonal."],["Develop with pressure", "Black attacks e4 and gets ready to castle."]]
  },
  {
    name: "London System", family: "QUEEN'S PAWN", level: "Steady & simple", moves: ["d2d4","d7d5","g1f3","g8f6","c1f4","e7e6","e2e3"],
    plan: "Build a sturdy triangle with d4, e3, and c3; develop the bishop outside the pawn chain.", watch: "A system is not autopilot—always check what your opponent threatens.",
    steps: [["A dependable setup", "The London gives White a familiar structure against many Black defenses."],["Plant the d-pawn", "Control e5 and create room for the c1 bishop."],["Match the center", "Black claims d5."],["Knight before trouble", "White develops and supports the center."],["Black develops too", "Both sides prepare to castle."],["The London bishop", "Develop the bishop before e3 would lock it in."],["A solid shell", "Black supports the d5 pawn."],["Complete the triangle", "White supports d4 and opens the other bishop."]]
  },
  {
    name: "Sicilian Defense", family: "BLACK DEFENSE", level: "Sharp & exciting", moves: ["e2e4","c7c5","g1f3","d7d6","d2d4","c5d4","f3d4"],
    plan: "Black fights for d4 from the side and creates an unbalanced game with chances for both players.", watch: "Sicilian positions can become tactical quickly. Develop before grabbing pawns.",
    steps: [["Fight from the side", "Instead of copying e5, Black uses the c-pawn to challenge d4."],["White claims e4", "The most popular first move takes central space."],["The Sicilian reply", "Black controls d4 and creates an uneven pawn structure."],["Prepare d4", "White develops a knight before opening the center."],["Support the center", "Black prepares development and controls e5."],["Break now", "White challenges with d4."],["Trade a wing pawn", "Black exchanges the c-pawn for White's central d-pawn."],["Recapture and develop", "White's knight lands in the center with active options."]]
  },
  {
    name: "King's Indian", family: "INDIAN DEFENSE", level: "Bold counterattack", moves: ["d2d4","g8f6","c2c4","g7g6","b1c3","f8g7","e2e4","d7d6"],
    plan: "Let White build a center, then strike it with ...e5 or ...c5 while the bishop watches the long diagonal.", watch: "Black has less space at first, so timing the pawn break is essential.",
    steps: [["A coiled spring", "Black invites White forward, planning to counterattack the center later."],["White takes space", "The d-pawn controls e5 and c5."],["Flexible development", "Black develops without showing the central pawn plan."],["Build the center", "White adds more queenside space."],["Prepare the fianchetto", "Black will place the bishop on the long diagonal."],["Develop naturally", "White supports e4 and d5."],["The dragon bishop", "The bishop points through the center toward b2."],["The big center", "White plants pawns on d4 and e4."],["Prepare the strike", "Black supports an eventual ...e5 break."]]
  }
];

const puzzles = [
  { name: "Back-rank Beam", fen: "7k/6pp/8/8/8/8/6PP/5RK1 w - - 0 1", prompt: "White to move: find checkmate in one.", answer: "f1f8", hint: "The rook wants the eighth rank. Black's own pawns trap the king." },
  { name: "Queen Elevator", fen: "6k1/5ppp/8/8/8/8/6PP/3Q2K1 w - - 0 1", prompt: "White to move: deliver checkmate.", answer: "d1d8", hint: "Look for a queen move that attacks across the entire back rank." },
  { name: "Protected Rook", fen: "7k/5K2/8/8/8/3B4/8/6R1 w - - 0 1", prompt: "White to move: mate the cornered king.", answer: "g1g8", hint: "Your king protects g8, and the bishop quietly covers h7." },
  { name: "Win the Queen", fen: "8/8/3q1k2/8/8/2N5/8/4K3 w - - 0 1", prompt: "Fork practice: check the king and attack the queen.", answer: "c3e4", hint: "Find the knight jump that checks f6 and attacks d6." }
];

const state = {
  xp: 0, lessons: [], puzzles: [], streak: 1, lastVisit: null,
  sessionScore: 0
};

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
  localStorage.setItem("whutTheChessProgress", JSON.stringify({ xp: state.xp, lessons: state.lessons, puzzles: state.puzzles, streak: state.streak, lastVisit: state.lastVisit }));
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
}

function showToast(message) {
  const toast = $("#toast"); toast.textContent = message; toast.classList.add("show");
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function celebrate() {
  const colors = ["#7258e8", "#ff6b6b", "#ffc947", "#48c9a6", "#5c9df5"];
  const wrap = $("#confetti"); wrap.innerHTML = "";
  for (let i = 0; i < 42; i += 1) {
    const bit = document.createElement("i");
    bit.style.left = `${Math.random() * 100}%`; bit.style.background = colors[i % colors.length];
    bit.style.setProperty("--drift", `${Math.random() * 220 - 110}px`); bit.style.animationDelay = `${Math.random() * .35}s`;
    wrap.append(bit);
  }
  setTimeout(() => wrap.innerHTML = "", 2200);
}

let audioContext;
function sound(kind = "move") {
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator(), gain = audioContext.createGain();
    const frequencies = { move: 310, capture: 180, success: 620, error: 120 };
    osc.frequency.value = frequencies[kind]; gain.gain.setValueAtTime(.05, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .13);
    osc.connect(gain).connect(audioContext.destination); osc.start(); osc.stop(audioContext.currentTime + .14);
  } catch { /* audio is optional */ }
}

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

// Opening lab
let activeOpening = 0, openingStep = 0, openingGame = new ChessGame();
function selectOpening(index) { activeOpening = index; openingStep = 0; openingGame = new ChessGame(); renderOpenings(); }
function renderOpenings() {
  const opening = openings[activeOpening];
  $("#openingMenu").innerHTML = openings.map((item, i) => `<button class="opening-choice ${i === activeOpening ? "active" : ""}" data-opening="${i}"><strong>${item.name}</strong><small>${item.level}</small></button>`).join("");
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
$("#openingPrev").addEventListener("click", () => { if (!openingStep) return; openingStep -= 1; openingGame = new ChessGame(); for (let i = 0; i < openingStep; i += 1) { const code = openings[activeOpening].moves[i]; openingGame.move(code.slice(0,2), code.slice(2,4)); } renderOpenings(); });
$("#openingReset").addEventListener("click", () => selectOpening(activeOpening));

// Challenge arcade
let challengeMode = "puzzles", puzzleIndex = 0, puzzleGame = new ChessGame(puzzles[0].fen), puzzleSelected = null, puzzleLegal = [];
let knightIndex = squareToIndex("b1"), knightTarget = squareToIndex("e5"), knightMovesLeft = 3, coordinateTarget = "e4", valuePiece = "N";

function setChallengeMode(mode) {
  challengeMode = mode; $$("#challengeTabs button").forEach(button => button.classList.toggle("active", button.dataset.mode === mode));
  $("#nextChallenge").style.display = mode === "puzzles" ? "block" : "none";
  resetChallenge();
}

function resetChallenge() {
  puzzleSelected = null; puzzleLegal = [];
  if (challengeMode === "puzzles") puzzleGame = new ChessGame(puzzles[puzzleIndex].fen);
  if (challengeMode === "knight") { knightIndex = squareToIndex("b1"); knightTarget = squareToIndex("e5"); knightMovesLeft = 3; }
  if (challengeMode === "coordinates") coordinateTarget = randomSquare();
  if (challengeMode === "values") valuePiece = ["P","N","B","R","Q"][Math.floor(Math.random()*5)];
  feedback("🧠", "Take your time.", challengeMode === "puzzles" ? "Look for checks, captures, and threats—in that order." : "Every attempt trains your board vision."); renderChallenge();
}

function renderChallenge() {
  const board = Array(64).fill(null);
  if (challengeMode === "puzzles") {
    const puzzle = puzzles[puzzleIndex];
    $("#challengeKicker").textContent = `PUZZLE ${puzzleIndex + 1} OF ${puzzles.length}`; $("#challengePrompt").textContent = puzzle.prompt; $("#challengeTimer").textContent = "∞";
    renderBoard($("#challengeBoard"), puzzleGame.board, { selected: puzzleSelected, legal: puzzleLegal, lastMove: puzzleGame.lastMove, onClick: puzzleClick });
    $("#challengeContent").innerHTML = `<span class="eyebrow">TACTIC SET</span><div class="puzzle-list">${puzzles.map((p,i)=>`<button class="puzzle-choice ${i===puzzleIndex?"active":""}" data-puzzle="${i}"><span>${p.name}</span><b>${state.puzzles.includes(i)?"✓":"${i+1}"}</b></button>`).join("")}</div><button class="action wide" id="puzzleHint" style="margin-top:12px">💡 Give me a clue</button>`;
    $$('[data-puzzle]').forEach(button => button.addEventListener("click", () => { puzzleIndex = Number(button.dataset.puzzle); resetChallenge(); }));
    $("#puzzleHint").addEventListener("click", () => feedback("💡", "Clue", puzzle.hint));
  } else if (challengeMode === "knight") {
    board[knightIndex] = "N";
    $("#challengeKicker").textContent = "KNIGHT QUEST"; $("#challengePrompt").textContent = "Reach the star before you run out of jumps."; $("#challengeTimer").textContent = `${knightMovesLeft} jumps`;
    renderBoard($("#challengeBoard"), board, { target: knightTarget, onClick: knightClick });
    $("#challengeContent").innerHTML = `<span class="eyebrow">YOUR MISSION</span><h2>Land on ${indexToSquare(knightTarget)}</h2><p>The knight moves two squares in one direction and one sideways. Plan a short route.</p><div class="mini-stat"><span>Start</span><b>b1</b></div><div class="mini-stat"><span>Moves left</span><b>${knightMovesLeft}</b></div><button class="action wide" id="resetKnight" style="margin-top:15px">↻ Restart route</button>`;
    $("#resetKnight").addEventListener("click", resetChallenge);
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
      if (correct) {
        puzzleGame.move(move.from, move.to); sound("success"); feedback("🏆", "Pattern found!", "Excellent. You found the forcing move before the opponent could escape.");
        if (!state.puzzles.includes(puzzleIndex)) { state.puzzles.push(puzzleIndex); awardXP(30, "Puzzle solved"); celebrate(); }
      } else { sound("error"); feedback("↶", "Good try—look again", puzzles[puzzleIndex].hint); }
      puzzleSelected = null; puzzleLegal = []; renderChallenge(); return;
    }
  }
  if (piece && colorOf(piece) === "w") { puzzleSelected = index; puzzleLegal = puzzleGame.moves(index); sound("move"); renderChallenge(); }
}

function knightClick(index) {
  const fromRow = Math.floor(knightIndex / 8), fromCol = knightIndex % 8, row = Math.floor(index / 8), col = index % 8;
  const legal = [[1,2],[2,1]].some(([a,b]) => (Math.abs(row-fromRow)===a && Math.abs(col-fromCol)===b) || (Math.abs(row-fromRow)===b && Math.abs(col-fromCol)===a));
  if (!legal) { sound("error"); feedback("♞", "That's not an L", "Move two squares in one direction, then one square sideways."); return; }
  knightIndex = index; knightMovesLeft -= 1; sound("move");
  if (knightIndex === knightTarget) { awardXP(20, "Knight Quest complete"); celebrate(); sound("success"); feedback("⭐", "Perfect landing!", "You planned a multi-move knight route. That skill helps you spot forks."); knightMovesLeft = 0; }
  else if (knightMovesLeft <= 0) { sound("error"); feedback("↻", "So close!", "Restart and try a different first jump. Work backward from the star if you're stuck."); }
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
$("#nextChallenge").addEventListener("click", () => { puzzleIndex = (puzzleIndex + 1) % puzzles.length; resetChallenge(); });

loadProgress(); renderPlay(); renderLessons(); renderOpenings(); renderChallenge();
