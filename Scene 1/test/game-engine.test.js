import test from "node:test";
import assert from "node:assert/strict";
import { COMMANDS, GameEngine } from "../js/game-engine.js";

test("executes four commands in order", () => {
  const engine = new GameEngine();
  [
    COMMANDS.MOVE,
    COMMANDS.MOVE,
    COMMANDS.TURN_RIGHT,
    COMMANDS.MOVE,
  ].forEach((command) => engine.execute(command));

  assert.deepEqual(engine.snapshot(), { x: 2, y: 3, direction: "S" });
});

test("turning left wraps from north to west", () => {
  const engine = new GameEngine({
    start: { x: 2, y: 2, direction: "N" },
  });
  engine.execute(COMMANDS.TURN_LEFT);
  assert.equal(engine.snapshot().direction, "W");
});

test("the mascot cannot move beyond the board", () => {
  const engine = new GameEngine({
    start: { x: 0, y: 0, direction: "N" },
  });
  const result = engine.execute(COMMANDS.MOVE);
  assert.equal(result.blocked, true);
  assert.deepEqual(engine.snapshot(), { x: 0, y: 0, direction: "N" });
});

test("reset returns the mascot to its start state", () => {
  const engine = new GameEngine();
  engine.execute(COMMANDS.MOVE);
  engine.reset();
  assert.deepEqual(engine.snapshot(), { x: 0, y: 2, direction: "E" });
});
