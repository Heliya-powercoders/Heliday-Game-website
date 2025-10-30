//  FADE-IN EFFECT

document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll(".fade-in");
  elements.forEach((el) => el.classList.add("visible"));
});

// //  //  //  //   SEARCH FILTER  //  //  //  //  //

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const cards = document.querySelectorAll(".card");
  const logo = document.querySelector(".logo");
  const banner = document.querySelector(".banner");
  const searchForm = document.querySelector("form[role='search']");

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => e.preventDefault());
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const searchText = searchInput.value.toLowerCase().trim();
      let hasResults = false;

      cards.forEach((card) => {
        const title = card
          .querySelector(".card-title")
          .textContent.toLowerCase();
        const match = title.includes(searchText);
        card.style.display = match ? "flex" : "none";
        if (match) hasResults = true;
      });

      if (searchText.length > 0) {
        logo.style.display = "none";
        banner.style.display = "none";
      } else {
        logo.style.display = "block";
        banner.style.display = "block";
      }
    });
  }
});

// //  //  //  //    CLICK SPEED TEST  // //  //  //  //

document.addEventListener("DOMContentLoaded", () => {
  const clickArea = document.getElementById("clickArea");
  const startBtn = document.getElementById("startBtn");
  const clicksDisplay = document.getElementById("clicks");
  const timeDisplay = document.getElementById("time");

  const resultDiv = document.createElement("div");
  resultDiv.id = "result";
  resultDiv.style.marginTop = "10px";
  resultDiv.style.fontSize = window.getComputedStyle(clicksDisplay).fontSize;
  resultDiv.style.fontWeight =
    window.getComputedStyle(clicksDisplay).fontWeight;
  document.querySelector("main").appendChild(resultDiv);

  if (!clickArea || !startBtn) return;

  let clicks = 0;
  let time = 10;
  let interval;
  let gameStarted = false;

  function startGame() {
    clicks = 0;
    time = 10;
    clicksDisplay.textContent = clicks;
    timeDisplay.textContent = time;
    resultDiv.textContent = "";
    gameStarted = true;

    interval = setInterval(() => {
      time--;
      timeDisplay.textContent = time;
      if (time <= 0) {
        clearInterval(interval);
        gameStarted = false;
        resultDiv.textContent = `Time's up! You clicked ${clicks} times.`;
      }
    }, 1000);
  }

  clickArea.addEventListener("click", () => {
    if (gameStarted) {
      clicks++;
      clicksDisplay.textContent = clicks;
    }
  });

  startBtn.addEventListener("click", startGame);
});

