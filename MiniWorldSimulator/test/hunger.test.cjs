const test = require("node:test");
const assert = require("node:assert/strict");
const { STARVATION_SECONDS, advanceHunger } = require("../hunger.js");

test("a muncher survives while the starvation timer is below the limit", () => {
  const result = advanceHunger(20, 5);
  assert.equal(result.secondsWithoutFood, 25);
  assert.equal(result.starved, false);
});

test("a muncher starves after thirty seconds without food", () => {
  const result = advanceHunger(29.5, 0.5);
  assert.equal(result.secondsWithoutFood, STARVATION_SECONDS);
  assert.equal(result.starved, true);
});

test("negative frame deltas cannot reduce hunger", () => {
  assert.deepEqual(advanceHunger(8, -2), { secondsWithoutFood: 8, starved: false });
});
