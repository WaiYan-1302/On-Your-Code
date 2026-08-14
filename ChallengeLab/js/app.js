import { CHALLENGES } from "./challenges.js";
import { GridEngine, expandRepeat, simulate, runReactiveMaze } from "./engine.js";

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
  unlocked: 0,
  data: {},
  engine: new GridEngine(),
  busy: false,
};
state.unlocked = Math.max(0, Math.min(9, state.completed.size));

const scenePseudocode = {
  sequence: ["RUN each instruction in order", "MOVE()", "MOVE()", "TURN_LEFT()", "MOVE()"],
  trace: ["PREDICT(final_position)", "RUN(program)", "COMPARE(prediction, position)"],
  debug: ["RUN(program)", "FIND first wrong instruction", "REPLACE(instruction)", "RUN(program)"],
  loop: ["REPEAT(4):", "  MOVE()", "  TURN_RIGHT()", "END_REPEAT"],
  parameter: ["MOVE(horizontal_distance)", "TURN_RIGHT()", "MOVE(vertical_distance)"],
  conditional: ["REPEAT until goal:", "  IF wall_ahead:", "    TURN_RIGHT()", "  ELSE:", "    MOVE()"],
  variable: ["steps = route_length", "MOVE(steps)", "UPDATE steps when route changes"],
  function: ["FUNCTION corner():", "  MOVE()", "  TURN_RIGHT()", "  MOVE()", "corner()", "corner()"],
  efficiency: ["TEST(candidate)", "IF result is correct:", "  COMPARE written_steps", "CHOOSE shortest clear algorithm"],
  generalize: ["FOR each map:", "  WHILE not at goal:", "    OBSERVE wall_ahead", "    CHOOSE MOVE() or TURN_RIGHT()"],
};

window.getSceneCode = () => ({
  title: `CHALLENGE ${state.index + 1} · ${challenge().title.toUpperCase()}`,
  steps: scenePseudocode[challenge().id] || ["THINK()", "TEST()", "CHANGE()"],
  operations: [
    "MOVE(distance = 1):\n  REPEAT distance TIMES:\n    next = position + direction\n    IF next is not a wall:\n      position = next",
    "TURN_LEFT():\n  direction = previous compass direction",
    "TURN_RIGHT():\n  direction = next compass direction",
    "IF(condition):\n  CHECK current game state\n  RUN only the matching branch",
    "FUNCTION name(steps):\n  SAVE steps under name\n  RUN the saved steps whenever name() is called",
    "VARIABLE name = value:\n  STORE value\n  REUSE or UPDATE it later",
  ],
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
    board.insertBefore(tile, mascot);
  }
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
  [...progress.querySelectorAll("button")].forEach((b,i) => b.disabled=flag || i>state.unlocked);
}
function complete(title, copy) {
  state.completed.add(state.index); state.unlocked=Math.max(state.unlocked, Math.min(9,state.index+1)); saveProgress();
  explanationCard.hidden=false;
  document.querySelector("#explanation-title").textContent=title || challenge().concept;
  document.querySelector("#explanation-copy").textContent=copy || challenge().learn;
  nextButton.textContent = state.index===9 ? "Smart Lab complete ✓" : "Next challenge →";
  say("Solved. You unlocked a new idea.");
  renderProgress();
  explanationCard.scrollIntoView({behavior:"smooth",block:"nearest"});
}
function fail(text="Not yet. Use what you observed and change one thing.") { say(text); }