// //  //  //  //     LANGUAGE MEMORY GAME  // //  //  //  //

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startMemoryGame");
  const addWordBtn = document.getElementById("addWord");
  const saveWordBtn = document.getElementById("saveWord");
  const restartBtn = document.getElementById("restartGame");
  const wordInput = document.getElementById("wordInput");
  const meaningInput = document.getElementById("meaningInput");
  const inputsContainer = document.getElementById("wordInputs");
  const cardsContainer = document.getElementById("memoryCards");
  const helpText = document.getElementById("helpText");
  const statusEl = document.getElementById("memoryStatus");
  const wordsTableBody = document.getElementById("wordsTableBody");

  if (!startBtn || !addWordBtn) return;

  let words = [];

  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;

  function addWordToTableRow(wordObj, index) {
    const tr = document.createElement("tr");
    tr.dataset.index = index;

    tr.innerHTML = `
      <td class="index-cell">${index + 1}</td>
      <td class="word-cell"></td>
      <td class="meaning-cell"></td>
      <td class="actions-cell">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </td>
    `;

    tr.querySelector(".word-cell").textContent = wordObj.word;
    tr.querySelector(".meaning-cell").textContent = wordObj.meaning;

    tr.querySelector(".edit-btn").addEventListener("click", () => {
      const currentIndex = parseInt(tr.dataset.index, 10);
      const current = words[currentIndex];
      const newWord = prompt("Edit Word:", current.word);
      if (newWord === null) return;
      const newMeaning = prompt("Edit Meaning:", current.meaning);
      if (newMeaning === null) return;
      words[currentIndex] = {
        word: newWord.trim(),
        meaning: newMeaning.trim(),
      };
      tr.querySelector(".word-cell").textContent = words[currentIndex].word;
      tr.querySelector(".meaning-cell").textContent =
        words[currentIndex].meaning;
      helpText.innerHTML = `<small>Total words: ${words.length}.</small>`;
      if (cardsContainer.children.length > 0) buildCardsFromWords();
    });

    tr.querySelector(".delete-btn").addEventListener("click", () => {
      const conf = confirm("Are you sure you want to delete this word?");
      if (!conf) return;
      const delIndex = parseInt(tr.dataset.index, 10);
      words.splice(delIndex, 1);
      refreshWordsTable();
      helpText.innerHTML = `<small>Total words: ${words.length}.</small>`;
      if (cardsContainer.children.length > 0) buildCardsFromWords();
    });

    wordsTableBody.appendChild(tr);
  }

  function refreshWordsTable() {
    wordsTableBody.innerHTML = "";
    words.forEach((w, i) => addWordToTableRow(w, i));
  }

  function buildCardsFromWords() {
    const pool = [];
    words.forEach((item) => {
      pool.push({ type: "word", value: item.word, pair: item.meaning });
      pool.push({ type: "meaning", value: item.meaning, pair: item.word });
    });

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    cardsContainer.innerHTML = "";
    pool.forEach((c, idx) => {
      const el = document.createElement("div");
      el.className = "card";
      el.tabIndex = 0;
      el.dataset.type = c.type;
      el.dataset.value = c.value;
      el.dataset.pair = c.pair;
      el.dataset.index = idx;
      el.textContent = "";
      el.addEventListener("click", onCardClick);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") onCardClick.call(el, e);
      });
      cardsContainer.appendChild(el);
    });
  }

  function onCardClick(e) {
    if (lockBoard) return;
    const el = this instanceof Element ? this : e.currentTarget;
    if (el.classList.contains("flipped") || el.classList.contains("matched"))
      return;

    el.classList.add("flipped");
    el.textContent = el.dataset.value;

    if (!firstCard) {
      firstCard = el;
      return;
    }

    secondCard = el;
    checkForMatch();
  }

  function checkForMatch() {
    if (!firstCard || !secondCard) return;

    const isMatch =
      firstCard.dataset.type !== secondCard.dataset.type &&
      (firstCard.dataset.pair === secondCard.dataset.value ||
        secondCard.dataset.pair === firstCard.dataset.value);

    if (isMatch) {
      firstCard.classList.add("matched");
      secondCard.classList.add("matched");
      resetTurn();
      checkWin();
    } else {
      lockBoard = true;
      setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        firstCard.textContent = "";
        secondCard.textContent = "";
        resetTurn();
      }, 900);
    }
  }

  function resetTurn() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
  }

  function checkWin() {
    const all = Array.from(document.querySelectorAll(".card"));
    if (all.length > 0 && all.every((c) => c.classList.contains("matched"))) {
      statusEl.textContent = "🎉 Congratulations! You matched all pairs.";
    }
  }

  addWordBtn.addEventListener("click", () => {
    inputsContainer.classList.toggle("active");
    const visible = inputsContainer.classList.contains("active");
    inputsContainer.setAttribute("aria-hidden", !visible);
    if (visible) wordInput.focus();
  });

  saveWordBtn.addEventListener("click", () => {
    const w = wordInput.value.trim();
    const m = meaningInput.value.trim();
    if (!w || !m) {
      alert("Please enter both the word and its meaning.");
      return;
    }
    words.push({ word: w, meaning: m });
    addWordToTableRow({ word: w, meaning: m }, words.length - 1);
    wordInput.value = "";
    meaningInput.value = "";
    inputsContainer.classList.remove("active");
    inputsContainer.setAttribute("aria-hidden", "true");
    helpText.innerHTML = `<small>Total words: ${words.length}. You can now start the game.</small>`;
  });

  startBtn.addEventListener("click", () => {
    if (words.length === 0) {
      alert("Please add at least one word and its meaning first.");
      return;
    }
    statusEl.textContent = "";
    buildCardsFromWords();
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    cardsContainer.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  restartBtn.addEventListener("click", () => {
    if (words.length === 0) {
      cardsContainer.innerHTML = "";
      statusEl.textContent = "";
      return;
    }
    statusEl.textContent = "";
    buildCardsFromWords();
    firstCard = null;
    secondCard = null;
    lockBoard = false;
  });

  wordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") meaningInput.focus();
  });
  meaningInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveWordBtn.click();
  });

  refreshWordsTable();
});

