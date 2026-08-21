import { CHALLENGES } from "./challenges.js";
import { GridEngine, expandRepeat, runColorRoute, simulateMission } from "./engine.js";

const board = document.querySelector("#board");
const mascot = document.querySelector("#mascot");
const status = document.querySelector("#status");
const boardNote = document.querySelector("#board-note");
const workspace = document.querySelector("#workspace");
const runButton = document.querySelector("#run-button");
const resetButton = document.querySelector("#reset-button");
const hintButton = document.querySelector("#hint-button");
const explanationCard = document.querySelector("#explanation-card");
const nextButton = document.querySelector("#next-button");
const progress = document.querySelector("#challenge-progress");

const commandLabel = { MOVE: "↑ MOVE", LEFT: "↶ LEFT", RIGHT: "↷ RIGHT" };
const state = {
  index: 0,
  completed: new Set(JSON.parse(localStorage.getItem("oyc-smart-complete") || "[]")),
  data: {},
  engine: new GridEngine(),
  busy: false,
};
const scenePseudocode = {
  en: {
  sequence: ["RUN each instruction in order", "MOVE()", "MOVE()", "TURN_LEFT()", "MOVE()"],
  trace: ["PREDICT(final_position)", "RUN(program)", "COMPARE(prediction, position)"],
  debug: ["RUN(program)", "FIND first wrong instruction", "REPLACE(instruction)", "RUN(program)"],
  loop: ["REPEAT(4):", "  MOVE()", "  TURN_RIGHT()", "END_REPEAT"],
  parameter: ["MOVE(horizontal_distance)", "TURN_RIGHT()", "MOVE(vertical_distance)"],
  conditional: ["REPEAT until goal:", "  IF wall_ahead:", "    TURN_RIGHT()", "  ELSE:", "    MOVE()"],
  colors: ["REPEAT UNTIL GOAL", "  IF BLUE: TURN RIGHT", "  IF RED: TURN LEFT", "  IF YELLOW: MOVE 2", "  MOVE"],
  "lantern-patrol": ["REPEAT UNTIL AT WORKSHOP", "  MOVE", "  IF ON LANTERN", "    LIGHT LANTERN"],
  "repair-patrol": ["REPEAT UNTIL AT WORKSHOP", "  IF ON LANTERN", "    LIGHT LANTERN", "  MOVE"],
  "mission-builder": ["DESIGN(world)", "BUILD(program)", "TEST mission", "EXPLAIN(rule)", "LET another camper try"],
  },
  ja: {
    sequence: ["命令を上から順に実行", "MOVE()", "MOVE()", "TURN_LEFT()", "MOVE()"],
    trace: ["最後の位置を予測", "プログラムを実行", "予測と実際の位置を比べる"],
    debug: ["プログラムを実行", "最初のまちがいを探す", "命令を置き換える", "もう一度実行"],
    loop: ["4回 繰り返す:", "  MOVE()", "  TURN_RIGHT()", "繰り返し終了"],
    parameter: ["MOVE(横の距離)", "TURN_RIGHT()", "MOVE(縦の距離)"],
    conditional: ["ゴールまで繰り返す:", "  もし前が壁なら:", "    TURN_RIGHT()", "  それ以外:", "    MOVE()"],
    colors: ["ゴールまで繰り返す", "  もし青なら: TURN RIGHT", "  もし赤なら: TURN LEFT", "  もし黄なら: MOVE 2", "  MOVE"],
    "lantern-patrol": ["ワークショップまで繰り返す", "  MOVE", "  もしランタンの上なら", "    ランタンをともす"],
    "repair-patrol": ["ワークショップまで繰り返す", "  もしランタンの上なら", "    ランタンをともす", "  MOVE"],
    "mission-builder": ["世界をデザイン", "プログラムを作る", "ミッションをテスト", "ルールを説明", "ほかのキャンパーにも試してもらう"],
  },
};

