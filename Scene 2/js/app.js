import { CHALLENGES, cloneProgram } from "./challenges.js";
import { COMMANDS, GameEngine, flattenProgram } from "./game-engine.js";

const engine = new GameEngine();
const completed = new Set();
const unlocked = new Set([0]);
let challengeIndex = 0;
let program = [];
let history = [];
let pointer = 0;
let isRunning = false;
let attempted = false;
let repeatUnlocked = false;
let prediction = null;
let selectedSlot = null;
let visited = new Set();

const commandNames = {
  [COMMANDS.MOVE]: "MOVE",
  [COMMANDS.TURN_LEFT]: "TURN LEFT",
  [COMMANDS.TURN_RIGHT]: "TURN RIGHT",
};
const commandIcons = {
  [COMMANDS.MOVE]: "↑",
  [COMMANDS.TURN_LEFT]: "↶",
  [COMMANDS.TURN_RIGHT]: "↷",
};
const rotation = { N: "-90deg", E: "0deg", S: "90deg", W: "180deg" };
const directionNames = { N: "north", E: "east", S: "south", W: "west" };
const MOVE_DURATION_MS = 430;

function programPseudocode(items, indent = "") {
  return items.flatMap((item) => {
    if (typeof item === "string") return [`${indent}${item}()`];
    return [
      `${indent}REPEAT(${item.count}):`,
      ...programPseudocode(item.body, `${indent}  `),
      `${indent}END_REPEAT`,
    ];
  });
}

window.getSceneCode = () => ({
  title: `SCENE 2 · ${currentChallenge().title.toUpperCase()}`,
  steps: program.length
    ? programPseudocode(program)
    : ["// Choose commands for this challenge"],
  operations: [
    "MOVE():\n  next = position + direction\n  IF next is inside board:\n    position = next",
    "TURN_LEFT():\n  direction = previous direction",
    "TURN_RIGHT():\n  direction = next direction",
    "REPEAT(count, steps):\n  FOR index FROM 1 TO count:\n    RUN steps from top to bottom",
    "PREDICT(tile):\n  prediction = tile\n  COMPARE prediction WITH final position",
  ],
});

const board = document.querySelector("#board");
const mascot = document.querySelector("#mascot");
const status = document.querySelector("#status");
const boardInstruction = document.querySelector("#board-instruction");
const commandList = document.querySelector("#command-list");
const slotMeter = document.querySelector("#slot-meter");
const runButton = document.querySelector("#run-button");
const resetButton = document.querySelector("#reset-button");
const undoButton = document.querySelector("#undo-button");
const clearButton = document.querySelector("#clear-button");
const repeatPanel = document.querySelector("#repeat-panel");
const repeatButton = document.querySelector("#repeat-button");
const explanationCard = document.querySelector("#explanation-card");
const explanationTitle = document.querySelector("#explanation-title");
const explanationCopy = document.querySelector("#explanation-copy");
const nextButton = document.querySelector("#next-button");
const commandPalette = document.querySelector("#command-palette");
const commandButtons = [...document.querySelectorAll("[data-command]")];
const progressButtons = [...document.querySelectorAll("[data-jump]")];

const tiles = [];
for (let y = 0; y < engine.size; y += 1) {
  for (let x = 0; x < engine.size; x += 1) {
    const tile = document.createElement("button");
    tile.className = "tile";
    tile.type = "button";
    tile.dataset.x = x;
    tile.dataset.y = y;
    tile.setAttribute("aria-label", `Column ${x + 1}, row ${y + 1}`);
    board.insertBefore(tile, mascot);
    tiles.push(tile);
  }
}

function currentChallenge() {
  return CHALLENGES[challengeIndex];
}

function positionKey(state) {
  return `${state.x},${state.y}`;
}

function remember() {
  history.push(cloneProgram(program));
  if (history.length > 30) history.shift();
}

function say(message) {
  status.textContent = message;
}

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function afterNextPaint() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
  });
}

function setWalking(walking) {
  mascot.classList.toggle("is-walking", walking);
  mascot.classList.toggle("is-idle", !walking);
}

function waitForMovementToStop() {
  return new Promise((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      mascot.removeEventListener("transitionend", onEnd);
      window.clearTimeout(fallback);
      resolve();
    };
    const onEnd = (event) => {
      if (event.target === mascot && event.propertyName === "transform") finish();
    };
    mascot.addEventListener("transitionend", onEnd);
    const fallback = window.setTimeout(finish, MOVE_DURATION_MS + 100);
  });
}