// //  //  //  //  MEMORY CARD GAME // //  //  //  //

document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("mcBoard");
  const startBtn = document.getElementById("startCardGame");
  const restartBtn = document.getElementById("restartCardGame");
  const movesEl = document.getElementById("mcMoves");
  const timeEl = document.getElementById("mcTime");
  const bestEl = document.getElementById("mcBest");
  const stickerSelect = document.getElementById("stickerSet");
  const shuffleBtn = document.getElementById("shuffleStickers");
  const gridButtons = document.querySelectorAll(".grid-btn");

  const STICKER_POOLS = {
    emoji: [
      "😀",
      "🎯",
      "🌟",
      "🍓",
      "⚽️",
      "🎵",
      "🚀",
      "💡",
      "🍕",
      "🧩",
      "🌈",
      "🐾",
      "📚",
      "🎲",
      "🏆",
      "🌙",
      "🔥",
      "🍩",
    ],
    animals: [
      "🐶",
      "🐱",
      "🐭",
      "🐰",
      "🦊",
      "🐻",
      "🐼",
      "🐨",
      "🐯",
      "🦁",
      "🐮",
      "🐷",
      "🐸",
      "🐵",
      "🦄",
      "🐔",
      "🦉",
      "🐢",
    ],
    shapes: [
      "🔴",
      "🔵",
      "🟢",
      "🟡",
      "🟣",
      "🟠",
      "⬛️",
      "⬜️",
      "🔺",
      "🔻",
      "🔷",
      "🔶",
      "⭐️",
      "💠",
      "🔸",
      "🔹",
      "🔺",
      "🔻",
    ],
  };

  let stickerPool = [...STICKER_POOLS.emoji];
  let numPairs = 8;
  let cards = [];
  let first = null,
    second = null;
  let lock = false;
  let moves = 0;
  let timerInterval = null;
  let seconds = 0;
  let matchedCount = 0;
  let bestKey =
    "heliplay_mc_best_" +
    numPairs +
    "_" +
    (stickerSelect ? stickerSelect.value : "emoji");

  function formatTime(s) {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function setGridClass(pairs) {
    board.classList.remove("grid-4x4", "grid-4x6", "grid-5x6");
    if (pairs === 8) board.classList.add("grid-4x4");
    if (pairs === 12) board.classList.add("grid-4x6");
    if (pairs === 15) board.classList.add("grid-5x6");
  }

  function buildCards() {
    board.innerHTML = "";
    const total = numPairs * 2;

    const poolCopy = [...stickerPool];

    poolCopy.sort(() => Math.random() - 0.5);
    const chosen = poolCopy.slice(0, numPairs);

    cards = chosen.concat(chosen);
    cards.sort(() => Math.random() - 0.5);

    cards.forEach((value, idx) => {
      const card = document.createElement("div");
      card.className = "mc-card";
      card.dataset.value = value;
      card.dataset.index = idx;

      const inner = document.createElement("div");
      inner.className = "mc-card-inner";

      const faceBack = document.createElement("div");
      faceBack.className = "mc-card-face back";
      faceBack.innerHTML = '<span class="mc-back-icon">❓</span>';

      const faceFront = document.createElement("div");
      faceFront.className = "mc-card-face front";
      faceFront.textContent = value;

      inner.appendChild(faceBack);
      inner.appendChild(faceFront);
      card.appendChild(inner);

      card.addEventListener("click", () => flipCard(card));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") flipCard(card);
      });
      card.tabIndex = 0;

      board.appendChild(card);
    });
  }

  function flipCard(card) {
    if (lock) return;
    if (
      card.classList.contains("flipped") ||
      card.classList.contains("matched")
    )
      return;

    card.classList.add("flipped");

    if (!first) {
      first = card;
      return;
    }
    second = card;
    checkMatch();
  }

  function checkMatch() {
    if (!first || !second) return;
    lock = true;
    moves++;
    movesEl.textContent = moves;

    const isMatch = first.dataset.value === second.dataset.value;
    if (isMatch) {
      first.classList.add("matched");
      second.classList.add("matched");
      matchedCount++;
      setTimeout(() => {
        resetSelection();
        lock = false;
        checkWin();
      }, 500);
    } else {
      setTimeout(() => {
        first.classList.remove("flipped");
        second.classList.remove("flipped");
        resetSelection();
        lock = false;
      }, 700);
    }
  }

  function resetSelection() {
    first = null;
    second = null;
  }

  function startTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    timeEl.textContent = formatTime(seconds);
    timerInterval = setInterval(() => {
      seconds++;
      timeEl.textContent = formatTime(seconds);
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function startGame() {
    matchedCount = 0;
    moves = 0;
    movesEl.textContent = moves;
    seconds = 0;
    timeEl.textContent = formatTime(seconds);

    bestKey =
      "heliplay_mc_best_" +
      numPairs +
      "_" +
      (stickerSelect ? stickerSelect.value : "emoji");
    const storedBest = localStorage.getItem(bestKey);
    bestEl.textContent = storedBest ? storedBest : "—";

    setGridClass(numPairs);
    buildCards();
    startTimer();
  }

  function restartGame() {
    stopTimer();
    resetSelection();
    startGame();
  }

  function checkWin() {
    const totalMatchesNeeded = numPairs;

    const matchedEls = board.querySelectorAll(".mc-card.matched");

    if (matchedCount >= totalMatchesNeeded) {
      stopTimer();

      const result = `${moves} moves • ${formatTime(seconds)}`;
      const prev = localStorage.getItem(bestKey);

      let save = false;
      if (!prev) save = true;
      else {
        const [prevMovesStr, prevTimeStr] = prev.split(" moves • ");
        const prevMoves = parseInt(prevMovesStr, 10);

        if (moves < prevMoves) save = true;
        else if (moves === prevMoves) {
          const toSec = (t) => {
            const [mm, ss] = t.split(":").map(Number);
            return mm * 60 + ss;
          };
          const prevSec = toSec(prevTimeStr || "99:99");
          if (seconds < prevSec) save = true;
        }
      }
      if (save) {
        localStorage.setItem(bestKey, result);
        bestEl.textContent = result;
      }

      setTimeout(() => {
        alert(
          `Nice! You matched all pairs.\nMoves: ${moves}\nTime: ${formatTime(
            seconds
          )}`
        );
      }, 200);
    }
  }

  startBtn.addEventListener("click", () => {
    startGame();
  });
  restartBtn.addEventListener("click", () => {
    restartGame();
  });

  stickerSelect.addEventListener("change", () => {
    const v = stickerSelect.value;
    stickerPool = [...(STICKER_POOLS[v] || STICKER_POOLS.emoji)];
  });

  shuffleBtn.addEventListener("click", () => {
    stickerPool.sort(() => Math.random() - 0.5);
    alert("Sticker pool shuffled.");
  });

  gridButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      gridButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      numPairs = parseInt(btn.dataset.pairs, 10);

      bestKey =
        "heliplay_mc_best_" +
        numPairs +
        "_" +
        (stickerSelect ? stickerSelect.value : "emoji");
      const storedBest = localStorage.getItem(bestKey);
      bestEl.textContent = storedBest ? storedBest : "—";
      setGridClass(numPairs);
    });
  });

  const defaultBtn = document.querySelector('.grid-btn[data-pairs="8"]');
  if (defaultBtn) defaultBtn.classList.add("active");
  stickerPool = [...STICKER_POOLS.emoji];
  movesEl.textContent = "0";
  timeEl.textContent = "00:00";
  bestEl.textContent = localStorage.getItem(bestKey) || "—";

  board.addEventListener("keydown", (e) => {});
});

