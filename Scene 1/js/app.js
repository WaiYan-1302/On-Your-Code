import { COMMANDS, GameEngine } from "./game-engine.js";

const engine = new GameEngine();
const program = [];
const history = [];
let pointer = 0;
let isRunning = false;

const commandNames = {
  [COMMANDS.MOVE]: "↑ MOVE FORWARD",
  [COMMANDS.TURN_LEFT]: "↶ TURN LEFT",
  [COMMANDS.TURN_RIGHT]: "↷ TURN RIGHT",
};

const rotation = { N: "-90deg", E: "0deg", S: "90deg", W: "180deg" };
const directionNames = { N: "north", E: "east", S: "south", W: "west" };
const MOVE_DURATION_MS = 540;

window.getSceneCode = () => ({
  title: "SCENE 1 · MARO'S PROGRAM",
  steps: program.length
    ? program.map((command) => `${command}()`)
    : ["// Add MOVE or TURN commands to build your program"],
  operations: [
    "MOVE():\n  next = position + direction\n  IF next is inside board:\n    position = next",
    "TURN_LEFT():\n  direction = previous direction\n  // north → west → south → east",
    "TURN_RIGHT():\n  direction = next direction\n  // north → east → south → west",
  ],
});

const board = document.querySelector("#board");
const mascot = document.querySelector("#mascot");
const status = document.querySelector("#status");
const commandList = document.querySelector("#command-list");
const runButton = document.querySelector("#run-button");
const stepButton = document.querySelector("#step-button");
const resetButton = document.querySelector("#reset-button");
const undoButton = document.querySelector("#undo-button");
const clearButton = document.querySelector("#clear-button");
const commandButtons = [...document.querySelectorAll("[data-command]")];
const allButtons = [...document.querySelectorAll("button")];

for (let i = 0; i < engine.size ** 2; i += 1) {
  const tile = document.createElement("div");
  tile.className = "tile";
  tile.setAttribute("aria-hidden", "true");
  board.append(tile);
}

function capture() {
  return {
    state: engine.snapshot(),
    program: [...program],
    pointer,
  };
}

function remember() {
  history.push(capture());
  if (history.length > 100) history.shift();
}

function restore(snapshot) {
  engine.restore(snapshot.state);
  program.splice(0, program.length, ...snapshot.program);
  pointer = snapshot.pointer;
}

function render() {
  const state = engine.snapshot();
  mascot.style.setProperty("--x", state.x);
  mascot.style.setProperty("--y", state.y);
  mascot.style.setProperty("--rotation", rotation[state.direction]);
  mascot.dataset.direction = state.direction;
  mascot.setAttribute(
    "aria-label",
    `Maro at column ${state.x + 1}, row ${state.y + 1}, facing ${directionNames[state.direction]}`,
  );

  commandList.replaceChildren();
  if (program.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-program";
    empty.textContent = "Tap a command to begin.";
    commandList.append(empty);
  } else {
    program.forEach((command, index) => {
      const item = document.createElement("li");
      item.className = "command-item";
      item.textContent = commandNames[command];
      if (index === pointer && pointer < program.length) item.classList.add("active");
      if (index < pointer) item.classList.add("done");
      item.setAttribute("aria-current", index === pointer ? "step" : "false");
      commandList.append(item);
    });
  }

  allButtons.forEach((button) => {
    button.disabled = isRunning;
  });
  runButton.disabled =
    isRunning || program.length === 0 || pointer >= program.length;
  stepButton.disabled =
    isRunning || program.length === 0 || pointer >= program.length;
  undoButton.disabled = isRunning || history.length === 0;
  clearButton.disabled = isRunning || program.length === 0;
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

function setWalking(isWalking) {
  mascot.classList.toggle("is-walking", isWalking);
  mascot.classList.toggle("is-idle", !isWalking);
}

function waitForMovementToStop() {
  return new Promise((resolve) => {
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      mascot.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(fallback);
      resolve();
    };

    const onTransitionEnd = (event) => {
      if (event.target === mascot && event.propertyName === "transform") finish();
    };

    mascot.addEventListener("transitionend", onTransitionEnd);
    const fallback = window.setTimeout(finish, MOVE_DURATION_MS + 100);
  });
}

async function animateMove(command) {
  const result = engine.execute(command);

  if (result.blocked) {
    mascot.classList.remove("bump");
    void mascot.offsetWidth;
    mascot.classList.add("bump");
    say("Boop! The edge blocked MOVE.");
    await wait(280);
    return result;
  }

  setWalking(true);
  const stopped = waitForMovementToStop();
  render();
  await stopped;
  // Show idle only after the final position has been painted.
  await afterNextPaint();
  setWalking(false);
  return result;
}

async function executeNext() {
  if (program.length === 0) {
    say("Add a command first.");
    return false;
  }

  if (pointer >= program.length) {
    say("Program finished. Reset Maro to play it again.");
    return false;
  }

  remember();
  const command = program[pointer];
  render();
  await wait(180);

  let result;
  if (command === COMMANDS.MOVE) {
    result = await animateMove(command);
  } else {
    result = engine.execute(command);
    render();
    await wait(260);
  }

  if (!result.blocked) say(`${commandNames[command]} executed.`);
  pointer += 1;
  render();
  await wait(100);
  return true;
}

commandButtons.forEach((button) => {
  button.addEventListener("click", () => {
    remember();
    const wasEmpty = program.length === 0;
    program.push(button.dataset.command);
    if (wasEmpty) pointer = 0;
    say(`${commandNames[button.dataset.command]} added.`);
    render();
    commandList.scrollTo({ left: commandList.scrollWidth, behavior: "smooth" });
  });
});

runButton.addEventListener("click", async () => {
  if (pointer >= program.length) {
    say("Program finished. Reset Maro to run it again.");
    return;
  }

  isRunning = true;
  say("Running your program…");
  render();
  while (pointer < program.length) {
    await executeNext();
  }
  isRunning = false;
  say("Program complete!");
  render();
});

stepButton.addEventListener("click", async () => {
  isRunning = true;
  render();
  await executeNext();
  isRunning = false;
  render();
});

resetButton.addEventListener("click", () => {
  remember();
  setWalking(false);
  engine.reset();
  pointer = 0;
  say("Maro returned to the start. Commands kept.");
  render();
});

undoButton.addEventListener("click", () => {
  const previous = history.pop();
  if (!previous) return;
  restore(previous);
  say("Last action undone.");
  render();
});

clearButton.addEventListener("click", () => {
  remember();
  program.length = 0;
  pointer = 0;
  say("Commands cleared. Maro stayed in place.");
  render();
});

render();
