import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const app = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

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
