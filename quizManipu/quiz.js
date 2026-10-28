const $ = (id) => document.getElementById(id);

let questions = [];
let current = 0;
let score = 0;
let answered = false;
let selectedAnswers = new Set();

const circumference = 326.7;

function optionLabel(index) {
  return index < 26 ? String.fromCharCode(65 + index) : String(index + 1);
}

function correctIndices(item) {
  return Array.isArray(item.correct) ? item.correct : [item.correct];
}

function renderQuestion() {
  answered = false;
  selectedAnswers = new Set();

  const item = questions[current];
  const isMultiSelect = Array.isArray(item.correct);

  $("counter").textContent = `Spørsmål ${current + 1} av ${questions.length}`;
  $("scoreChip").textContent = `${score} poeng`;
  $("question").textContent = item.q;
  $("progress").style.width = `${((current + 1) / questions.length) * 100}%`;
  $("feedback").textContent = "";

  $("nextBtn").disabled = isMultiSelect;
  $("nextBtn").textContent = isMultiSelect
    ? "Sjekk svar"
    : current === questions.length - 1
      ? "Se resultat"
      : "Neste";

  const options = $("options");
  options.replaceChildren();

  item.opts.forEach((text, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option";

    const key = document.createElement("span");
    key.className = "key";
    key.textContent = optionLabel(index);

    const answer = document.createElement("span");
    answer.textContent = text;

    const mark = document.createElement("span");
    mark.className = "mark";

    button.append(key, answer, mark);
    button.addEventListener("click", () => selectAnswer(index));
    options.append(button);
  });
}

function selectAnswer(selectedIndex) {
  if (answered) return;

  const item = questions[current];
  const isMultiSelect = Array.isArray(item.correct);
  const buttons = $("options").querySelectorAll(".option");

  if (isMultiSelect) {
    if (selectedAnswers.has(selectedIndex)) {
      selectedAnswers.delete(selectedIndex);
      buttons[selectedIndex].classList.remove("selected");
    } else {
      selectedAnswers.add(selectedIndex);
      buttons[selectedIndex].classList.add("selected");
    }

    $("nextBtn").disabled = selectedAnswers.size === 0;
    return;
  }

  selectedAnswers = new Set([selectedIndex]);
  checkAnswer();
}

function checkAnswer() {
  if (answered || selectedAnswers.size === 0) return;

  answered = true;

  const item = questions[current];
  const correct = correctIndices(item);
  const buttons = $("options").querySelectorAll(".option");

  const isCorrect =
    selectedAnswers.size === correct.length &&
    correct.every((index) => selectedAnswers.has(index));

  const isMultiSelect = Array.isArray(item.correct);

buttons.forEach((button, index) => {
  button.disabled = true;

  if (correct.includes(index) && selectedAnswers.has(index)) {
    button.classList.add("correct");
    button.querySelector(".mark").textContent = "✓";
  } else if (correct.includes(index) && isMultiSelect) {
    button.classList.add("missed");
    button.querySelector(".mark").textContent = "!";
  } else if (selectedAnswers.has(index)) {
    button.classList.add("wrong");
    button.querySelector(".mark").textContent = "✕";
  } else if (correct.includes(index)) {
    button.classList.add("correct");
    button.querySelector(".mark").textContent = "✓";
  }
});

  if (isCorrect) {
    score++;
  }

  $("scoreChip").textContent = `${score} poeng`;

  const explanation = isCorrect
    ? item.explanation
    : item.incorrectExplanation || item.explanation;

  $("feedback").textContent =
    `${isCorrect ? "Riktig!" : "Ikke helt."} ${explanation || ""}`;

  $("nextBtn").disabled = false;
  $("nextBtn").textContent =
    current === questions.length - 1 ? "Se resultat" : "Neste";
}

function showResults() {
  $("quiz").hidden = true;
  $("results").hidden = false;

  const percentage = Math.round((score / questions.length) * 100);
  $("resultPct").textContent = `${percentage}%`;
  $("resultSub").textContent =
    `Du fikk ${score} av ${questions.length} riktige.`;

  $("resultTitle").textContent =
    percentage === 100 ? "Perfekt!" :
    percentage >= 60 ? "Bra jobbet!" :
    "Prøv gjerne igjen!";

  $("resultRing").style.strokeDashoffset =
    String(circumference * (1 - percentage / 100));
}

function nextQuestion() {
  if (!answered) return;

  if (current < questions.length - 1) {
    current++;
    renderQuestion();
  } else {
    showResults();
  }
}

function handleNextButton() {
  const item = questions[current];

  if (Array.isArray(item.correct) && !answered) {
    checkAnswer();
  } else {
    nextQuestion();
  }
}

function restart() {
  current = 0;
  score = 0;

  $("results").hidden = true;
  $("quiz").hidden = false;
  $("resultRing").style.strokeDashoffset = String(circumference);

  renderQuestion();
}

$("nextBtn").addEventListener("click", handleNextButton);
$("restartBtn").addEventListener("click", restart);

fetch("./questions.json")
  .then((response) => {
    if (!response.ok) throw new Error("Fant ikke questions.json");
    return response.json();
  })
  .then((data) => {
    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error("JSON-filen må inneholde minst ett spørsmål.");
    }

    questions = data.questions;
    document.title = data.title || "Quiz";
    renderQuestion();
  })
  .catch((error) => {
    $("quiz").hidden = true;
    $("error").hidden = false;
    $("error").textContent = `Kunne ikke laste quizen: ${error.message}`;
  });