// //  //  //  //  NUMBER GUESSING GAME // //  //  //  //

document.addEventListener("DOMContentLoaded", () => {
  const guessInput = document.getElementById("guessInput");
  const guessBtn = document.getElementById("guessBtn");
  const feedback = document.getElementById("feedback");
  const restartBtn = document.getElementById("restartGuessBtn");

  if (!guessBtn) return;

  let targetNumber;
  let attempts;

  function initGame() {
    targetNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    feedback.textContent = "";
    guessInput.value = "";
    console.log("Target number:", targetNumber);
  }

  guessBtn.addEventListener("click", () => {
    const guess = parseInt(guessInput.value, 10);
    if (isNaN(guess) || guess < 1 || guess > 100) {
      feedback.textContent = "Please enter a number between 1 and 100.";
      return;
    }

    attempts++;

    if (guess === targetNumber) {
      feedback.textContent = `🎉 Correct! You guessed it in ${attempts} attempts.`;
    } else if (guess < targetNumber) {
      feedback.textContent = "⬆️ Too low! Try a higher number.";
    } else {
      feedback.textContent = "⬇️ Too high! Try a lower number.";
    }

    guessInput.value = "";
    guessInput.focus();
  });

  restartBtn.addEventListener("click", initGame);

  initGame();
});

