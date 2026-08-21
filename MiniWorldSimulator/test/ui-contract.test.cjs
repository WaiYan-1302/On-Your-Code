const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

test("the world removes and counts starved munchers", () => {
  assert.match(app, /advanceHunger/);
  assert.match(app, /state\.entities=state\.entities\.filter/);
  assert.match(app, /state\.munchersLost\+=starved\.length/);
  assert.match(html, /id="lostStat"/);
});

test("the simulator exposes translation and Code controls", () => {
  assert.match(html, /code-viewer\.js/);
  assert.match(html, /\.\.\/i18n\.js/);
  assert.match(app, /window\.getSceneCode/);
  assert.match(app, /マンチャーは死ぬ/);
});