const operationPseudocode = {
  en: [
    "MOVE(distance = 1):\n  REPEAT distance TIMES:\n    next = position + direction\n    IF next is not a wall:\n      position = next",
    "TURN_LEFT():\n  direction = previous compass direction",
    "TURN_RIGHT():\n  direction = next compass direction",
    "REPEAT UNTIL(condition):\n  CHECK condition after each cycle\n  STOP when condition is true",
    "IF(condition):\n  CHECK current game state\n  RUN only the matching action",
    "LIGHT_LANTERN():\n  IF standing on a lantern:\n    mark that lantern as lit",
  ],
  ja: [
    "MOVE(距離 = 1):\n  距離の回数だけ繰り返す:\n    次の位置 = 現在地 + 向き\n    もし次が壁でなければ:\n      現在地 = 次の位置",
    "TURN_LEFT():\n  向き = 1つ前の方角",
    "TURN_RIGHT():\n  向き = 1つ次の方角",
    "条件まで繰り返す:\n  1周ごとに条件を確かめる\n  条件が本当になったら止まる",
    "もし(条件):\n  今のゲーム状態を確かめる\n  条件に合う動作だけを実行",
    "ランタンをともす():\n  もしランタンの上にいれば:\n    そのランタンを点灯済みにする",
  ],
};

function currentLanguage() {
  return document.documentElement.lang === "ja" ? "ja" : "en";
}

const levelCode = {
  en: {
    actions: [["RIGHT", "TURN RIGHT"], ["LEFT", "TURN LEFT"], ["MOVE2", "MOVE 2"]],
    colors: { blue: "IF BLUE", red: "IF RED", yellow: "IF YELLOW" },
    colorLoop: "REPEAT UNTIL GOAL → check color rules → MOVE",
    patrol: [
      ["correct", "REPEAT UNTIL AT WORKSHOP\n  MOVE\n  IF ON LANTERN\n    LIGHT LANTERN"],
      ["stop", "IF ON LANTERN\n  LIGHT LANTERN\nMOVE once"],
      ["skip", "REPEAT UNTIL AT WORKSHOP\n  MOVE"],
    ],
    repair: ["REPEAT UNTIL AT WORKSHOP", "IF ON LANTERN", "LIGHT LANTERN", "MOVE"],
  },
  ja: {
    actions: [["RIGHT", "右を向く"], ["LEFT", "左を向く"], ["MOVE2", "2マス進む"]],
    colors: { blue: "もし青なら", red: "もし赤なら", yellow: "もし黄なら" },
    colorLoop: "ゴールまで繰り返す → 色のルールを確認 → MOVE",
    patrol: [
      ["correct", "ワークショップまで繰り返す\n  MOVE\n  もしランタンの上なら\n    ランタンをともす"],
      ["stop", "もしランタンの上なら\n  ランタンをともす\n1回だけ MOVE"],
      ["skip", "ワークショップまで繰り返す\n  MOVE"],
    ],
    repair: ["ワークショップまで繰り返す", "もしランタンの上なら", "ランタンをともす", "MOVE"],
  },
};

window.getSceneCode = () => ({
  title: `CHALLENGE ${state.index + 1} · ${challenge().title}`,
  steps: scenePseudocode[currentLanguage()][challenge().id] || ["THINK()", "TEST()", "CHANGE()"],
  operations: operationPseudocode[currentLanguage()],
});

function saveProgress() {
  localStorage.setItem("oyc-smart-complete", JSON.stringify([...state.completed]));
}
function challenge() { return CHALLENGES[state.index]; }
function say(text) { status.textContent = text; }
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