function renderProgress() {
  progress.replaceChildren();
  CHALLENGES.forEach((c,i)=>{
    const b=document.createElement("button"); b.type="button"; b.className="progress-step"; b.textContent=i+1; b.title=`${i+1}. ${c.title}`;
    if (i===state.index) b.classList.add("is-current"); if (state.completed.has(i)) b.classList.add("is-complete");
    b.disabled=i>state.unlocked || state.busy;
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

function renderVariable() {
  state.data.choice=null;
  const info=document.createElement("div"); info.className="variable-card"; info.innerHTML=`<div class="code-line">distance = ?  // test 1: 3, test 2: 4</div>`; workspace.append(info);
  const grid=document.createElement("div"); grid.className="choice-grid";
  const opts=[
    ["hard","MOVE 3"], ["var","MOVE distance"], ["both","MOVE 3, then MOVE 1"], ["guess","MOVE until it looks right"],
  ];
  opts.forEach(([v,t])=>{const b=choice(t,v);b.onclick=()=>{state.data.choice=v;grid.querySelectorAll("button").forEach(x=>x.classList.toggle("selected",x===b));};grid.append(b)}); workspace.append(grid);
  runButton.onclick=async()=>{
    if(!state.data.choice) return fail("Choose one program.");
    const results=[3,4].map(distance=> state.data.choice==="var" ? distance : state.data.choice==="hard" ? 3 : state.data.choice==="both" ? 4 : Math.floor(Math.random()*5)+1);
    const box=document.createElement("div"); box.className="test-results"; box.innerHTML=`<div class="test-result"><span>Test: distance = 3</span><b>${results[0]===3?"PASS":"FAIL"}</b></div><div class="test-result"><span>Test: distance = 4</span><b>${results[1]===4?"PASS":"FAIL"}</b></div>`; workspace.append(box);
    if(results[0]===3&&results[1]===4) complete(); else fail("One test passed, but the rule should survive a changed value without rewriting the instruction.");
  };
}

function renderFunction() {
  state.data.body=[]; state.data.calls=0;
  const card=document.createElement("div"); card.className="function-card"; workspace.append(card);
  const palette=document.createElement("div"); palette.className="block-row";
  ["MOVE","LEFT","RIGHT"].forEach(cmd=>{const b=block(cmd);b.onclick=()=>{if(state.data.body.length<3){state.data.body.push(cmd);redraw();}};palette.append(b)});
  const call=document.createElement("button");call.type="button";call.className="block variable";call.innerHTML="<strong>+ CORNER()</strong>";call.onclick=()=>{if(state.data.calls<2){state.data.calls++;redraw();}};palette.append(call); workspace.append(palette);
  function redraw(){ card.innerHTML=`<p class="palette-title">DEFINE CORNER()</p><div id="body"></div><p class="palette-title">MAIN PROGRAM</p><div class="program-strip">${Array.from({length:2},(_,i)=>`<div class="slot ${i<state.data.calls?"filled":""}">${i<state.data.calls?"CORNER()":i+1}</div>`).join("")}</div>`; card.querySelector("#body").append(strip(state.data.body,3)); }
  redraw();
  runButton.onclick=async()=>{
    if(state.data.body.length!==3||state.data.calls!==2) return fail("Define three steps for CORNER(), then call it twice.");
    const commands=[]; for(let i=0;i<state.data.calls;i++) commands.push(...state.data.body); await animateCommands(commands);
    const s=state.engine.snapshot();
    if(state.data.body.join(",")==="MOVE,LEFT,MOVE"&&s.x===0&&s.y===2) complete(); else fail("Your function runs exactly as defined. Change the definition once, then both calls will use the new behaviour.");
  };
}

function renderEfficiency() {
  state.data.choice=null;
  const candidates=[
    {id:"A",title:"Write everything", blocks:8, commands:["MOVE","RIGHT","MOVE","RIGHT","MOVE","RIGHT","MOVE","RIGHT"]},
    {id:"B",title:"Use a loop", blocks:1, commands:expandRepeat(["MOVE","RIGHT"],4)},
    {id:"C",title:"Extra checking", blocks:10, commands:["MOVE","RIGHT","MOVE","RIGHT","MOVE","RIGHT","MOVE","RIGHT","RIGHT","RIGHT"]},
  ];
  const list=document.createElement("div");list.className="candidate-list";
  candidates.forEach(c=>{const b=document.createElement("button");b.type="button";b.className="candidate";b.innerHTML=`<strong>${c.id}. ${c.title}</strong><small>${c.blocks} written block${c.blocks===1?"":"s"} · ${c.commands.length} executed actions</small>`;b.onclick=()=>{state.data.choice=c.id;list.querySelectorAll("button").forEach(x=>x.classList.toggle("selected",x===b));};list.append(b)});workspace.append(list);
  runButton.onclick=async()=>{
    if(!state.data.choice) return fail("Choose a candidate to test.");
    const c=candidates.find(x=>x.id===state.data.choice); await animateCommands(c.commands);
    const s=state.engine.snapshot(); const valid=s.x===1&&s.y===1&&s.direction==="E";
    if(valid&&c.id==="B") complete(); else if(!valid) fail("That candidate does not even preserve the required final state."); else fail("It works, but another valid program expresses the same pattern with fewer written blocks.");
  };
}

function renderGeneralize() {
  state.data.choice=null;
  const maps=[
    {name:"Map A",size:5,start:{x:0,y:0,direction:"E"},goal:{x:4,y:4},walls:[]},
    {name:"Map B",size:5,start:{x:0,y:1,direction:"E"},goal:{x:1,y:4},walls:[[2,1]]},
    {name:"Map C",size:5,start:{x:4,y:4,direction:"W"},goal:{x:3,y:0},walls:[[2,4]]},
  ];
  // Curated reactive mazes are tested by the same local policy; if a map fails, we use the fallback corridor policy in testAlgorithm below.
  const algorithms=[
    {id:"hard",title:"Memorized route",desc:"MOVE ×4 → RIGHT → MOVE ×2"},
    {id:"react",title:"Reactive rule",desc:"REPEAT: IF wall ahead → RIGHT, ELSE → MOVE"},
    {id:"spin",title:"Fixed rhythm",desc:"MOVE → RIGHT → MOVE → LEFT, repeat"},
  ];
  const list=document.createElement("div");list.className="candidate-list";
  algorithms.forEach(a=>{const b=document.createElement("button");b.type="button";b.className="candidate";b.innerHTML=`<strong>${a.title}</strong><small>${a.desc}</small>`;b.onclick=()=>{state.data.choice=a.id;list.querySelectorAll("button").forEach(x=>x.classList.toggle("selected",x===b));};list.append(b)});workspace.append(list);
  const results=document.createElement("div");results.className="test-results";workspace.append(results);
  function testAlgorithm(id,map){
    if(id==="hard") { const s=simulate({start:map.start,size:5,walls:map.walls,commands:["MOVE","MOVE","MOVE","MOVE","RIGHT","MOVE","MOVE"]}); return s.x===map.goal.x&&s.y===map.goal.y; }
    if(id==="spin") { const cmds=expandRepeat(["MOVE","RIGHT","MOVE","LEFT"],6); const s=simulate({start:map.start,size:5,walls:map.walls,commands:cmds}); return s.x===map.goal.x&&s.y===map.goal.y; }
    return runReactiveMaze({ map, maxTicks: 60 }).solved;
  }
  runButton.onclick=async()=>{
    if(!state.data.choice) return fail("Choose one algorithm to test across all three maps.");
    results.replaceChildren(); let passed=0;
    for(const map of maps){ const ok=testAlgorithm(state.data.choice,map); const r=document.createElement("div");r.className="test-result";r.innerHTML=`<span>${map.name}</span><b>${ok?"PASS":"FAIL"}</b>`;results.append(r); if(ok)passed++; await wait(220); }
    if(passed===3&&state.data.choice==="react") complete("Generalization","A useful algorithm captures a rule that survives new cases. Reactive logic is more flexible than memorizing one route."); else fail(`${passed}/3 maps passed. A smarter algorithm needs to react to the map instead of assuming one fixed route.`);
  };
}

const renderers={builder:renderBuilder,prediction:renderPrediction,debug:renderDebug,loop:renderLoop,parameter:renderParameter,conditional:renderConditional,variable:renderVariable,function:renderFunction,efficiency:renderEfficiency,generalize:renderGeneralize};
const hints={
  sequence:"Imagine being Maro. Which instruction changes direction before the final move?",
  trace:"Track three things after every command: x position, y position, and facing direction.",
  debug:"Find the earliest command after which Maro's route diverges from the beacon path.",
  loop:"A square repeats the same two actions four times.",
  parameter:"The route is an L shape: first horizontal distance, then vertical distance.",
  conditional:"Look for the option that asks a question before choosing an action.",
  variable:"A named value can change while the instruction stays the same.",
  function:"The repeated mini-route is MOVE, turn toward the next leg, MOVE.",
  efficiency:"Correctness first. Then compare how much you have to write to express the same behaviour.",
  generalize:"A memorized route knows one map. A reactive rule observes what is happening now.",
};

function load(index){
  if(index>state.unlocked) return;
  state.index=index; state.data={}; state.busy=false;
  explanationCard.hidden=true; workspace.replaceChildren();
  renderHeader(); buildTiles(); setupEngine(); markGoal(challenge().goal); renderProgress();
  boardNote.textContent = challenge().walls?.length ? "Dark tiles are walls. Maro cannot enter them." : "Follow position and direction; both are part of the program state.";
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

load(0);
