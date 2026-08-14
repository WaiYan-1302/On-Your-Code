import test from "node:test";
import assert from "node:assert/strict";
import { COMMANDS, GameEngine, flattenProgram } from "../js/game-engine.js";

test("challenge 1 reaches its lantern in four ordered commands", () => {
  const engine = new GameEngine({
    start: { x: 0, y: 3, direction: "E" },
  });
  [
    COMMANDS.MOVE,
    COMMANDS.MOVE,
    COMMANDS.TURN_RIGHT,
    COMMANDS.MOVE,
  ].forEach((command) => engine.execute(command));

  assert.deepEqual(engine.snapshot(), { x: 2, y: 4, direction: "S" });
});

test("challenge 2's wrong command stops Maro at the predicted tile", () => {
  const engine = new GameEngine({
    start: { x: 0, y: 4, direction: "N" },
  });
  [
    COMMANDS.MOVE,
    COMMANDS.MOVE,
    COMMANDS.TURN_LEFT,
    COMMANDS.MOVE,
    COMMANDS.MOVE,
  ].forEach((command) => engine.execute(command));

  assert.deepEqual(engine.snapshot(), { x: 0, y: 2, direction: "W" });
});

test("repairing challenge 2's single wrong turn reaches the lantern", () => {
  const engine = new GameEngine({
    start: { x: 0, y: 4, direction: "N" },
  });
  [
    COMMANDS.MOVE,
    COMMANDS.MOVE,
    COMMANDS.TURN_RIGHT,
    COMMANDS.MOVE,
    COMMANDS.MOVE,
  ].forEach((command) => engine.execute(command));

  assert.deepEqual(engine.snapshot(), { x: 2, y: 2, direction: "E" });
});

test("repeat 4 expands a two-command square pattern into eight actions", () => {
  const expanded = flattenProgram([
    {
      type: "REPEAT",
      count: 4,
      body: [COMMANDS.MOVE, COMMANDS.TURN_RIGHT],
    },
  ]);

  assert.equal(expanded.length, 8);
  assert.deepEqual(
    expanded.map((step) => step.command),
    [
      COMMANDS.MOVE,
      COMMANDS.TURN_RIGHT,
      COMMANDS.MOVE,
      COMMANDS.TURN_RIGHT,
      COMMANDS.MOVE,
      COMMANDS.TURN_RIGHT,
      COMMANDS.MOVE,
      COMMANDS.TURN_RIGHT,
    ],
  );
});

test("the repeated square returns Maro to his start and direction", () => {
  const start = { x: 1, y: 1, direction: "E" };
  const engine = new GameEngine({ start });
  const steps = flattenProgram([
    {
      type: "REPEAT",
      count: 4,
      body: [COMMANDS.MOVE, COMMANDS.TURN_RIGHT],
    },
  ]);
  steps.forEach(({ command }) => engine.execute(command));

  assert.deepEqual(engine.snapshot(), start);
});