function buildTiles() {
  [...board.querySelectorAll(".tile")].forEach(el => el.remove());
  const c = challenge();
  const walls = c.walls || [];
  for (let y=0; y<5; y++) for (let x=0; x<5; x++) {
    const tile = document.createElement("button");
    tile.type = "button"; tile.className = "tile"; tile.dataset.x=x; tile.dataset.y=y;
    tile.setAttribute("aria-label", `column ${x+1}, row ${y+1}`);
    if (c.goal && c.goal.x===x && c.goal.y===y) tile.classList.add("goal");
    if (walls.some(([wx,wy]) => wx===x && wy===y)) tile.classList.add("wall");
    const color=c.colors?.[`${x},${y}`]; if(color) tile.classList.add(`color-${color}`);
    if(c.lanterns?.some(([lx,ly])=>lx===x&&ly===y)) tile.classList.add("lantern");
    board.insertBefore(tile, mascot);
  }
}
function setMascotState(next) {
  state.engine.state={...next}; renderMascot();
}
async function animatePath(path, { tick=260, lightLanterns=false }={}) {
  if(state.busy) return;
  state.busy=true; disableAll(true);
  board.querySelectorAll(".tile.lit").forEach(tile=>tile.classList.remove("lit"));
  for(const next of path){
    setMascotState(next); mascot.classList.add("walking");
    if(lightLanterns) board.querySelector(`.tile[data-x="${next.x}"][data-y="${next.y}"]`)?.classList.add("lit");
    await wait(tick); mascot.classList.remove("walking");
  }
  state.busy=false; disableAll(false);
}
function renderMascot() {
  const s = state.engine.snapshot();
  mascot.style.setProperty("--x", s.x); mascot.style.setProperty("--y", s.y); mascot.dataset.direction=s.direction;
}
function setupEngine() {
  const c = challenge();
  const start = c.start || {x:0,y:4,direction:"E"};
  state.engine = new GridEngine({ size:5, start, walls:c.walls || [] });
  renderMascot();
}
function markGoal(goal) {
  if (!goal) return;
  const tile = board.querySelector(`.tile[data-x="${goal.x}"][data-y="${goal.y}"]`);
  tile?.classList.add("goal");
}
async function animateCommands(commands, { reset=true, tick=330 }={}) {
  if (state.busy) return;
  state.busy = true; disableAll(true);
  if (reset) state.engine.reset(challenge().start || state.engine.start);
  renderMascot();
  for (const cmd of commands) {
    mascot.classList.toggle("walking", cmd==="MOVE");
    state.engine.execute(cmd); renderMascot();
    await wait(tick); mascot.classList.remove("walking");
  }
  state.busy=false; disableAll(false);
}
function disableAll(flag) {
  runButton.disabled = flag;
  resetButton.disabled = flag;
  hintButton.disabled = flag;
  [...workspace.querySelectorAll("button")].forEach(b => b.disabled=flag);
  [...progress.querySelectorAll("button")].forEach(b => b.disabled=flag);
}
function complete(title, copy) {
  state.completed.add(state.index); saveProgress();
  explanationCard.hidden=false;
  document.querySelector("#explanation-title").textContent=title || challenge().concept;
  document.querySelector("#explanation-copy").textContent=copy || challenge().learn;
  nextButton.textContent = state.index===9 ? "All challenges complete ✓" : "Next challenge →";
  say("Well done! Challenge solved.");
  renderProgress();
  explanationCard.scrollIntoView({behavior:"smooth",block:"nearest"});
}
function fail(text="Not yet. Use what you observed and change one thing.") { say(text); }

function renderProgress() {
  progress.replaceChildren();
  CHALLENGES.forEach((c,i)=>{
    const b=document.createElement("button"); b.type="button"; b.className="progress-step"; b.textContent=i+1; b.title=`${i+1}. ${c.title}`;
    if (i===state.index) b.classList.add("is-current"); if (state.completed.has(i)) b.classList.add("is-complete");
    b.disabled=state.busy;
    b.addEventListener("click",()=>load(i)); progress.append(b);
  });
}
function renderHeader() {
  const c=challenge();
  document.querySelector("#mission-number").textContent=`CHALLENGE ${state.index+1} OF 10`;
  document.querySelector("#mission-title").textContent=c.title;
  document.querySelector("#mission-copy").textContent=c.prompt;
  document.querySelector("#concept-label").textContent=c.concept;
  document.querySelector("#difficulty-label").textContent=`LEVEL ${state.index+1}`;
  document.querySelector("#workspace-title").textContent = c.kind==="prediction" ? "Predict the result" : c.kind==="debug" ? "Repair the algorithm" : "Your algorithm";
}
function block(cmd, text=commandLabel[cmd], cls="") {
  const b=document.createElement("button"); b.type="button"; b.className=`block ${cls || (cmd==="MOVE"?"move":"turn")}`; b.dataset.command=cmd; b.innerHTML=`<strong>${text}</strong>`; return b;
}
function strip(program, slots=program.length) {
  const wrap=document.createElement("div"); wrap.className="program-strip";
  for(let i=0;i<slots;i++){
    const s=document.createElement("div"); s.className="slot";
    if(program[i]) { s.classList.add("filled"); s.textContent=commandLabel[program[i]] || program[i]; }
    else s.textContent=i+1;
    wrap.append(s);
  }
  return wrap;
}
function choice(text, value, full=false) {
  const b=document.createElement("button"); b.type="button"; b.className=`choice${full?" full":""}`; b.dataset.value=value; b.textContent=text; return b;
}