function resetMaro(message = "Maro returned to the start. Commands kept.") {
  const challenge = currentChallenge();
  setWalking(false);
  engine.reset(challenge.start);
  pointer = 0;
  visited = new Set([positionKey(challenge.start)]);
  say(message);
  render();
}

function renderBoard() {
  const challenge = currentChallenge();
  const state = engine.snapshot();

  mascot.style.setProperty("--x", state.x);
  mascot.style.setProperty("--y", state.y);
  mascot.style.setProperty("--rotation", rotation[state.direction]);
  mascot.dataset.direction = state.direction;
  mascot.setAttribute(
    "aria-label",
    `Maro at column ${state.x + 1}, row ${state.y + 1}, facing ${directionNames[state.direction]}`,
  );

  tiles.forEach((tile) => {
    const x = Number(tile.dataset.x);
    const y = Number(tile.dataset.y);
    tile.className = "tile";
    tile.replaceChildren();

    if (challenge.route.some(([routeX, routeY]) => routeX === x && routeY === y)) {
      tile.classList.add("route-tile");
    }

    if (challenge.goal?.x === x && challenge.goal?.y === y) {
      tile.classList.add("goal-tile");
      const lantern = document.createElement("span");
      lantern.className = "lantern";
      lantern.setAttribute("aria-label", "Lantern goal");
      lantern.innerHTML = "<i></i>";
      tile.append(lantern);
    }

    if (prediction?.x === x && prediction?.y === y) {
      tile.classList.add("prediction-tile");
      const marker = document.createElement("span");
      marker.className = "prediction-marker";
      marker.textContent = "?";
      marker.setAttribute("aria-label", "Your prediction");
      tile.append(marker);
    }
  });
}

function makeCommandChip(command, label, { selected = false, done = false } = {}) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "command-chip";
  if (selected) chip.classList.add("is-selected");
  if (done) chip.classList.add("is-done");
  chip.innerHTML = `<span>${commandIcons[command]}</span><strong>${label}</strong>`;
  return chip;
}

function renderProgram() {
  const challenge = currentChallenge();
  const expanded = flattenProgram(program);
  const activeSource = expanded[pointer]?.sourceIndex;
  commandList.replaceChildren();

  program.forEach((item, index) => {
    const row = document.createElement("li");
    row.className = "program-slot is-filled";
    if (index === activeSource && isRunning) row.classList.add("is-active");

    if (typeof item === "string") {
      const chip = makeCommandChip(item, commandNames[item], {
        selected: index === selectedSlot,
        done: pointer > 0 && expanded.slice(0, pointer).some((step) => step.sourceIndex === index),
      });
      chip.setAttribute("aria-label", `Command ${index + 1}: ${commandNames[item]}`);
      chip.addEventListener("click", () => selectProgramSlot(index));
      row.append(chip);
    } else {
      row.classList.add("repeat-slot");
      const repeatHeader = document.createElement("div");
      repeatHeader.className = "repeat-header";
      repeatHeader.innerHTML = "<span>↻</span><strong>REPEAT 4 TIMES</strong>";
      const body = document.createElement("div");
      body.className = "repeat-body";
      item.body.forEach((command) => {
        body.append(makeCommandChip(command, commandNames[command]));
      });
      for (let bodyIndex = item.body.length; bodyIndex < 2; bodyIndex += 1) {
        const empty = document.createElement("div");
        empty.className = "inner-empty";
        empty.textContent = "add command";
        body.append(empty);
      }
      row.append(repeatHeader, body);
    }
    commandList.append(row);
  });

  const topLevelUsed = program.length;
  const shouldShowEmpty =
    challenge.id !== "debug" && !program.some((item) => typeof item !== "string");
  if (shouldShowEmpty) {
    for (let index = topLevelUsed; index < challenge.maxSlots; index += 1) {
      const empty = document.createElement("li");
      empty.className = "program-slot is-empty";
      empty.innerHTML = `<span>${index + 1}</span>`;
      commandList.append(empty);
    }
  }

  const loop = program.find((item) => typeof item !== "string");
  const usedLabel = loop ? `${loop.body.length}/2 inside repeat` : `${program.length}/${challenge.maxSlots} slots`;
  slotMeter.textContent = usedLabel;
}

