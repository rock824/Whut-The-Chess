// Coach Whit: additive UI, no personal photos or private assets in this repository.
const tips = [
  "Before moving, check whether your king is safe.",
  "Look for checks, captures, and threats in that order.",
  "Knights love central squares. Try bringing yours closer to the action.",
  "Develop your pieces before sending your queen on an adventure.",
  "When you find a good move, look for an even better one.",
  "In the endgame, your king can become an active teammate."
];
const coach = document.createElement("aside");
coach.className = "whit-coach";
coach.setAttribute("aria-label", "Coach Whit");
coach.innerHTML = `<div class="whit-coach-avatar" aria-hidden="true">♞</div><div class="whit-coach-copy"><strong>Coach Whit</strong><p id="whit-coach-tip">Ready to level up? Let's play smart chess!</p><div class="whit-coach-actions"><button type="button" id="whit-coach-hint">Coach tip</button><button type="button" id="whit-coach-toasty">Toasty! 🎉</button></div></div>`;
const overlay = document.createElement("div");
overlay.className = "whit-toasty";
overlay.setAttribute("aria-hidden", "true");
overlay.innerHTML = `<div class="whit-toasty-figure"><span class="whit-toasty-placeholder">😎</span></div><span class="whit-toasty-caption">TOASTY!</span>`;
document.body.append(coach, overlay);
document.getElementById("whit-coach-hint").addEventListener("click", () => {
  const tip = document.getElementById("whit-coach-tip");
  tip.textContent = tips[Math.floor(Math.random() * tips.length)];
});
let toastyTimer;
function showToasty() {
  clearTimeout(toastyTimer);
  overlay.classList.remove("whit-toasty-active");
  void overlay.offsetWidth;
  overlay.classList.add("whit-toasty-active");
  toastyTimer = setTimeout(() => overlay.classList.remove("whit-toasty-active"), 1450);
}
document.getElementById("whit-coach-toasty").addEventListener("click", showToasty);
// Future integration: dispatch 'whit:toasty' only after exceptional achievements.
document.addEventListener("whit:toasty", showToasty);

// Original pop-culture-inspired reaction lines; no third-party audio or artwork.
const whitReactions = Object.freeze({
  checkmate: [{line:"Game over, chess champion!",symbol:"🏆"},{line:"That's how the cookie crumbles!",symbol:"🍪"}],
  brilliant: [{line:"Maximum brain power!",symbol:"⚡"},{line:"Legendary move unlocked!",symbol:"🌟"}],
  blunder: [{line:"Plot twist! We can recover.",symbol:"😬"},{line:"Well, that escalated quickly.",symbol:"🎬"}],
  promotion: [{line:"Behold the royal upgrade!",symbol:"👑"}],
  fork: [{line:"Double trouble!",symbol:"🍴"}],
  streak: [{line:"Combo streak! Keep it rolling!",symbol:"🔥"}],
  puzzle: [{line:"Achievement unlocked: big brain!",symbol:"🧠"}]
});
let lastReactionAt = 0;
document.addEventListener("whit:reaction", event => {
  const type = event.detail?.type;
  const options = Object.prototype.hasOwnProperty.call(whitReactions,type) ? whitReactions[type] : null;
  if (!options || Date.now()-lastReactionAt < 8000) return;
  lastReactionAt = Date.now();
  const pick = options[Math.floor(Math.random()*options.length)];
  document.getElementById("whit-coach-tip").textContent = pick.symbol+" "+pick.line;
  coach.classList.remove("whit-coach-celebrate");
  void coach.offsetWidth;
  coach.classList.add("whit-coach-celebrate");
  if (type === "checkmate" && Math.random() < .25) showToasty();
});