function renderBuilder() {
  const c=challenge(); state.data.program=[];
  const programBox=document.createElement("div"); workspace.append(programBox);
  const title=document.createElement("p"); title.className="palette-title"; title.textContent="PROGRAM"; workspace.prepend(title);
  const ptitle=document.createElement("p"); ptitle.className="palette-title"; ptitle.textContent="COMMANDS";
  const palette=document.createElement("div"); palette.className="block-row";
  c.pool.forEach(cmd=>{
    const b=block(cmd); b.addEventListener("click",()=>{
      if(state.data.program.length>=c.slots) return;
      state.data.program.push(cmd); redraw();
    }); palette.append(b);
  });
  workspace.append(ptitle,palette);
  function redraw(){ programBox.replaceChildren(strip(state.data.program,c.slots)); }
  redraw();
  runButton.onclick=async()=>{
    if(state.data.program.length!==c.slots) return fail("Fill all four program slots first.");
    await animateCommands(state.data.program);
    const s=state.engine.snapshot();
    if(s.x===c.goal.x&&s.y===c.goal.y) complete(); else fail("The computer followed your order exactly—but the order did not reach the beacon.");
  };
}

function renderPrediction() {
  const c=challenge(); state.data.prediction=null;
  workspace.append(strip(c.fixed));
  const code=document.createElement("div"); code.className="hint-box"; code.textContent="Tap one board tile first. Only then can you test the program."; workspace.append(code);
  board.querySelectorAll(".tile").forEach(t=>t.addEventListener("click",()=>{
    board.querySelectorAll(".tile").forEach(x=>x.classList.remove("predicted")); t.classList.add("predicted");
    state.data.prediction={x:Number(t.dataset.x),y:Number(t.dataset.y)}; say("Prediction saved. Now test it.");
  }));
  runButton.onclick=async()=>{
    if(!state.data.prediction) return fail("Predict a final tile before running.");
    await animateCommands(c.fixed);
    const good=state.data.prediction.x===c.answer.x&&state.data.prediction.y===c.answer.y;
    if(good) complete(); else fail("Your prediction and the execution differ. Trace each command again from Maro's starting direction.");
  };
}

function renderDebug() {
  const c=challenge(); state.data.program=[...c.fixed]; state.data.selected=null;
  const box=document.createElement("div"); box.className="program-strip"; workspace.append(box);
  const palette=document.createElement("div"); palette.className="block-row"; ["LEFT","RIGHT"].forEach(cmd=>{
    const b=block(cmd); b.addEventListener("click",()=>{
      if(state.data.selected===null) return fail("Select the command you want to replace first.");
      state.data.program[state.data.selected]=cmd; state.data.selected=null; redraw(); say("Replacement made. Test the program.");
    }); palette.append(b);
  }); workspace.append(palette);
  function redraw(){
    box.replaceChildren(); state.data.program.forEach((cmd,i)=>{
      const s=document.createElement("button"); s.type="button"; s.className="slot filled"; s.textContent=commandLabel[cmd];
      if(i===state.data.selected) s.classList.add("selected");
      s.addEventListener("click",()=>{state.data.selected=i;redraw();say(`Command ${i+1} selected.`)}); box.append(s);
    });
  } redraw();
  runButton.onclick=async()=>{
    await animateCommands(state.data.program);
    const s=state.engine.snapshot();
    if(s.x===c.goal.x&&s.y===c.goal.y) complete(); else fail("Still not at the beacon. Look for the first point where the path turns the wrong way.");
  };
}

