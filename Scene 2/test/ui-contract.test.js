import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CHALLENGES } from "../js/challenges.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

test("the teaching progression has exactly three guided challenges", () => {
  assert.equal(CHALLENGES.length, 3);
  assert.deepEqual(
    CHALLENGES.map((challenge) => challenge.id),
    ["lantern", "debug", "repeat"],
  );
});

test("every completion explanation stays under two sentences", () => {
  for (const challenge of CHALLENGES) {
    const sentenceCount = challenge.explanation.split(/[.!?]+/).filter(Boolean).length;
    assert.ok(sentenceCount <= 2, `${challenge.id} explanation is too long`);
  }
});

test("prediction is required before the debugging program can run", () => {
  assert.match(app, /challenge\.id === "debug" && prediction === null/);
  assert.match(html, /tap the tile where you think Maro will stop/i);
});

test("debug replacement mode enables the palette after a program command is selected", () => {
  assert.match(
    app,
    /challenge\.id === "debug" && attempted && selectedSlot !== null/,
  );
  assert.match(app, /if \(challenge\.id === "debug"\) \{\s+button\.disabled/);
  assert.match(app, /if \(!attempted \|\| selectedSlot === null\) return/);
  assert.doesNotMatch(app, /const index = selectedSlot \?\?/);
});

test("repeat is gated behind the first unsuccessful attempt", () => {
  assert.match(app, /challenge\.id === "repeat" && !repeatUnlocked/);
  assert.match(app, /repeatUnlocked = true/);
  assert.match(html, /Repeat 4×/);
});

test("Maro uses four directional sprite rows and the final frame while idle", () => {
  assert.match(css, /background-size:\s*400% 400%/);
  assert.match(css, /background-position:\s*100% var\(--sprite-row\)/);
  for (const direction of ["N", "E", "S", "W"]) {
    assert.match(css, new RegExp(`data-direction="${direction}"`));
  }
});

test("Maro has no direction arrow above its head", () => {
  assert.doesNotMatch(html, /direction-arrow/);
  assert.doesNotMatch(css, /\.direction-arrow/);
});
