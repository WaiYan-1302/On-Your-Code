import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

function handlerBody(id) {
  const start = app.indexOf(`${id}.addEventListener`);
  assert.notEqual(start, -1, `Missing ${id} click handler`);
  const next = app.indexOf(".addEventListener", start + 20);
  return app.slice(start, next === -1 ? app.length : next);
}

test("Clear commands does not reset Maro", () => {
  const clearHandler = handlerBody("clearButton");
  assert.match(clearHandler, /program\.length = 0/);
  assert.doesNotMatch(clearHandler, /engine\.reset\(\)/);
});

test("Reset Maro keeps the command list", () => {
  const resetHandler = handlerBody("resetButton");
  assert.match(resetHandler, /engine\.reset\(\)/);
  assert.doesNotMatch(resetHandler, /program\.length = 0/);
});

test("Maro has four dedicated directional sprite rows", () => {
  assert.match(css, /background-size:\s*400% 400%/);
  for (const direction of ["N", "E", "S", "W"]) {
    assert.match(css, new RegExp(`data-direction="${direction}"`));
  }
});