function renderLoop() {
  state.data.loopBody=[null,null]; state.data.count=2;
  const card=document.createElement("div"); card.className="loop-card"; workspace.append(card);
  const palette=document.createElement("div"); palette.className="block-row";
  ["MOVE","RIGHT","LEFT"].forEach(cmd=>{ const b=block(cmd); b.addEventListener("click",()=>{ const i=state.data.loopBody.indexOf(null); if(i>=0){state.data.loopBody[i]=cmd; redraw();} }); palette.append(b); });
  workspace.append(palette);
  function redraw(){
    card.innerHTML=`<div class="loop-line"><span class="block loop">↻ REPEAT</span><div class="value-pills" id="counts"></div></div><div class="program-strip" id="body"></div>`;
    const counts=card.querySelector("#counts"); [2,3,4,5].forEach(n=>{const b=document.createElement("button");b.type="button";b.className=`mini-button${state.data.count===n?" active":""}`;b.textContent=`×${n}`;b.onclick=()=>{state.data.count=n;redraw()};counts.append(b)});
    const body=card.querySelector("#body"); body.append(strip(state.data.loopBody,2));
  } redraw();
  runButton.onclick=async()=>{
    if(state.data.loopBody.some(x=>!x)) return fail("Put two commands inside the loop.");
    const commands=expandRepeat(state.data.loopBody,state.data.count); await animateCommands(commands);
    const s=state.engine.snapshot();
    const start=challenge().start;
    if(state.data.count===4&&state.data.loopBody[0]==="MOVE"&&state.data.loopBody[1]==="RIGHT"&&s.x===start.x&&s.y===start.y) complete();
    else fail("Watch the shape Maro traced. What tiny pattern must repeat to close a square?");
  };
}

function renderParameter() {
  state.data.a=2; state.data.b=2;
  const card=document.createElement("div"); card.className="param-card"; workspace.append(card);
  function redraw(){
    card.innerHTML=`<div class="param-line"><span class="block move">MOVE <b>${state.data.a}</b></span><span class="block turn">↶ LEFT</span><span class="block move">MOVE <b>${state.data.b}</b></span></div><p class="palette-title">SET THE TWO VALUES</p><div id="valuesA" class="value-pills"></div><div id="valuesB" class="value-pills" style="margin-top:6px"></div>`;
    [["valuesA","a"],["valuesB","b"]].forEach(([id,key])=>{ const wrap=card.querySelector(`#${id}`); [1,2,3,4].forEach(n=>{const b=document.createElement("button");b.type="button";b.className=`mini-button${state.data[key]===n?" active":""}`;b.textContent=`${key.toUpperCase()}=${n}`;b.onclick=()=>{state.data[key]=n;redraw()};wrap.append(b);}); });
  } redraw();
  runButton.onclick=async()=>{
    const commands=[...Array(state.data.a).fill("MOVE"),"LEFT",...Array(state.data.b).fill("MOVE")]; await animateCommands(commands);
    const s=state.engine.snapshot(); if(s.x===4&&s.y===2) complete(); else fail("The block structure is right. Only the parameter values need changing.");
  };
}

function renderConditional() {
  state.data.choice=null;
  const grid=document.createElement("div"); grid.className="choice-grid";
  const options=[
    ["A","Always MOVE. If blocked, try MOVE again."],
    ["B","IF wall ahead → TURN RIGHT, ELSE → MOVE."],
    ["C","IF wall ahead → TURN LEFT, ELSE → MOVE."],
    ["D","TURN RIGHT after every MOVE."],
  ];
  options.forEach(([v,t])=>{const b=choice(t,v);b.onclick=()=>{state.data.choice=v;grid.querySelectorAll("button").forEach(x=>x.classList.toggle("selected",x===b));};grid.append(b)});
  workspace.append(grid);
  runButton.onclick=async()=>{
    if(!state.data.choice) return fail("Choose one rule first.");
    state.engine.reset(challenge().start); renderMascot();
    let ticks=0;
    while(ticks<16){
      const e=state.engine; const v=state.data.choice;
      let cmd="MOVE";
      if(v==="B") cmd=e.wallAhead()?"RIGHT":"MOVE";
      if(v==="C") cmd=e.wallAhead()?"LEFT":"MOVE";
      if(v==="D") cmd=ticks%2===0?"MOVE":"RIGHT";
      e.execute(cmd); renderMascot(); await wait(260); ticks++;
      if(e.state.x===2&&e.state.y===4) return complete();
    }
    fail("That rule does not reliably get around the wall. Which one looks at the current situation before choosing?");
  };
}

