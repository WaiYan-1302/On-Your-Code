import { COMMANDS } from "./game-engine.js";

export const CHALLENGES = Object.freeze([
  {
    id: "lantern",
    title: "Reach the lantern",
    copy: "Use four commands and follow the glowing path.",
    concept: "Sequence",
    start: { x: 0, y: 3, direction: "E" },
    goal: { x: 2, y: 4 },
    route: [[1, 3], [2, 3], [2, 4]],
    maxSlots: 4,
    initialProgram: [],
    status: "Build a four-command program.",
    builderHint: "Try: Move, Move, Turn right, Move.",
    explanationTitle: "A program follows a sequence.",
    explanation: "The computer followed your commands in order, one at a time.",
  },
  {
    id: "debug",
    title: "Repair the mistake",
    copy: "Predict the result, run it, then repair the one wrong command.",
    concept: "Debugging",
    start: { x: 0, y: 4, direction: "N" },
    goal: { x: 2, y: 2 },
    route: [[0, 3], [0, 2], [1, 2], [2, 2]],
    maxSlots: 5,
    initialProgram: [
      COMMANDS.MOVE,
      COMMANDS.MOVE,
      COMMANDS.TURN_LEFT,
      COMMANDS.MOVE,
      COMMANDS.MOVE,
    ],
    status: "Tap your predicted stopping tile first.",
    builderHint: "The program is locked until you predict and run it.",
    explanationTitle: "Debugging starts with prediction.",
    explanation: "Comparing what you expected with what happened helped you find the wrong turn.",
  },
  {
    id: "repeat",
    title: "Too many commands",
    copy: "Trace the little square and return Maro to the starting tile.",
    concept: "Repetition",
    start: { x: 1, y: 1, direction: "E" },
    goal: null,
    route: [[1, 1], [2, 1], [2, 2], [1, 2]],
    maxSlots: 6,
    initialProgram: [],
    status: "The square needs 8 commands, but you have only 6 slots.",
    builderHint: "Try building the route with the commands you already know.",
    explanationTitle: "Repeats make patterns shorter.",
    explanation: "Repeat 4× turned eight actions into one reusable instruction block.",
  },
]);

export function cloneProgram(program) {
  return program.map((item) =>
    typeof item === "string"
      ? item
      : { type: item.type, count: item.count, body: [...item.body] },
  );
}
