/* ==========================================================================
   THE CYBER ARENA - DEEP LEARNING NEURAL AI ENGINE & AUDIO SYSTEM
   ========================================================================== */

const WIN_TARGET = 10;
const choices = ["rock", "paper", "scissors"];
const choiceIndices = { rock: 0, paper: 1, scissors: 2 };

const imageFiles = {
  rock: "stone.png",
  paper: "paper.png",
  scissors: "scissors.png"
};
const emoji = { rock: "✊", paper: "✋", scissors: "✌️" };
const labels = { rock: "Rock", paper: "Paper", scissors: "Scissors" };

// Counter moves: what beats what
const counters = {
  rock: "paper",      // Paper covers Rock
  paper: "scissors",  // Scissors cut Paper
  scissors: "rock"    // Rock crushes Scissors
};

// What loses to what
const losesTo = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper"
};

// ==========================================================================
// 1. Online Deep Learning Neural Network (Multi-Layer Perceptron)
// ==========================================================================
class NeuralNetwork {
  constructor(inputNodes = 15, hiddenNodes = 16, outputNodes = 3, lr = 0.09) {
    this.inputNodes = inputNodes;
    this.hiddenNodes = hiddenNodes;
    this.outputNodes = outputNodes;
    this.lr = lr;
    this.totalUpdates = 0;

    // Xavier/He weight initialization
    this.wih = Array.from({ length: this.hiddenNodes }, () =>
      Array.from({ length: this.inputNodes }, () => (Math.random() * 2 - 1) * Math.sqrt(2 / this.inputNodes))
    );
    this.bh = Array(this.hiddenNodes).fill(0.01);

    this.who = Array.from({ length: this.outputNodes }, () =>
      Array.from({ length: this.hiddenNodes }, () => (Math.random() * 2 - 1) * Math.sqrt(2 / this.hiddenNodes))
    );
    this.bo = Array(this.outputNodes).fill(0.01);
  }

  // LeakyReLU activation
  relu(x) { return x > 0 ? x : 0.05 * x; }
  reluDeriv(x) { return x > 0 ? 1 : 0.05; }

  // Softmax probability distribution
  softmax(arr) {
    const maxVal = Math.max(...arr);
    const exps = arr.map(v => Math.exp(Math.min(20, Math.max(-20, v - maxVal))));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    return exps.map(v => v / (sumExps || 1));
  }

  forward(inputs) {
    this.lastInputs = inputs.slice();
    this.hiddenZ = [];
    this.hiddenOut = [];

    // Hidden layer
    for (let h = 0; h < this.hiddenNodes; h++) {
      let sum = this.bh[h];
      for (let i = 0; i < this.inputNodes; i++) {
        sum += this.wih[h][i] * inputs[i];
      }
      this.hiddenZ[h] = sum;
      this.hiddenOut[h] = this.relu(sum);
    }

    // Output layer
    this.outputZ = [];
    for (let o = 0; o < this.outputNodes; o++) {
      let sum = this.bo[o];
      for (let h = 0; h < this.hiddenNodes; h++) {
        sum += this.who[o][h] * this.hiddenOut[h];
      }
      this.outputZ[o] = sum;
    }

    this.output = this.softmax(this.outputZ);
    return this.output; // [P(rock), P(paper), P(scissors)]
  }

  // Online Backpropagation with Categorical Cross-Entropy Loss
  train(inputs, targetIndex) {
    const out = this.forward(inputs);
    this.totalUpdates++;

    // Gradient of Cross-Entropy + Softmax: dL/dz = out - target
    const outErrors = out.slice();
    outErrors[targetIndex] -= 1.0;

    // Backprop to hidden layer
    const hiddenErrors = Array(this.hiddenNodes).fill(0);
    for (let h = 0; h < this.hiddenNodes; h++) {
      let errSum = 0;
      for (let o = 0; o < this.outputNodes; o++) {
        errSum += outErrors[o] * this.who[o][h];
      }
      hiddenErrors[h] = errSum * this.reluDeriv(this.hiddenZ[h]);
    }

    // Update weights and biases: Output layer
    for (let o = 0; o < this.outputNodes; o++) {
      this.bo[o] -= this.lr * outErrors[o];
      for (let h = 0; h < this.hiddenNodes; h++) {
        this.who[o][h] -= this.lr * outErrors[o] * this.hiddenOut[h];
      }
    }

    // Update weights and biases: Hidden layer
    for (let h = 0; h < this.hiddenNodes; h++) {
      this.bh[h] -= this.lr * hiddenErrors[h];
      for (let i = 0; i < this.inputNodes; i++) {
        this.wih[h][i] -= this.lr * hiddenErrors[h] * inputs[i];
      }
    }

    return out;
  }
}

