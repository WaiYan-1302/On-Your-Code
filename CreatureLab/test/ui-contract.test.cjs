const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

test("selected creatures no longer receive a circular wrapper", () => {
  assert.doesNotMatch(app, /creature\.size \+ 14/);
  assert.doesNotMatch(app, /const selected = creature\.id === world\.selectedCreatureId;[\s\S]{0,260}ctx\.arc\(0, 0/);
});

test("the lab exposes translation and localized Code controls", () => {
  assert.match(html, /code-viewer\.js/);
  assert.match(html, /\.\.\/i18n\.js/);
  assert.match(app, /window\.getSceneCode/);
  assert.match(app, /クリーチャーの行動ルール/);
  assert.match(app, /oyc-language-change/);
});