function render() {
  const challenge = currentChallenge();
  renderBoard();
  renderProgram();

  document.querySelector("#mission-number").textContent =
    `CHALLENGE ${challengeIndex + 1} OF ${CHALLENGES.length}`;
  document.querySelector("#mission-title").textContent = challenge.title;
  document.querySelector("#mission-copy").textContent = challenge.copy;
  document.querySelector("#slot-rule").textContent =
    challenge.id === "repeat" ? "6 slots · route needs 8" : `${challenge.maxSlots} command slots`;
  document.querySelector("#concept-label").textContent = challenge.concept;
  document.querySelector("#builder-hint").textContent =
    challenge.id === "debug" && attempted
      ? selectedSlot === null
        ? "Tap the wrong command above to select it."
        : `Command ${selectedSlot + 1} selected. Choose its replacement below.`
      : challenge.builderHint;

  boardInstruction.hidden = !(challenge.id === "debug" && !attempted);
  repeatPanel.hidden = !(challenge.id === "repeat" && repeatUnlocked);
  explanationCard.hidden = !completed.has(challengeIndex);

  const hasCompleteLoop =
    program.some((item) => typeof item !== "string" && item.body.length === 2);
  const replacingDebugCommand =
    challenge.id === "debug" && attempted && selectedSlot !== null;
  commandPalette.classList.toggle("is-replacing", replacingDebugCommand);
  commandPalette.setAttribute(
    "aria-label",
    replacingDebugCommand
      ? `Choose a replacement for command ${selectedSlot + 1}`
      : "Command palette",
  );
  commandButtons.forEach((button) => {
    const loop = program.find((item) => typeof item !== "string");
    const normalRoom = program.length < challenge.maxSlots;
    const loopRoom = loop && loop.body.length < 2;
    if (challenge.id === "debug") {
      button.disabled =
        isRunning ||
        completed.has(challengeIndex) ||
        !replacingDebugCommand;
    } else {
      button.disabled =
        isRunning ||
        completed.has(challengeIndex) ||
        (loop ? !loopRoom : !normalRoom);
    }
  });

  clearButton.disabled =
    isRunning ||
    program.length === 0 ||
    challenge.id === "debug" ||
    completed.has(challengeIndex);
  undoButton.disabled =
    isRunning ||
    history.length === 0 ||
    challenge.id === "debug" ||
    completed.has(challengeIndex);
  resetButton.disabled = isRunning;
  repeatButton.disabled = isRunning || hasCompleteLoop;
  runButton.disabled =
    isRunning ||
    completed.has(challengeIndex) ||
    flattenProgram(program).length === 0 ||
    (challenge.id === "debug" && prediction === null) ||
    (program.some((item) => typeof item !== "string") && !hasCompleteLoop);

  progressButtons.forEach((button, index) => {
    button.disabled = !unlocked.has(index) || isRunning;
    button.classList.toggle("is-current", index === challengeIndex);
    button.classList.toggle("is-complete", completed.has(index));
  });
}

function selectProgramSlot(index) {
  if (currentChallenge().id !== "debug" || !attempted || isRunning) return;
  selectedSlot = index;
  say(`Command ${index + 1} selected. Choose a replacement.`);
  render();
}

function isChallengeComplete() {
  const challenge = currentChallenge();
  const state = engine.snapshot();

  if (challenge.id === "repeat") {
    const requiredTiles = ["1,1", "2,1", "2,2", "1,2"];
    const usedRepeat = program.some((item) => typeof item !== "string");
    return (
      usedRepeat &&
      requiredTiles.every((tile) => visited.has(tile)) &&
      state.x === challenge.start.x &&
      state.y === challenge.start.y
    );
  }

  return state.x === challenge.goal.x && state.y === challenge.goal.y;
}

async function animateCommand(command) {
  if (command !== COMMANDS.MOVE) {
    const result = engine.execute(command);
    render();
    await wait(230);
    return result;
  }

  const result = engine.execute(command);
  if (result.blocked) {
    mascot.classList.remove("bump");
    void mascot.offsetWidth;
    mascot.classList.add("bump");
    await wait(260);
    return result;
  }

  setWalking(true);
  const stopped = waitForMovementToStop();
  render();
  await stopped;
  await afterNextPaint();
  setWalking(false);
  visited.add(positionKey(engine.snapshot()));
  return result;
}

