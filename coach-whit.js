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
const sparta = document.createElement("div");
sparta.className = "whit-sparta";
sparta.setAttribute("aria-hidden","true");
sparta.innerHTML = '<div class="whit-sparta-stage"><div class="whit-sparta-coach"><span class="whit-sparta-coach-body">🦵</span></div><span class="whit-sparta-piece">♚</span><div class="whit-sparta-hole"></div><strong class="whit-sparta-quote">THIS IS SPARTA!</strong></div>';
let spartaTimer;
function showSparta() {
  clearTimeout(spartaTimer);
  sparta.classList.remove("whit-sparta-active");
  void sparta.offsetWidth;
  sparta.classList.add("whit-sparta-active");
  spartaTimer = setTimeout(() => sparta.classList.remove("whit-sparta-active"), 2300);
}
document.addEventListener("whit:sparta", showSparta);
const overlay = document.createElement("div");
overlay.className = "whit-toasty";
overlay.setAttribute("aria-hidden", "true");
overlay.innerHTML = `<div class="whit-toasty-figure"><span class="whit-toasty-placeholder">😎</span></div><span class="whit-toasty-caption">TOASTY!</span>`;
document.body.append(coach, overlay, sparta);
document.getElementById("whit-coach-hint").addEventListener("click", () => {
  const tip = document.getElementById("whit-coach-tip");
  tip.textContent = tips[Math.floor(Math.random() * tips.length)];
  if (Math.random() < .35) showWhitReaction("hint", true);
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
// Test animation manually from the browser console: document.dispatchEvent(new Event("whit:sparta"))
// Future integration: dispatch 'whit:toasty' only after exceptional achievements.
document.addEventListener("whit:toasty", showToasty);

// User-selected pop-culture quotes, shown as text only (no licensed audio or artwork).
const whitReactions = Object.freeze({
  sparta: [{line:"THIS IS SPARTA!",symbol:"🛡️",effect:"sparta"}],
  checkmate: [{line:"Great Scott!",symbol:"⚡"},{line:"You shall not pass!!",symbol:"🧙"},{line:"THIS IS SPARTA!",symbol:"🛡️",effect:"sparta"}],
  capture: [{line:"My precious.",symbol:"💍"},{line:"Stick around.",symbol:"🎯"},{line:"Hadouken!",symbol:"💥"}],
  captureStreak: [{line:"He's on fire!",symbol:"🔥"}],
  blunder: [{line:"You're gonna need a bigger boat.",symbol:"🦈",effect:"shark"},{line:"Hold onto your butts.",symbol:"🦖"},{line:"The cake is a lie.",symbol:"🎂"}],
  promotion: [{line:"Look at me. I'm the Captain now.",symbol:"👑"},{line:"Great Scott!",symbol:"⚡"}],
  puzzle: [{line:"Wax on, wax off.",symbol:"🥋"},{line:"It's dangerous to go alone, take this.",symbol:"🗡️"},{line:"Hey! Look! Listen!",symbol:"✨"}],
  hint: [{line:"Do or do not, there is no try.",symbol:"🌌"},{line:"Hey! Look! Listen!",symbol:"✨"}],
  defeat: [{line:"I'll be back.",symbol:"🤖"},{line:"Press F to pay respects.",symbol:"🎮"}],
  brilliant: [{line:"Great Scott!",symbol:"⚡"},{line:"Exchange",symbol:"🌑"}]
});
let lastReactionAt = 0;
let reactionTimer;
function showWhitReaction(type, force = false) {
  const options = whitReactions[type];
  if (!options || (!force && Date.now() - lastReactionAt < 8000)) return;
  lastReactionAt = Date.now();
  const pick = options[Math.floor(Math.random() * options.length)];
  document.getElementById("whit-coach-tip").textContent = pick.symbol + " " + pick.line;
  coach.classList.remove("whit-coach-celebrate");
  void coach.offsetWidth;
  coach.classList.add("whit-coach-celebrate");
  if (pick.effect === "sparta") showSparta();
  if (pick.effect === "shark") {
    overlay.querySelector(".whit-toasty-placeholder").textContent = "😱";
    overlay.querySelector(".whit-toasty-caption").textContent = "🦈";
    overlay.classList.add("whit-shark");
    showToasty();
    clearTimeout(reactionTimer);
    reactionTimer = setTimeout(() => {
      overlay.classList.remove("whit-shark");
      overlay.querySelector(".whit-toasty-placeholder").textContent = "😎";
      overlay.querySelector(".whit-toasty-caption").textContent = "TOASTY!";
    }, 1500);
  } else if (type === "checkmate" && Math.random() < .25) showToasty();
}
document.addEventListener("whit:reaction", event => showWhitReaction(event.detail?.type));
