import test from "node:test";
import assert from "node:assert/strict";
import { GridEngine, simulate, expandRepeat } from "../js/engine.js";

test("sequence route reaches expected tile", () => {
  const s = simulate({ start:{x:0,y:4,direction:"E"}, commands:["MOVE","MOVE","LEFT","MOVE"] });
  assert.deepEqual(s,{x:2,y:3,direction:"N"});
});

test("walls block movement", () => {
  const e=new GridEngine({start:{x:0,y:0,direction:"E"},walls:[[1,0]]});
  assert.equal(e.move().blocked,true);
  assert.deepEqual(e.snapshot(),{x:0,y:0,direction:"E"});
});

test("repeat expands a two-command square", () => {
  assert.deepEqual(expandRepeat(["MOVE","RIGHT"],2),["MOVE","RIGHT","MOVE","RIGHT"]);
});

test("four repeated corners return to start and direction", () => {
  const s=simulate({start:{x:1,y:1,direction:"E"},commands:expandRepeat(["MOVE","RIGHT"],4)});
  assert.deepEqual(s,{x:1,y:1,direction:"E"});
});