function finishChallenge() {
  completed.add(challengeIndex);
  explanationTitle.textContent = currentChallenge().explanationTitle;
  explanationCopy.textContent = currentChallenge().explanation;
  nextButton.textContent =
    challengeIndex === CHALLENGES.length - 1 ? "Day 2 complete!" : "Next challenge →";
  if (challengeIndex < CHALLENGES.length - 1) unlocked.add(challengeIndex + 1);
  say("Challenge complete!");
  render();
  explanationCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function handleUnsuccessfulAttempt() {
  const challenge = currentChallenge();
  if (challenge.id === "debug") {
    selectedSlot = null;
    say("Your prediction is revealed. Tap the wrong command to select it.");
  } else if (challenge.id === "repeat" && !repeatUnlocked) {
    repeatUnlocked = true;
    say("Eight actions will not fit. You unlocked Repeat 4×!");
  } else {
    say("Not there yet. Reset Maro, adjust the program, and try again.");
  }
  render();
}

async function runProgram() {
  if (isRunning) return;
  const expanded = flattenProgram(program);
  if (expanded.length === 0) return;

  if (pointer >= expanded.length) {
    resetMaro("Maro reset so you can test the program again.");
  }

  isRunning = true;
  attempted = true;
  selectedSlot = null;
  say("Running your program…");
  render();

  const steps = flattenProgram(program);
  while (pointer < steps.length) {
    const step = steps[pointer];
    render();
    await wait(100);
    await animateCommand(step.command);
    pointer += 1;
    render();
    await wait(90);
  }

  isRunning = false;
  if (isChallengeComplete()) finishChallenge();
  else handleUnsuccessfulAttempt();
}

function loadChallenge(index) {
  challengeIndex = index;
  const challenge = currentChallenge();
  program = cloneProgram(challenge.initialProgram);
  history = [];
  pointer = 0;
  attempted = false;
  repeatUnlocked = false;
  prediction = null;
  selectedSlot = null;
  explanationCard.hidden = true;
  engine.reset(challenge.start);
  visited = new Set([positionKey(challenge.start)]);
  say(challenge.status);
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

commandButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const command = button.dataset.command;
    const challenge = currentChallenge();

    if (challenge.id === "debug") {
      if (!attempted || selectedSlot === null) return;
      const index = selectedSlot;
      program[index] = command;
      selectedSlot = null;
      resetMaro(`${commandNames[command]} replaced command ${index + 1}. Run it again.`);
      return;
    }

    remember();
    const repeat = program.find((item) => typeof item !== "string");
    if (repeat) {
      if (repeat.body.length < 2) repeat.body.push(command);
    } else if (program.length < challenge.maxSlots) {
      program.push(command);
    }
    pointer = 0;
    say(`${commandNames[command]} added.`);
    render();
  });
});

tiles.forEach((tile) => {
  tile.addEventListener("click", () => {
    if (currentChallenge().id !== "debug" || attempted || isRunning) return;
    prediction = { x: Number(tile.dataset.x), y: Number(tile.dataset.y) };
    say(`Prediction placed at column ${prediction.x + 1}, row ${prediction.y + 1}. Now run it.`);
    render();
  });
});

runButton.addEventListener("click", runProgram);
resetButton.addEventListener("click", () => resetMaro());

clearButton.addEventListener("click", () => {
  remember();
  program = [];
  pointer = 0;
  say("Commands cleared. Maro stayed in place.");
  render();
});

undoButton.addEventListener("click", () => {
  const previous = history.pop();
  if (!previous) return;
  program = previous;
  pointer = 0;
  say("Last command change undone.");
  render();
});

repeatButton.addEventListener("click", () => {
  remember();
  program = [{ type: "REPEAT", count: 4, body: [] }];
  pointer = 0;
  resetMaro("Repeat block added. Put two commands inside it.");
});

nextButton.addEventListener("click", () => {
  if (challengeIndex < CHALLENGES.length - 1) loadChallenge(challengeIndex + 1);
});

progressButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const index = Number(button.dataset.jump);
    if (unlocked.has(index) && !isRunning) loadChallenge(index);
  });
});

loadChallenge(0);