// ==========================================================================
// 2. Ensemble AI System (Neural Net + N-gram Markov + Psychological WSLS)
// ==========================================================================
class RockPaperScissorsAI {
  constructor() {
    this.nn = new NeuralNetwork(15, 16, 3, 0.1);
    this.history = []; // Array of { playerMove, botMove, outcome }
    this.ngrams = { 1: {}, 2: {} };
    
    // Strategy evaluation scores
    this.strategyScores = {
      neural_level0: 1,
      neural_level1: 1,
      ngram_level0: 1,
      ngram_level1: 1,
      wsls: 1
    };
    this.lastStrategyPicks = {};
  }

  // Build 15-dimensional input vector from last 2 rounds
  encodeInputs() {
    const vec = Array(15).fill(0);
    const n = this.history.length;
    if (n === 0) return vec;

    // Round t-1
    const r1 = this.history[n - 1];
    vec[choiceIndices[r1.playerMove]] = 1;
    vec[3 + choiceIndices[r1.botMove]] = 1;
    const outcomeIdx = r1.outcome === "win" ? 0 : r1.outcome === "lose" ? 1 : 2;
    vec[6 + outcomeIdx] = 1;

    // Round t-2
    if (n >= 2) {
      const r2 = this.history[n - 2];
      vec[9 + choiceIndices[r2.playerMove]] = 1;
      vec[12 + choiceIndices[r2.botMove]] = 1;
    }

    return vec;
  }

  // Psychological Win-Stay, Lose-Shift Predictor
  predictWSLS() {
    if (this.history.length === 0) return "rock";
    const last = this.history[this.history.length - 1];
    
    // Human won -> often stays with winning move or plays what beats bot's counter
    if (last.outcome === "win") {
      return Math.random() < 0.65 ? last.playerMove : counters[last.playerMove];
    }
    // Human lost -> shifts away from losing move, often to counter bot's winning move
    if (last.outcome === "lose") {
      return counters[last.botMove];
    }
    // Tie -> shifts to counter the tied move
    return counters[last.playerMove];
  }

  // Markov N-gram Predictor
  predictNGram() {
    const n = this.history.length;
    if (n >= 2) {
      const key2 = `${this.history[n-2].playerMove[0]}${this.history[n-2].botMove[0]}_${this.history[n-1].playerMove[0]}${this.history[n-1].botMove[0]}`;
      if (this.ngrams[2][key2]) {
        return this.getBestMoveFromCounts(this.ngrams[2][key2]);
      }
    }
    if (n >= 1) {
      const key1 = `${this.history[n-1].playerMove[0]}${this.history[n-1].botMove[0]}`;
      if (this.ngrams[1][key1]) {
        return this.getBestMoveFromCounts(this.ngrams[1][key1]);
      }
    }
    return choices[Math.floor(Math.random() * 3)];
  }

  getBestMoveFromCounts(counts) {
    let best = "rock";
    let max = -1;
    for (const c of choices) {
      if ((counts[c] || 0) > max) {
        max = counts[c] || 0;
        best = c;
      }
    }
    return best;
  }