// //  //  //  //  Quiz GAME // //  //  //  //

let currentQuestion = 0;

document.addEventListener("DOMContentLoaded", () => {
  const quizContainer = document.getElementById("quizContainer");
  const questionBox = document.getElementById("questionBox");
  const optionsBox = document.getElementById("optionsBox");
  const nextBtn = document.getElementById("nextBtn");
  const resultBox = document.getElementById("resultBox");
  const scoreEl = document.getElementById("score");
  const totalEl = document.getElementById("total");
  const restartBtn = document.getElementById("restartBtn");

  const allQuestions = [
    {
      question: "What does the word 'meticulous' mean?",
      options: ["Careful and precise", "Lazy", "Quick", "Rude"],
      answer: "Careful and precise",
    },
    {
      question: "Which of these sentences is grammatically correct?",
      options: [
        "She don't like coffee.",
        "She doesn't likes coffee.",
        "She doesn't like coffee.",
        "She not likes coffee.",
      ],
      answer: "She doesn't like coffee.",
    },
    {
      question: "What is the synonym of 'resilient'?",
      options: ["Fragile", "Flexible", "Weak", "Sensitive"],
      answer: "Flexible",
    },
    {
      question:
        "Choose the correct form: 'If I ___ earlier, I wouldn't be late.'",
      options: ["left", "had left", "leave", "was leaving"],
      answer: "had left",
    },
    {
      question: "What does 'on the verge of' mean?",
      options: [
        "Far from something",
        "At the beginning of something",
        "Almost doing or experiencing something",
        "Completely finished something",
      ],
      answer: "Almost doing or experiencing something",
    },
    {
      question: "What's the opposite of 'scarcity'?",
      options: ["Lack", "Abundance", "Deficiency", "Shortage"],
      answer: "Abundance",
    },
    {
      question:
        "Which word fits? 'He spoke so quietly that I could hardly ___ him.'",
      options: ["listen", "hear", "see", "understand"],
      answer: "hear",
    },
    {
      question: "What does 'take something for granted' mean?",
      options: [
        "Appreciate something deeply",
        "Assume something will always be there",
        "Doubt something strongly",
        "Refuse to accept something",
      ],
      answer: "Assume something will always be there",
    },
    {
      question: "What is a person who loves books called?",
      options: ["Bibliophile", "Linguist", "Philosopher", "Collector"],
      answer: "Bibliophile",
    },
    {
      question: "Which word means 'brief and clear in expression'?",
      options: ["Verbose", "Concise", "Complicated", "Polite"],
      answer: "Concise",
    },
  ];

  function getRandomQuestions(questions, count) {
    return [...questions].sort(() => 0.5 - Math.random()).slice(0, count);
  }

  let quizData = getRandomQuestions(allQuestions, 5);
  let score = 0;

  function loadQuestion() {
    const q = quizData[currentQuestion];
    questionBox.textContent = q.question;
    optionsBox.innerHTML = "";
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.addEventListener("click", () => selectAnswer(opt));
      optionsBox.appendChild(btn);
    });
    nextBtn.style.display = "none";
  }

  function selectAnswer(selected) {
    const correct = quizData[currentQuestion].answer;
    if (selected === correct) score++;
    Array.from(optionsBox.children).forEach((btn) => {
      btn.disabled = true;
      if (btn.textContent === correct) btn.style.background = "green";
      else if (btn.textContent === selected) btn.style.background = "red";
    });
    nextBtn.style.display = "block";
  }

  nextBtn.addEventListener("click", () => {
    currentQuestion++;
    if (currentQuestion < quizData.length) {
      loadQuestion();
    } else {
      showResult();
    }
  });

  function showResult() {
    quizContainer.style.display = "none";
    resultBox.style.display = "block";
    scoreEl.textContent = score;
    totalEl.textContent = quizData.length;
  }

  restartBtn.addEventListener("click", () => {
    quizData = getRandomQuestions(allQuestions, 5);
    currentQuestion = 0;
    score = 0;
    resultBox.style.display = "none";
    quizContainer.style.display = "block";
    loadQuestion();
  });

  loadQuestion();
});