function renderColors() {
  const c=challenge(); state.data.rules={blue:null,red:null,yellow:null};
  const card=document.createElement("div"); card.className="rule-card"; workspace.append(card);
  const copy=levelCode[currentLanguage()];
  const actions=copy.actions;
  function redraw(){
    card.replaceChildren();
    Object.keys(state.data.rules).forEach(color=>{
      const row=document.createElement("div"); row.className="rule-row";
      row.innerHTML=`<strong class="color-label ${color}">${copy.colors[color]}</strong>`;
      const picks=document.createElement("div"); picks.className="value-pills";
      actions.forEach(([value,label])=>{const b=document.createElement("button");b.type="button";b.className=`mini-button${state.data.rules[color]===value?" active":""}`;b.textContent=label;b.onclick=()=>{state.data.rules[color]=value;redraw();};picks.append(b)});
      row.append(picks);card.append(row);
    });
    const code=document.createElement("div");code.className="code-line";code.textContent=copy.colorLoop;card.append(code);
  } redraw();
  runButton.onclick=async()=>{
    if(Object.values(state.data.rules).some(x=>!x)) return fail("Give all three colors an instruction first.");
    const result=runColorRoute({start:c.start,goal:c.goal,colors:c.colors,rules:state.data.rules});
    await animatePath(result.path);
    if(result.solved) complete(); else fail("That color map sends Maro off the route. Watch the tile where the direction first changes.");
  };
}

function patrolPath() {
  const c=challenge();
  return simulateMission({start:c.start,goal:c.goal,lanterns:c.lanterns,commands:expandRepeat(["MOVE"],4)});
}

function renderPatrol() {
  state.data.choice=null;
  const options=levelCode[currentLanguage()].patrol;
  const list=document.createElement("div");list.className="candidate-list";
  options.forEach(([id,code])=>{const b=choice(code,id,true);b.classList.add("code-choice");b.onclick=()=>{state.data.choice=id;list.querySelectorAll("button").forEach(x=>x.classList.toggle("selected",x===b));};list.append(b)});workspace.append(list);
  runButton.onclick=async()=>{
    if(!state.data.choice) return fail("Choose the patrol program you want to test.");
    if(state.data.choice==="stop"){await animatePath(patrolPath().path.slice(0,2),{lightLanterns:true});return fail("Maro moved once, but there was no loop to continue the patrol.");}
    const result=patrolPath();await animatePath(result.path,{lightLanterns:state.data.choice==="correct"});
    if(state.data.choice==="correct"&&result.solved) complete();else fail("Maro reached the workshop, but the lantern condition was missing.");
  };
}

function renderRepairPatrol() {
  state.data.moveOutside=false;
  const card=document.createElement("div");card.className="indent-card";workspace.append(card);
  function redraw(){
    const lines=levelCode[currentLanguage()].repair;
    card.innerHTML=`<div class="code-line patrol-code">${lines[0]}<br>&nbsp;&nbsp;${lines[1]}<br>&nbsp;&nbsp;&nbsp;&nbsp;${lines[2]}<br><button type="button" id="indent-move" class="indent-command ${state.data.moveOutside?"fixed":"broken"}">${state.data.moveOutside?"&nbsp;&nbsp;":"&nbsp;&nbsp;&nbsp;&nbsp;"}${lines[3]}</button></div><p>${state.data.moveOutside?"MOVE is now part of the loop.":"MOVE is inside IF ON LANTERN."}</p>`;
    card.querySelector("#indent-move").onclick=()=>{state.data.moveOutside=!state.data.moveOutside;redraw();say(state.data.moveOutside?"Grouping changed. Test the repair.":"MOVE returned inside the condition.");};
  } redraw();
  runButton.onclick=async()=>{
    if(!state.data.moveOutside){await animatePath([challenge().start],{lightLanterns:true});return fail("Maro is not on a lantern, so the whole IF group is skipped—including MOVE.");}
    const result=patrolPath();await animatePath(result.path,{lightLanterns:true});if(result.solved) complete();
  };
}

