const $ = (id) => document.getElementById(id);

let questions = [];
let current = 0;
let score = 0;
let answered = false;

const circumference = 326.7;

function optionLabel(index) {
  return index < 26 ? String.fromCharCode(65 + index) : String(index + 1);
}

function renderQuestion() {
  answered = false;

  const item = questions[current];
  $("counter").textContent = `Spørsmål ${current + 1} av ${questions.length}`;
  $("scoreChip").textContent = `${score} poeng`;
  $("question").textContent = item.q;
  $("progress").style.width = `${((current + 1) / questions.length) * 100}%`;
  $("feedback").textContent = "";
  $("nextBtn").disabled = true;
  $("nextBtn").textContent =
    current === questions.length - 1 ? "Se resultat" : "Neste";

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
  answered = true;

  const item = questions[current];
  const buttons = $("options").querySelectorAll(".option");
  const isCorrect = selectedIndex === item.correct;

  buttons.forEach((button, index) => {
    button.disabled = true;

    if (index === item.correct) {
      button.classList.add("correct");
      button.querySelector(".mark").textContent = "✓";
    }
  });

  if (isCorrect) {
    score++;
  } else {
    buttons[selectedIndex].classList.add("wrong");
    buttons[selectedIndex].querySelector(".mark").textContent = "✕";
  }

  $("scoreChip").textContent = `${score} poeng`;
  $("feedback").textContent =
    `${isCorrect ? "Riktig!" : "Ikke helt."} ${item.explanation || ""}`;
  $("nextBtn").disabled = false;
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

function restart() {
  current = 0;
  score = 0;
  $("results").hidden = true;
  $("quiz").hidden = false;
  $("resultRing").style.strokeDashoffset = String(circumference);
  renderQuestion();
}

$("nextBtn").addEventListener("click", nextQuestion);
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