  // Generate bot decision with confidence and telemetry
  decide() {
    const inputs = this.encodeInputs();
    const nnProbs = this.nn.forward(inputs);

    // Neural prediction
    let nnMaxIdx = 0;
    for (let i = 1; i < 3; i++) {
      if (nnProbs[i] > nnProbs[nnMaxIdx]) nnMaxIdx = i;
    }
    const nnPredictedPlayerMove = choices[nnMaxIdx];
    const nnConfidence = nnProbs[nnMaxIdx];

    const ngramPredicted = this.predictNGram();
    const wslsPredicted = this.predictWSLS();

    // Strategies available
    const candidates = {
      neural_level0: counters[nnPredictedPlayerMove],
      neural_level1: counters[counters[nnPredictedPlayerMove]], // anticipates player counter
      ngram_level0: counters[ngramPredicted],
      ngram_level1: counters[counters[ngramPredicted]],
      wsls: counters[wslsPredicted]
    };
    this.lastStrategyPicks = candidates;

    // Pick strategy with highest historic score, with soft exploration in early rounds
    let bestStrat = "neural_level0";
    let highestScore = -Infinity;
    for (const strat in candidates) {
      const noise = (Math.random() - 0.5) * (this.history.length < 3 ? 1.5 : 0.3);
      const score = this.strategyScores[strat] + noise;
      if (score > highestScore) {
        highestScore = score;
        bestStrat = strat;
      }
    }

    const botMove = candidates[bestStrat];
    const confidencePct = Math.round(Math.max(45, Math.min(96, (nnConfidence * 100) + (this.history.length * 2))));

    let patternInsight = "Analyzing initial player entropy...";
    if (this.history.length >= 1) {
      if (bestStrat.startsWith("neural")) {
        patternInsight = `Neural Net weights lock on ${labels[nnPredictedPlayerMove]}`;
      } else if (bestStrat.startsWith("ngram")) {
        patternInsight = `N-Gram sequence recurrence detected`;
      } else {
        patternInsight = `Win-Stay/Lose-Shift psychological pattern`;
      }
    }

    return {
      botMove,
      predictedPlayerMove: nnPredictedPlayerMove,
      confidence: confidencePct,
      patternInsight,
      totalUpdates: this.nn.totalUpdates
    };
  }

  // Learn from the completed round
  learn(playerMove, botMove, outcome) {
    const inputs = this.encodeInputs();
    const playerTargetIdx = choiceIndices[playerMove];

    // 1. Train the Neural Network via backprop
    this.nn.train(inputs, playerTargetIdx);

    // 2. Update N-Gram tables
    const n = this.history.length;
    if (n >= 1) {
      const key1 = `${this.history[n-1].playerMove[0]}${this.history[n-1].botMove[0]}`;
      if (!this.ngrams[1][key1]) this.ngrams[1][key1] = { rock: 0, paper: 0, scissors: 0 };
      this.ngrams[1][key1][playerMove]++;
    }
    if (n >= 2) {
      const key2 = `${this.history[n-2].playerMove[0]}${this.history[n-2].botMove[0]}_${this.history[n-1].playerMove[0]}${this.history[n-1].botMove[0]}`;
      if (!this.ngrams[2][key2]) this.ngrams[2][key2] = { rock: 0, paper: 0, scissors: 0 };
      this.ngrams[2][key2][playerMove]++;
    }

    // 3. Reward/Penalize strategies based on whether they would have beaten the player
    for (const strat in this.lastStrategyPicks) {
      const hypotheticalPick = this.lastStrategyPicks[strat];
      if (hypotheticalPick === counters[playerMove]) {
        this.strategyScores[strat] += 1.2;
      } else if (hypotheticalPick === losesTo[playerMove]) {
        this.strategyScores[strat] -= 0.8;
      }
    }

    // 4. Save to history
    this.history.push({ playerMove, botMove, outcome });
  }

  reset() {
    this.history = [];
    this.ngrams = { 1: {}, 2: {} };
    for (const k in this.strategyScores) {
      this.strategyScores[k] = 1;
    }
  }
}

// Instantiate the AI Engine
const ai = new RockPaperScissorsAI();

// ==========================================================================
// Game State
// ==========================================================================
let playerScore = 0;
let computerScore = 0;
let round = 1;
let currentStreak = 0;
let matchOver = false;
let soundEnabled = true;
let nextDecision = null;

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

// Neural Telemetry HUD Elements
const neuralStateText = document.getElementById("neural-state-text");
const telemPrediction = document.getElementById("telem-prediction");
const confidencePctEl = document.getElementById("confidence-pct");
const confidenceFillEl = document.getElementById("confidence-fill");
const telemUpdates = document.getElementById("telem-updates");

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
    if (AudioContextClass) audioCtx = new AudioContextClass();
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
    // Audio fallback
  }
}

