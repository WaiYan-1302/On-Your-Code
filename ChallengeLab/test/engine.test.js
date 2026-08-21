import test from "node:test";
import assert from "node:assert/strict";
import { GridEngine, simulate, expandRepeat, runColorRoute, simulateMission } from "../js/engine.js";

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

test("level 7 color rules combine conditions with movement", () => {
  const result=runColorRoute({
    start:{x:0,y:4,direction:"E"},goal:{x:4,y:0},
    colors:{"0,4":"red","0,3":"yellow","0,0":"blue","1,0":"yellow"},
    rules:{blue:"RIGHT",red:"LEFT",yellow:"MOVE2"},
  });
  assert.equal(result.solved,true);
  assert.deepEqual(result.path.at(-1),{x:4,y:0,direction:"E"});
});

test("lantern patrol only succeeds when every lantern is lit", () => {
  const result=simulateMission({
    start:{x:0,y:2,direction:"E"},goal:{x:4,y:2},
    lanterns:[[1,2],[2,2],[3,2]],commands:["MOVE","MOVE","MOVE","MOVE"],
  });
  assert.equal(result.solved,true);
  assert.equal(result.lit.size,3);
});

test("mission fails safely when a program hits a wall", () => {
  const result=simulateMission({
    start:{x:0,y:0,direction:"E"},goal:{x:2,y:0},walls:[[1,0]],lanterns:[],commands:["MOVE","MOVE"],
  });
  assert.equal(result.solved,false);
  assert.equal(result.blocked,true);
});