// //  //  //  //  RPS GAME // //  //  //  //

function play(userChoice) {
  const choices = ["rock", "paper", "scissors"];
  const computerChoice = choices[Math.floor(Math.random() * choices.length)];

  document.getElementById("user-choice").textContent =
    "Your Choice: " + capitalize(userChoice);
  document.getElementById("computer-choice").textContent =
    "Computer's Choice: " + capitalize(computerChoice);

  document.getElementById("result").textContent =
    "Result: " + getResult(userChoice, computerChoice);
}

function getResult(user, computer) {
  if (user === computer) return "Draw!";
  if (
    (user === "rock" && computer === "scissors") ||
    (user === "paper" && computer === "rock") ||
    (user === "scissors" && computer === "paper")
  )
    return "You Win!";
  return "You Lose!";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

document.getElementById("restartRPS").addEventListener("click", () => {
  document.getElementById("user-choice").textContent = "Your Choice: -";
  document.getElementById("computer-choice").textContent =
    "Computer's Choice: -";
  document.getElementById("result").textContent = "Result: -";
});

// //  //  //  //  Tic Tac Toe GAME // //  //  //  //
// inside the Tic Tac Toe.html

// //  //  //  //  Whack-a-Mole GAME // //  //  //  //
// inside the Whack-a-Mole GAME.html

// //  //  //  //  Snake Game GAME // //  //  //  //
// inside the Snake Game.html