function renderMissionBuilder() {
  const c=challenge();
  state.data={mode:"lantern",start:{...c.start},goal:{...c.goal},lanterns:c.lanterns.map(p=>[...p]),walls:[],program:[],explanation:null};
  const editor=document.createElement("div");editor.className="mission-editor";
  const toolRow=document.createElement("div");toolRow.className="builder-tools";
  [["start","Place Maro"],["goal","Place workshop"],["lantern","Add lantern"],["wall","Add wall"],["erase","Erase"]].forEach(([id,label])=>{const b=document.createElement("button");b.type="button";b.className=`mini-button${id===state.data.mode?" active":""}`;b.textContent=label;b.onclick=()=>{state.data.mode=id;toolRow.querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));};toolRow.append(b)});editor.append(toolRow);
  const direction=document.createElement("div");direction.className="direction-row";direction.innerHTML="<span>START FACING</span>";
  ["N","E","S","W"].forEach(d=>{const b=document.createElement("button");b.type="button";b.className=`mini-button${d===state.data.start.direction?" active":""}`;b.textContent=d;b.onclick=()=>{state.data.start.direction=d;direction.querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));setupMissionBoard();};direction.append(b)});editor.append(direction);workspace.append(editor);
  const programBox=document.createElement("div");workspace.append(programBox);
  const palette=document.createElement("div");palette.className="block-row";
  ["MOVE","LEFT","RIGHT"].forEach(cmd=>{const b=block(cmd);b.onclick=()=>{if(state.data.program.length<20){state.data.program.push(cmd);redrawProgram();}};palette.append(b)});
  const undo=choice("Undo","undo");undo.onclick=()=>{state.data.program.pop();redrawProgram();};
  const clear=choice("Clear","clear");clear.onclick=()=>{state.data.program=[];redrawProgram();};palette.append(undo,clear);workspace.append(palette);
  const explain=document.createElement("div");explain.className="choice-grid explain-grid";
  [["route","I planned the route in small steps."],["test","I tested and revised my program."],["objects","My rule visits every required object."]].forEach(([id,label])=>{const b=choice(label,id,true);b.onclick=()=>{state.data.explanation=id;explain.querySelectorAll("button").forEach(x=>x.classList.toggle("selected",x===b));};explain.append(b)});workspace.append(explain);
  function redrawProgram(){programBox.replaceChildren();const label=document.createElement("p");label.className="palette-title";label.textContent=`PROGRAM · ${state.data.program.length}/20 COMMANDS`;programBox.append(label,strip(state.data.program,Math.max(6,state.data.program.length)));}
  function setupMissionBoard(){
    const d=state.data;state.engine=new GridEngine({size:5,start:d.start,walls:d.walls});[...board.querySelectorAll(".tile")].forEach(t=>t.remove());
    for(let y=0;y<5;y++)for(let x=0;x<5;x++){const t=document.createElement("button");t.type="button";t.className="tile";t.dataset.x=x;t.dataset.y=y;t.setAttribute("aria-label",`column ${x+1}, row ${y+1}`);if(d.goal.x===x&&d.goal.y===y)t.classList.add("goal");if(d.walls.some(([a,b])=>a===x&&b===y))t.classList.add("wall");if(d.lanterns.some(([a,b])=>a===x&&b===y))t.classList.add("lantern");t.onclick=()=>editTile(x,y);board.insertBefore(t,mascot);}renderMascot();
  }
  function editTile(x,y){
    const d=state.data;const here=([a,b])=>a===x&&b===y;d.walls=d.walls.filter(p=>!here(p));d.lanterns=d.lanterns.filter(p=>!here(p));
    if(d.mode==="start")d.start={x,y,direction:d.start.direction};else if(d.mode==="goal")d.goal={x,y};else if(d.mode==="lantern"&&!(d.start.x===x&&d.start.y===y)&&!(d.goal.x===x&&d.goal.y===y)&&d.lanterns.length<3)d.lanterns.push([x,y]);else if(d.mode==="wall"&&!(d.start.x===x&&d.start.y===y)&&!(d.goal.x===x&&d.goal.y===y))d.walls.push([x,y]);setupMissionBoard();
  }
  redrawProgram();setupMissionBoard();runButton.textContent="▶ Test mission";
  runButton.onclick=async()=>{
    const d=state.data;if(d.lanterns.length<2)return fail("Place at least two lanterns in your mission.");if(!d.program.length)return fail("Build a program before testing the mission.");if(!d.explanation)return fail("Choose the sentence that best explains your design rule.");
    const result=simulateMission({start:d.start,goal:d.goal,walls:d.walls,lanterns:d.lanterns,commands:d.program});await animatePath(result.path,{lightLanterns:true});
    if(result.solved)complete("Mission designed!","Your mission is possible: Maro reached the workshop, every lantern was lit, and you explained the rule behind your design.");else if(result.blocked)fail("Maro hit a wall or the edge. Revise the route or the program, then test again.");else fail(`Maro lit ${result.lit.size}/${d.lanterns.length} lanterns and did not finish correctly. Change one thing and retest.`);
  };
}

