/* ==========================================================================
   THE CYBER ARENA - GAME ENGINE & AUDIO SYSTEM
   ========================================================================== */

const WIN_TARGET = 10;
const choices = ["rock", "paper", "scissors"];
const imageFiles = {
  rock: "stone.png",
  paper: "paper.png",
  scissors: "scissors.png"
};
const emoji = { rock: "✊", paper: "✋", scissors: "✌️" };
const labels = { rock: "Rock", paper: "Paper", scissors: "Scissors" };

// Game State
let playerScore = 0;
let computerScore = 0;
let round = 1;
let currentStreak = 0;
let matchOver = false;
let soundEnabled = true;

// DOM Elements
const playerScoreEl = document.getElementById("player-score");
const computerScoreEl = document.getElementById("computer-score");
const playerProgressEl = document.getElementById("player-progress");
const cpuProgressEl = document.getElementById("cpu-progress");
const roundEl = document.getElementById("round-number");
const streakCountEl = document.getElementById("streak-count");
const playerChoiceEl = document.getElementById("player-choice");
const computerChoiceEl = document.getElementById("computer-choice");
const playerCaption = document.getElementById("player-caption");
const computerCaption = document.getElementById("computer-caption");
const resultBanner = document.getElementById("result-banner");
const resultText = document.getElementById("result-text");
const resultIcon = document.getElementById("result-icon");
const matchStatus = document.getElementById("match-status");
const choiceButtons = document.querySelectorAll(".choice-button");
const resetButton = document.getElementById("reset-button");

// Controls Elements
const themeBtn = document.getElementById("theme-btn");
const themeLabel = document.getElementById("theme-label");
const themeIcon = document.getElementById("theme-icon");
const soundBtn = document.getElementById("sound-btn");
const soundIcon = document.getElementById("sound-icon");

// ==========================================================================
// Web Audio Synthesizer (Zero External Audio Files Needed)
// ==========================================================================
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, type = "sine", duration = 0.15, gainVal = 0.08) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio context safe fallback
  }
}

function playSound(effect) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (effect === "click") {
    playTone(520, "sine", 0.08, 0.05);
  } else if (effect === "win") {
    // High cheerful two-tone
    playTone(587.33, "triangle", 0.12, 0.1); // D5
    setTimeout(() => playTone(880, "triangle", 0.22, 0.1), 100); // A5
  } else if (effect === "lose") {
    // Low descending tone
    playTone(330, "sawtooth", 0.12, 0.06);
    setTimeout(() => playTone(220, "sawtooth", 0.25, 0.06), 110);
  } else if (effect === "tie") {
    playTone(440, "sine", 0.15, 0.06);
  } else if (effect === "match-win") {
    // Victory fanfare
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      setTimeout(() => playTone(f, "triangle", 0.28, 0.12), i * 110);
    });
  } else if (effect === "match-lose") {
    const notes = [440, 392, 349.23, 293.66];
    notes.forEach((f, i) => {
      setTimeout(() => playTone(f, "sawtooth", 0.25, 0.08), i * 140);
    });
  }
}

// ==========================================================================
// Theme Manager
// ==========================================================================
const themes = [
  { id: "cyber", name: "Cyber Neon", icon: "⚡" },
  { id: "space", name: "Deep Space", icon: "🌌" },
  { id: "sunset", name: "Sunset Retro", icon: "🌅" },
  { id: "matrix", name: "Matrix Code", icon: "🍃" }
];
let currentThemeIdx = 0;

function applyTheme(themeId) {
  document.documentElement.setAttribute("data-theme", themeId);
  const themeObj = themes.find(t => t.id === themeId) || themes[0];
  currentThemeIdx = themes.indexOf(themeObj);
  themeLabel.textContent = themeObj.name;
  themeIcon.textContent = themeObj.icon;
  localStorage.setItem("rps_theme", themeId);
}

function cycleTheme() {
  currentThemeIdx = (currentThemeIdx + 1) % themes.length;
  applyTheme(themes[currentThemeIdx].id);
  playSound("click");
}

// Sound toggle
function toggleSound() {
  soundEnabled = !soundEnabled;
  soundIcon.textContent = soundEnabled ? "🔊" : "🔇";
  localStorage.setItem("rps_sound", soundEnabled ? "on" : "off");
  if (soundEnabled) playSound("click");
}

// ==========================================================================
// Game Engine
// ==========================================================================
function randomChoice() {
  return choices[Math.floor(Math.random() * choices.length)];
}

function getRoundResult(player, computer) {
  if (player === computer) return "tie";
  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "stone" || player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) {
    return "win";
  }
  return "lose";
}

function showChoice(container, choice) {
  container.innerHTML = "";
  const img = document.createElement("img");
  img.src = imageFiles[choice];
  img.alt = labels[choice];
  img.onerror = () => {
    container.innerHTML = `<span class="question-mark" aria-label="${labels[choice]}">${emoji[choice]}</span>`;
  };
  container.appendChild(img);
  container.classList.remove("pulse-choice");
  void container.offsetWidth; // Trigger reflow
  container.classList.add("pulse-choice");
}

function updateScoreboard() {
  playerScoreEl.textContent = playerScore;
  computerScoreEl.textContent = computerScore;

  // Animate score bump
  playerScoreEl.classList.remove("score-pop");
  computerScoreEl.classList.remove("score-pop");
  void playerScoreEl.offsetWidth;

  // Update progress bars
  const playerPercent = Math.min(100, (playerScore / WIN_TARGET) * 100);
  const cpuPercent = Math.min(100, (computerScore / WIN_TARGET) * 100);
  playerProgressEl.style.width = `${playerPercent}%`;
  cpuProgressEl.style.width = `${cpuPercent}%`;

  roundEl.textContent = round;
  streakCountEl.textContent = currentStreak;
}