function playSound(effect) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (effect === "click") {
    playTone(520, "sine", 0.08, 0.05);
  } else if (effect === "win") {
    playTone(587.33, "triangle", 0.12, 0.1);
    setTimeout(() => playTone(880, "triangle", 0.22, 0.1), 100);
  } else if (effect === "lose") {
    playTone(330, "sawtooth", 0.12, 0.06);
    setTimeout(() => playTone(220, "sawtooth", 0.25, 0.06), 110);
  } else if (effect === "tie") {
    playTone(440, "sine", 0.15, 0.06);
  } else if (effect === "match-win") {
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

function toggleSound() {
  soundEnabled = !soundEnabled;
  soundIcon.textContent = soundEnabled ? "🔊" : "🔇";
  localStorage.setItem("rps_sound", soundEnabled ? "on" : "off");
  if (soundEnabled) playSound("click");
}

// ==========================================================================
// Core Game Logic & Telemetry Updating
// ==========================================================================
function refreshAIDecision() {
  nextDecision = ai.decide();
  telemPrediction.textContent = `${emoji[nextDecision.predictedPlayerMove]} ${labels[nextDecision.predictedPlayerMove]}`;
  confidencePctEl.textContent = `${nextDecision.confidence}%`;
  confidenceFillEl.style.width = `${nextDecision.confidence}%`;
  telemUpdates.textContent = `${nextDecision.totalUpdates} backprops`;
  neuralStateText.textContent = nextDecision.patternInsight;
}

function getRoundResult(player, computer) {
  if (player === computer) return "tie";
  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && (computer === "stone" || computer === "rock")) ||
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
  void container.offsetWidth;
  container.classList.add("pulse-choice");
}

function updateScoreboard() {
  playerScoreEl.textContent = playerScore;
  computerScoreEl.textContent = computerScore;

  playerScoreEl.classList.remove("score-pop");
  computerScoreEl.classList.remove("score-pop");
  void playerScoreEl.offsetWidth;

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
    setResult("🏆 VICTORY! You outsmarted the Neural AI and claimed the crown!", "win", "👑");
    matchStatus.textContent = "Grand Champion! Click 'Reset Match' to defend your title.";
    playSound("match-win");
    triggerConfetti();
  } else {
    setResult("🤖 DEFEAT! The Neural AI adapted to your patterns and reached 10 wins!", "lose", "🧠");
    matchStatus.textContent = "Match complete. Click 'Reset Match' for a revenge duel.";
    playSound("match-lose");
  }
}

function play(playerChoice) {
  if (matchOver) return;

  // If nextDecision isn't prepared, compute it now
  if (!nextDecision) refreshAIDecision();

  const computerChoice = nextDecision.botMove;
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
    setResult(`Round Defeat! Bot predicted your move with ${labels[computerChoice]}.`, "lose", "🤖");
    playSound("lose");
  } else {
    playerChoiceEl.classList.add("tie-round");
    computerChoiceEl.classList.add("tie-round");
    setResult(`Stand-off! Both combatants picked ${labels[playerChoice]}. No points awarded.`, "tie", "⚖️");
    playSound("tie");
  }

  // AI online training via backpropagation
  ai.learn(playerChoice, computerChoice, outcome);

  updateScoreboard();

  if (playerScore === WIN_TARGET || computerScore === WIN_TARGET) {
    finishMatch();
  } else {
    round++;
    roundEl.textContent = round;
    matchStatus.textContent = outcome === "tie"
      ? "Deadlock! AI recalculating neural weights..."
      : "Score registered! AI neural network adapted.";
    
    // Prepare next AI anticipation
    refreshAIDecision();
  }
}

function resetMatch() {
  playerScore = 0;
  computerScore = 0;
  round = 1;
  currentStreak = 0;
  matchOver = false;

  ai.reset();

  updateScoreboard();
  choiceButtons.forEach(button => button.disabled = false);

  playerChoiceEl.className = "fighter-choice";
  computerChoiceEl.className = "fighter-choice";
  playerChoiceEl.innerHTML = '<span class="question-mark">?</span>';
  computerChoiceEl.innerHTML = '<span class="question-mark">?</span>';

  playerCaption.textContent = "Select weapon";
  computerCaption.textContent = "Awaiting move";

  setResult("Select Rock, Paper, or Scissors below to start!", "", "⚡");
  matchStatus.textContent = "Fresh duel initiated. Neural weights reset.";
  refreshAIDecision();
  playSound("click");
}

// Celebratory Confetti Particle Burst
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

// Pre-calculate initial AI decision
refreshAIDecision();