const renderers={builder:renderBuilder,prediction:renderPrediction,debug:renderDebug,loop:renderLoop,parameter:renderParameter,conditional:renderConditional,colors:renderColors,patrol:renderPatrol,"repair-patrol":renderRepairPatrol,"mission-builder":renderMissionBuilder};
const hints={
  sequence:"Imagine being Maro. Which instruction changes direction before the final move?",
  trace:"Track three things after every command: x position, y position, and facing direction.",
  debug:"Find the earliest command after which Maro's route diverges from the beacon path.",
  loop:"A square repeats the same two actions four times.",
  parameter:"The route is an L shape: first horizontal distance, then vertical distance.",
  conditional:"Look for the option that asks a question before choosing an action.",
  colors:"Blue turns right, red turns left, and yellow moves twice before the loop's final MOVE.",
  "lantern-patrol":"The loop must contain MOVE and the lantern condition, so both actions repeat until the workshop.",
  "repair-patrol":"MOVE must happen whether or not Maro is standing on a lantern. Change its indentation.",
  "mission-builder":"Start with a simple route. Place two lanterns along it, then build and test the turns one at a time.",
};

function load(index){
  state.index=index; state.data={}; state.busy=false;
  explanationCard.hidden=true; workspace.replaceChildren();
  renderHeader(); buildTiles(); setupEngine(); markGoal(challenge().goal); renderProgress();
  runButton.textContent="▶ Test algorithm";
  boardNote.textContent = challenge().kind==="mission-builder" ? "Choose a tool, then tap the board to design your mission." : challenge().colors ? "Colored tiles are instructions: observe the color before moving." : challenge().lanterns ? "Lanterns glow when Maro activates them." : challenge().walls?.length ? "Dark tiles are walls. Maro cannot enter them." : "Follow position and direction; both are part of the program state.";
  say(state.completed.has(index)?"You solved this before. Try it again or inspect the idea another way.":"Think first, then test.");
  renderers[challenge().kind]();
  runButton.disabled=false;
  window.scrollTo({top:0,behavior:"smooth"});
}

resetButton.addEventListener("click",()=>load(state.index));
hintButton.addEventListener("click",()=>{
  const old=workspace.querySelector(".hint-box[data-live='1']"); if(old){old.remove();return;}
  const box=document.createElement("div");box.className="hint-box";box.dataset.live="1";box.textContent=hints[challenge().id];workspace.append(box);
});
nextButton.addEventListener("click",()=>{ if(state.index<9) load(state.index+1); });
window.addEventListener("oyc-language-change",()=>load(state.index));

load(0);