function setResult(message, type = "", icon = "⚡") {
  resultBanner.className = `result-banner ${type}`.trim();
  resultText.textContent = message;
  resultIcon.textContent = icon;
}

function finishMatch() {
  matchOver = true;
  choiceButtons.forEach(button => button.disabled = true);

  if (playerScore === WIN_TARGET) {
    setResult("🏆 VICTORY! You dominated the Arena and claimed the championship!", "win", "👑");
    matchStatus.textContent = "Grand Champion! Click 'Reset Match' to defend your title.";
    playSound("match-win");
    triggerConfetti();
  } else {
    setResult("💀 DEFEAT! The AI Bot reached 10 wins. Train hard and strike back!", "lose", "🤖");
    matchStatus.textContent = "Match completed. Click 'Reset Match' for a revenge duel.";
    playSound("match-lose");
  }
}

function play(playerChoice) {
  if (matchOver) return;

  const computerChoice = randomChoice();
  const outcome = getRoundResult(playerChoice, computerChoice);

  showChoice(playerChoiceEl, playerChoice);
  showChoice(computerChoiceEl, computerChoice);

  playerCaption.textContent = `You selected ${labels[playerChoice]}`;
  computerCaption.textContent = `Bot selected ${labels[computerChoice]}`;

  // Reset highlight classes
  playerChoiceEl.classList.remove("winner", "loser", "tie-round");
  computerChoiceEl.classList.remove("winner", "loser", "tie-round");

  if (outcome === "win") {
    playerScore++;
    currentStreak++;
    playerScoreEl.classList.add("score-pop");
    playerChoiceEl.classList.add("winner");
    computerChoiceEl.classList.add("loser");
    setResult(`Round Victory! Your ${labels[playerChoice]} pulverizes ${labels[computerChoice]}!`, "win", "✨");
    playSound("win");
  } else if (outcome === "lose") {
    computerScore++;
    currentStreak = 0;
    computerScoreEl.classList.add("score-pop");
    playerChoiceEl.classList.add("loser");
    computerChoiceEl.classList.add("winner");
    setResult(`Round Defeat! Bot's ${labels[computerChoice]} overpowered your ${labels[playerChoice]}.`, "lose", "💥");
    playSound("lose");
  } else {
    playerChoiceEl.classList.add("tie-round");
    computerChoiceEl.classList.add("tie-round");
    setResult(`Stand-off! Both combatants picked ${labels[playerChoice]}. No points awarded.`, "tie", "⚖️");
    playSound("tie");
  }

  updateScoreboard();

  if (playerScore === WIN_TARGET || computerScore === WIN_TARGET) {
    finishMatch();
  } else {
    round++;
    roundEl.textContent = round;
    matchStatus.textContent = outcome === "tie"
      ? "Deadlock! Ready for the next clash."
      : "Score registered! Pick your next weapon.";
  }
}

function resetMatch() {
  playerScore = 0;
  computerScore = 0;
  round = 1;
  currentStreak = 0;
  matchOver = false;

  updateScoreboard();
  choiceButtons.forEach(button => button.disabled = false);

  playerChoiceEl.className = "fighter-choice";
  computerChoiceEl.className = "fighter-choice";
  playerChoiceEl.innerHTML = '<span class="question-mark">?</span>';
  computerChoiceEl.innerHTML = '<span class="question-mark">?</span>';

  playerCaption.textContent = "Select weapon";
  computerCaption.textContent = "Awaiting move";

  setResult("Select Rock, Paper, or Scissors below to start!", "", "⚡");
  matchStatus.textContent = "Fresh duel initiated. May the best fighter win!";
  playSound("click");
}

// Simple Celebratory Confetti Particle Burst
function triggerConfetti() {
  const count = 40;
  const colors = ["#00f0ff", "#b026ff", "#00ff9d", "#ffb703", "#ff2a85"];
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.style.position = "fixed";
    p.style.zIndex = "9999";
    p.style.width = `${Math.random() * 8 + 6}px`;
    p.style.height = `${Math.random() * 8 + 6}px`;
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    p.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    p.style.left = "50%";
    p.style.top = "40%";
    p.style.pointerEvents = "none";
    p.style.transition = "all 1s cubic-bezier(0.25, 1, 0.5, 1)";
    document.body.appendChild(p);

    const destX = (Math.random() - 0.5) * window.innerWidth * 0.9;
    const destY = (Math.random() - 0.5) * window.innerHeight * 0.9;
    const rot = Math.random() * 720;

    requestAnimationFrame(() => {
      p.style.transform = `translate(${destX}px, ${destY}px) rotate(${rot}deg)`;
      p.style.opacity = "0";
    });

    setTimeout(() => p.remove(), 1100);
  }
}

// ==========================================================================
// Initialization & Event Listeners
// ==========================================================================
themeBtn.addEventListener("click", cycleTheme);
soundBtn.addEventListener("click", toggleSound);
resetButton.addEventListener("click", resetMatch);

choiceButtons.forEach(button => {
  button.addEventListener("click", () => {
    play(button.dataset.choice);
  });
});

// Restore saved settings
const savedTheme = localStorage.getItem("rps_theme");
if (savedTheme && themes.some(t => t.id === savedTheme)) {
  applyTheme(savedTheme);
} else {
  applyTheme("cyber");
}

const savedSound = localStorage.getItem("rps_sound");
if (savedSound === "off") {
  soundEnabled = false;
  soundIcon.textContent = "🔇";
}
