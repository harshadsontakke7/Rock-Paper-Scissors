const WIN_TARGET = 10;
const choices = ["rock", "paper", "scissors"];
const imageFiles = {
  rock: "stone.png",
  paper: "paper.png",
  scissors: "scissors.png"
};
const emoji = { rock: "✊", paper: "✋", scissors: "✌️" };
const labels = { rock: "Rock", paper: "Paper", scissors: "Scissors" };

let playerScore = 0;
let computerScore = 0;
let round = 1;
let matchOver = false;

const playerScoreEl = document.getElementById("player-score");
const computerScoreEl = document.getElementById("computer-score");
const roundEl = document.getElementById("round-number");
const playerChoiceEl = document.getElementById("player-choice");
const computerChoiceEl = document.getElementById("computer-choice");
const playerCaption = document.getElementById("player-caption");
const computerCaption = document.getElementById("computer-caption");
const resultBanner = document.getElementById("result-banner");
const resultText = document.getElementById("result-text");
const matchStatus = document.getElementById("match-status");
const choiceButtons = document.querySelectorAll(".choice-button");

function randomChoice() {
  return choices[Math.floor(Math.random() * choices.length)];
}

function getRoundResult(player, computer) {
  if (player === computer) return "tie";
  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) return "win";
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
  container.classList.remove("pulse");
  void container.offsetWidth;
  container.classList.add("pulse");
}

function updateScoreboard() {
  playerScoreEl.textContent = playerScore;
  computerScoreEl.textContent = computerScore;
  roundEl.textContent = round;
}

function setResult(message, type = "") {
  resultBanner.className = `result-banner ${type}`.trim();
  resultText.textContent = message;
}

function finishMatch() {
  matchOver = true;
  choiceButtons.forEach(button => button.disabled = true);

  if (playerScore === WIN_TARGET) {
    setResult("🏆 You are the champion! You won the match!", "win");
    matchStatus.textContent = "Victory! Restart to play again.";
  } else {
    setResult("The computer wins this match. Better luck next time!", "lose");
    matchStatus.textContent = "Match complete. Restart for a rematch.";
  }
}

function play(playerChoice) {
  if (matchOver) return;

  const computerChoice = randomChoice();
  const outcome = getRoundResult(playerChoice, computerChoice);

  showChoice(playerChoiceEl, playerChoice);
  showChoice(computerChoiceEl, computerChoice);
  playerCaption.textContent = `You picked ${labels[playerChoice]}`;
  computerCaption.textContent = `Computer picked ${labels[computerChoice]}`;

  if (outcome === "win") {
    playerScore++;
    setResult(`You win this round! ${labels[playerChoice]} beats ${labels[computerChoice]}.`, "win");
  } else if (outcome === "lose") {
    computerScore++;
    setResult(`Computer wins this round! ${labels[computerChoice]} beats ${labels[playerChoice]}.`, "lose");
  } else {
    setResult(`It's a tie! You both picked ${labels[playerChoice]}.`, "tie");
  }

  updateScoreboard();

  if (playerScore === WIN_TARGET || computerScore === WIN_TARGET) {
    finishMatch();
  } else {
    round++;
    roundEl.textContent = round;
    matchStatus.textContent = outcome === "tie"
      ? "No points this round. Try again!"
      : "Choose your next move!";
  }
}

function resetMatch() {
  playerScore = 0;
  computerScore = 0;
  round = 1;
  matchOver = false;
  updateScoreboard();
  choiceButtons.forEach(button => button.disabled = false);
  playerChoiceEl.innerHTML = '<span class="question-mark">?</span>';
  computerChoiceEl.innerHTML = '<span class="question-mark">?</span>';
  playerCaption.textContent = "Waiting for your move";
  computerCaption.textContent = "Ready to play";
  setResult("Pick a move to start the match!");
  matchStatus.textContent = "Choose a move. Good luck!";
}

choiceButtons.forEach(button => {
  button.addEventListener("click", () => play(button.dataset.choice));
});

document.getElementById("reset-button").addEventListener("click", resetMatch);
