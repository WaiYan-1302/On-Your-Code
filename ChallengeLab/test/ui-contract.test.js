import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const app = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const challenges = readFileSync(new URL("../js/challenges.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const i18n = readFileSync(new URL("../../i18n.js", import.meta.url), "utf8");

test("all Challenge Lab levels are available from the beginning", () => {
  assert.doesNotMatch(app, /state\.unlocked/);
  assert.match(app, /b\.disabled=state\.busy/);
  assert.doesNotMatch(app, /if\(index>.*unlocked/);
});

test("the well-done panel stays hidden until a puzzle is solved", () => {
  assert.match(html, /id="explanation-card"[^>]*hidden/);
  assert.match(html, />WELL DONE</);
  assert.match(css, /\.explanation-card\[hidden\]\s*\{\s*display:none/);
  assert.match(app, /function complete[\s\S]*explanationCard\.hidden=false/);
  assert.match(app, /function load[\s\S]*explanationCard\.hidden=true/);
});

test("levels 7 through 10 use the revised Day 2 progression", () => {
  assert.match(app, /colors:renderColors/);
  assert.match(app, /patrol:renderPatrol/);
  assert.match(app, /"repair-patrol":renderRepairPatrol/);
  assert.match(app, /"mission-builder":renderMissionBuilder/);
  assert.match(app, /Place Maro/);
  assert.match(app, /Test mission/);
  assert.doesNotMatch(challenges, /id: "(variable|function|efficiency|generalize)"/);
  assert.doesNotMatch(app, /function render(Variable|Function|Efficiency|Generalize)/);
});

test("the board visually exposes colors and lantern state", () => {
  assert.match(css, /\.tile\.color-blue/);
  assert.match(css, /\.tile\.lantern\.lit/);
});

test("revised missions and Code pseudocode are localized in Japanese", () => {
  assert.match(i18n, /"Follow the Colors": "色のルールをたどろう"/);
  assert.match(i18n, /"Build a Mission": "ミッションを作ろう"/);
  assert.match(app, /"ワークショップまで繰り返す"/);
  assert.match(app, /operationPseudocode\[currentLanguage\(\)\]/);
  assert.doesNotMatch(app, /FUNCTION name\(steps\)|VARIABLE name = value/);
  assert.match(app, /oyc-language-change/);
});
