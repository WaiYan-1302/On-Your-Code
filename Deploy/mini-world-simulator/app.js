const canvas = document.getElementById('worldCanvas');
const ctx = canvas.getContext('2d');

const UI = {
  toolGrid: document.getElementById('toolGrid'),
  foodRate: document.getElementById('foodRate'),
  creatureSpeed: document.getElementById('creatureSpeed'),
  beaconPower: document.getElementById('beaconPower'),
  maroReaction: document.getElementById('maroReaction'),
  foodRateValue: document.getElementById('foodRateValue'),
  speedValue: document.getElementById('speedValue'),
  beaconValue: document.getElementById('beaconValue'),
  rulePreview: document.getElementById('rulePreview'),
  pauseBtn: document.getElementById('pauseBtn'),
  resetBtn: document.getElementById('resetBtn'),
  surpriseBtn: document.getElementById('surpriseBtn'),
  dayStat: document.getElementById('dayStat'),
  creatureStat: document.getElementById('creatureStat'),
  plantStat: document.getElementById('plantStat'),
  foodStat: document.getElementById('foodStat'),
  eventLog: document.getElementById('eventLog'),
  clearLogBtn: document.getElementById('clearLogBtn'),
  ideaBtn: document.getElementById('ideaBtn'),
  ideaDialog: document.getElementById('ideaDialog'),
  closeDialogBtn: document.getElementById('closeDialogBtn')
};

const sprite = new Image();
sprite.src = 'assets/maro-directions.png';

const state = {
  paused: false,
  selectedTool: 'plant',
  entities: [],
  nextId: 1,
  elapsed: 0,
  dayLength: 24,
  day: 1,
  foodEaten: 0,
  logCooldown: 0,
  keys: { left:false, right:false, up:false, down:false },
  maro: { x: 480, y: 305, vx:0, vy:0, speed:210, dir:'down', frame:0, frameTimer:0 }
};

const config = () => ({
  foodRate: Number(UI.foodRate.value),
  speedScale: Number(UI.creatureSpeed.value),
  beaconPower: Number(UI.beaconPower.value),
  maroReaction: UI.maroReaction.value
});

function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
function rand(min,max){ return Math.random()*(max-min)+min; }
function dist(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }
function norm(dx,dy){ const l=Math.hypot(dx,dy)||1; return {x:dx/l,y:dy/l}; }
function nearest(from, list){
  let best=null, bestD=Infinity;
  for(const item of list){ const d=dist(from,item); if(d<bestD){bestD=d;best=item;} }
  return {item:best, distance:bestD};
}

function log(message){
  const line=document.createElement('div');
  line.className='log-line';
  line.textContent=message;
  UI.eventLog.prepend(line);
  while(UI.eventLog.children.length>12) UI.eventLog.removeChild(UI.eventLog.lastChild);
}

function updateLabels(){
  const beaconNames=['Off','Medium','Strong'];
  UI.foodRateValue.textContent=`${UI.foodRate.value}s`;
  UI.speedValue.textContent=`${Number(UI.creatureSpeed.value).toFixed(1)}×`;
  UI.beaconValue.textContent=beaconNames[Number(UI.beaconPower.value)];
  updateRulePreview();
}

function updateRulePreview(){
  const c=config();
  const reaction={ignore:'IGNORE MARO',follow:'MOVE TOWARD MARO',flee:'MOVE AWAY FROM MARO'}[c.maroReaction];
  const beacon={0:'OFF',1:'MEDIUM',2:'STRONG'}[c.beaconPower];
  UI.rulePreview.textContent=[
    `EVERY ${c.foodRate} SEC`,
    `→ PLANTS GROW FOOD`,
    '',
    `MUNCHER SEES RIPE PLANT`,
    `→ MOVE TO FOOD`,
    `→ EAT`,
    '',
    `DRIFTER SEES BEACON`,
    `→ PULL = ${beacon}`,
    '',
    `MARO IS NEAR`,
    `→ ${reaction}`,
    '',
    `CREATURE SPEED = ${c.speedScale.toFixed(1)}×`
  ].join('\n');
}

function makeEntity(type,x,y){
  const base={ id:state.nextId++, type, x, y };
  if(type==='plant') return {...base, ripe:true, regrowTimer:0, pulse:rand(0,6.28)};
  if(type==='muncher') return {...base, vx:rand(-40,40), vy:rand(-40,40), wanderTimer:0, energy:70, phase:rand(0,6.28)};
  if(type==='drifter') return {...base, vx:rand(-40,40), vy:rand(-40,40), wanderTimer:0, phase:rand(0,6.28)};
  if(type==='beacon') return {...base, phase:rand(0,6.28)};
  if(type==='pond') return {...base, radius:52};
  return base;
}

function placeEntity(type,x,y){
  if(state.entities.length>=35){ log('World limit reached: remove something before adding more.'); return; }
  state.entities.push(makeEntity(type,x,y));
  log(`${type[0].toUpperCase()+type.slice(1)} added.`);
  updateStats();
}

function eraseAt(x,y){
  let bestIndex=-1, bestD=Infinity;
  state.entities.forEach((e,i)=>{ const d=Math.hypot(e.x-x,e.y-y); if(d<bestD){bestD=d;bestIndex=i;} });
  if(bestIndex>=0 && bestD<58){
    const removed=state.entities.splice(bestIndex,1)[0];
    log(`${removed.type[0].toUpperCase()+removed.type.slice(1)} removed.`);
    updateStats();
  }
}

function updateStats(){
  UI.dayStat.textContent=String(state.day);
  UI.creatureStat.textContent=String(state.entities.filter(e=>e.type==='muncher'||e.type==='drifter').length);
  UI.plantStat.textContent=String(state.entities.filter(e=>e.type==='plant').length);
  UI.foodStat.textContent=String(state.foodEaten);
}

function resetWorld(){
  state.entities=[];
  state.elapsed=0;
  state.day=1;
  state.foodEaten=0;
  state.maro.x=480; state.maro.y=305; state.maro.vx=0; state.maro.vy=0;
  UI.eventLog.innerHTML='';
  log('World reset. Build something new.');
  updateStats();
}

function clearWorldQuiet(){
  state.entities=[]; state.elapsed=0; state.day=1; state.foodEaten=0;
  state.maro.x=480; state.maro.y=305; state.maro.vx=0; state.maro.vy=0;
}

function addPreset(name){
  clearWorldQuiet();
  if(name==='garden'){
    UI.foodRate.value='4'; UI.creatureSpeed.value='0.9'; UI.beaconPower.value='1'; UI.maroReaction.value='ignore';
    [[180,180],[310,410],[650,180],[790,390]].forEach(([x,y])=>placeEntity('plant',x,y));
    [[420,220],[570,360]].forEach(([x,y])=>placeEntity('muncher',x,y));
    placeEntity('drifter',740,260);
  } else if(name==='busy'){
    UI.foodRate.value='3'; UI.creatureSpeed.value='1.3'; UI.beaconPower.value='2'; UI.maroReaction.value='follow';
    [[160,180],[240,390],[720,170],[800,390]].forEach(([x,y])=>placeEntity('plant',x,y));
    [[380,180],[520,210],[400,420],[620,400]].forEach(([x,y])=>placeEntity('muncher',x,y));
    [[280,260],[680,280],[560,470]].forEach(([x,y])=>placeEntity('drifter',x,y));
    placeEntity('beacon',480,145); placeEntity('beacon',480,445);
  } else {
    UI.foodRate.value='7'; UI.creatureSpeed.value='0.7'; UI.beaconPower.value='0'; UI.maroReaction.value='flee';
    [[220,220],[740,330]].forEach(([x,y])=>placeEntity('plant',x,y));
    [[350,330],[610,230]].forEach(([x,y])=>placeEntity('drifter',x,y));
    placeEntity('pond',480,380);
  }
  updateLabels();
  updateStats();
  log(`${name[0].toUpperCase()+name.slice(1)} preset loaded.`);
}

function surprise(){
  const names=['garden','busy','quiet'];
  addPreset(names[Math.floor(Math.random()*names.length)]);
  UI.foodRate.value=String(Math.floor(rand(2,9)));
  UI.creatureSpeed.value=(Math.round(rand(6,16))/10).toFixed(1);
  UI.beaconPower.value=String(Math.floor(rand(0,3)));
  updateLabels();
  log('Surprise rules applied.');
}

function updateMaro(dt){
  let dx=0,dy=0;
  if(state.keys.left) dx--;
  if(state.keys.right) dx++;
  if(state.keys.up) dy--;
  if(state.keys.down) dy++;
  const m=state.maro;
  if(dx||dy){
    const d=norm(dx,dy); m.vx=d.x*m.speed; m.vy=d.y*m.speed;
    if(Math.abs(d.x)>Math.abs(d.y)) m.dir=d.x>0?'right':'left'; else m.dir=d.y>0?'down':'up';
    m.frameTimer+=dt; if(m.frameTimer>.13){m.frame=(m.frame+1)%4;m.frameTimer=0;}
  } else { m.vx*=.84; m.vy*=.84; m.frame=0; }
  m.x=clamp(m.x+m.vx*dt,42,canvas.width-42);
  m.y=clamp(m.y+m.vy*dt,90,canvas.height-40);
}

function pointInsidePond(entity, ponds){
  return ponds.some(p=>dist(entity,p)<p.radius);
}

function reactToMaro(entity, speed, reaction){
  const d=dist(entity,state.maro);
  if(d>120 || reaction==='ignore') return false;
  if(reaction==='follow'){
    const n=norm(state.maro.x-entity.x,state.maro.y-entity.y); entity.vx=n.x*speed; entity.vy=n.y*speed;
  } else if(reaction==='flee'){
    const n=norm(entity.x-state.maro.x,entity.y-state.maro.y); entity.vx=n.x*speed; entity.vy=n.y*speed;
  }
  return true;
}

function updatePlant(p,dt,c){
  p.pulse+=dt*2;
  if(!p.ripe){ p.regrowTimer-=dt; if(p.regrowTimer<=0){p.ripe=true; log('A plant grew new food.');} }
}

function updateMuncher(m,dt,c,plants,ponds){
  m.phase+=dt*5;
  m.wanderTimer-=dt;
  const speed=74*c.speedScale*(pointInsidePond(m,ponds)?.48:1);
  if(!reactToMaro(m,speed,c.maroReaction)){
    const ripe=plants.filter(p=>p.ripe);
    const near=nearest(m,ripe);
    if(near.item){
      const n=norm(near.item.x-m.x,near.item.y-m.y); m.vx=n.x*speed; m.vy=n.y*speed;
      if(near.distance<28){
        near.item.ripe=false; near.item.regrowTimer=c.foodRate; state.foodEaten++; m.energy=100; log('A muncher found food.'); updateStats();
      }
    } else if(m.wanderTimer<=0){
      m.wanderTimer=rand(.7,1.5); const n=norm(rand(-1,1),rand(-1,1)); m.vx=n.x*speed*.7; m.vy=n.y*speed*.7;
    }
  }
  m.energy=clamp(m.energy-dt*2,0,100);
  moveEntity(m,dt);
}

function updateDrifter(d,dt,c,beacons,ponds){
  d.phase+=dt*4; d.wanderTimer-=dt;
  const speed=62*c.speedScale*(pointInsidePond(d,ponds)?.5:1);
  if(!reactToMaro(d,speed,c.maroReaction)){
    const near=nearest(d,beacons);
    if(near.item && c.beaconPower>0){
      const strength=c.beaconPower===2?1:.58;
      const n=norm(near.item.x-d.x,near.item.y-d.y);
      d.vx=d.vx*(1-strength*.08)+n.x*speed*strength*.14;
      d.vy=d.vy*(1-strength*.08)+n.y*speed*strength*.14;
    } else if(d.wanderTimer<=0){
      d.wanderTimer=rand(.8,1.8); const n=norm(rand(-1,1),rand(-1,1)); d.vx=n.x*speed*.8; d.vy=n.y*speed*.8;
    }
  }
  const mag=Math.hypot(d.vx,d.vy); if(mag>speed){d.vx=d.vx/mag*speed; d.vy=d.vy/mag*speed;}
  moveEntity(d,dt);
}

function moveEntity(e,dt){
  e.x+=e.vx*dt; e.y+=e.vy*dt;
  const left=38,right=canvas.width-38,top=100,bottom=canvas.height-36;
  if(e.x<left){e.x=left;e.vx=Math.abs(e.vx);} if(e.x>right){e.x=right;e.vx=-Math.abs(e.vx);}
  if(e.y<top){e.y=top;e.vy=Math.abs(e.vy);} if(e.y>bottom){e.y=bottom;e.vy=-Math.abs(e.vy);}
}

function update(dt){
  if(state.paused) return;
  const c=config();
  state.elapsed+=dt;
  if(state.elapsed>=state.day*state.dayLength){ state.day++; log(`Day ${state.day} begins.`); updateStats(); }
  updateMaro(dt);
  const plants=state.entities.filter(e=>e.type==='plant');
  const beacons=state.entities.filter(e=>e.type==='beacon');
  const ponds=state.entities.filter(e=>e.type==='pond');
  for(const e of state.entities){
    if(e.type==='plant') updatePlant(e,dt,c);
    else if(e.type==='muncher') updateMuncher(e,dt,c,plants,ponds);
    else if(e.type==='drifter') updateDrifter(e,dt,c,beacons,ponds);
    else if(e.type==='beacon') e.phase+=dt*3;
  }
}

function drawBackground(){
  const dayPhase=(state.elapsed%state.dayLength)/state.dayLength;
  const night=Math.max(0,Math.sin((dayPhase-.5)*Math.PI*2));
  ctx.fillStyle='#fbf4e7'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#f2c23d'; ctx.fillRect(52,54,125,25);
  ctx.fillStyle='#2b6de0'; ctx.fillRect(canvas.width-210,60,155,22);
  ctx.fillStyle='#ea5b43'; ctx.beginPath();ctx.arc(126,470,64,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f2c23d';ctx.beginPath();ctx.arc(850,465,54,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fffdf7'; ctx.fillRect(34,94,canvas.width-68,canvas.height-132);
  ctx.strokeStyle='#13212d';ctx.lineWidth=3;ctx.strokeRect(34,94,canvas.width-68,canvas.height-132);
  ctx.fillStyle=`rgba(28,45,76,${night*.18})`;ctx.fillRect(34,94,canvas.width-68,canvas.height-132);
  ctx.fillStyle='#13212d';ctx.font='800 13px Inter, sans-serif';ctx.textAlign='left';ctx.fillText(night>.3?'EVENING':'DAYLIGHT',50,119);
}

function drawPond(p){
  ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(113,169,191,.5)';ctx.strokeStyle='#13212d';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,p.radius,28,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
}
function drawPlant(p){
  ctx.save();ctx.translate(p.x,p.y);ctx.strokeStyle='#13212d';ctx.lineWidth=3;ctx.fillStyle='#6cad75';
  ctx.beginPath();ctx.moveTo(0,18);ctx.lineTo(0,-12);ctx.stroke();
  ctx.beginPath();ctx.ellipse(-10,-5,12,7,-.55,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.ellipse(10,-15,12,7,.55,0,Math.PI*2);ctx.fill();ctx.stroke();
  if(p.ripe){const s=1+Math.sin(p.pulse)*.08;ctx.scale(s,s);ctx.fillStyle='#ea5b43';ctx.beginPath();ctx.arc(0,-27,9,0,Math.PI*2);ctx.fill();ctx.stroke();}
  ctx.restore();
}
function drawBeacon(b){
  ctx.save();ctx.translate(b.x,b.y);const r=20+Math.sin(b.phase)*3;ctx.strokeStyle='rgba(242,194,61,.5)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,r+14,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#f2c23d';ctx.strokeStyle='#13212d';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,15,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
}
function drawMuncher(m){
  ctx.save();ctx.translate(m.x,m.y);ctx.rotate(Math.atan2(m.vy,m.vx)*.08);ctx.strokeStyle='#13212d';ctx.lineWidth=3;ctx.fillStyle='#ea5b43';ctx.beginPath();ctx.arc(0,0,24,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff9ef';ctx.beginPath();ctx.arc(5,-4,11,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#13212d';ctx.beginPath();ctx.arc(8,-4,3,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#2b6de0';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-8,22);ctx.lineTo(-14,31+Math.sin(m.phase)*2);ctx.moveTo(8,22);ctx.lineTo(14,31-Math.sin(m.phase)*2);ctx.stroke();ctx.restore();
}
function drawDrifter(d){
  ctx.save();ctx.translate(d.x,d.y);ctx.strokeStyle='#13212d';ctx.lineWidth=3;ctx.fillStyle='#2b6de0';ctx.beginPath();ctx.roundRect(-21,-21,42,42,12);ctx.fill();ctx.stroke();ctx.fillStyle='#fff9ef';ctx.beginPath();ctx.arc(-7,-4,4,0,Math.PI*2);ctx.arc(7,-4,4,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle='#f2c23d';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-7,20);ctx.lineTo(-12,29+Math.sin(d.phase)*2);ctx.moveTo(7,20);ctx.lineTo(12,29-Math.sin(d.phase)*2);ctx.stroke();ctx.restore();
}
function drawMaro(){
  const img=sprite,m=state.maro,rowMap={up:0,right:1,down:2,left:3};
  if(img.complete&&img.naturalWidth){const fw=img.width/4,fh=img.height/4,w=76,h=76;ctx.drawImage(img,m.frame*fw,rowMap[m.dir]*fh,fw,fh,m.x-w/2,m.y-h/2,w,h);} else {ctx.fillStyle='#f2c23d';ctx.beginPath();ctx.arc(m.x,m.y,28,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#13212d';ctx.font='800 12px Inter, sans-serif';ctx.textAlign='center';ctx.fillText('Maro',m.x,m.y-43);
}
function draw(){
  drawBackground();
  state.entities.filter(e=>e.type==='pond').forEach(drawPond);
  state.entities.filter(e=>e.type==='plant').forEach(drawPlant);
  state.entities.filter(e=>e.type==='beacon').forEach(drawBeacon);
  state.entities.filter(e=>e.type==='muncher').forEach(drawMuncher);
  state.entities.filter(e=>e.type==='drifter').forEach(drawDrifter);
  drawMaro();
}

let last=performance.now();
function loop(now){ const dt=Math.min(.033,(now-last)/1000);last=now;update(dt);draw();requestAnimationFrame(loop); }

UI.toolGrid.addEventListener('click',e=>{
  const btn=e.target.closest('[data-tool]'); if(!btn)return;
  state.selectedTool=btn.dataset.tool;
  document.querySelectorAll('.tool-card').forEach(b=>b.classList.toggle('selected',b===btn));
});

canvas.addEventListener('click',e=>{
  const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*canvas.width/r.width,y=(e.clientY-r.top)*canvas.height/r.height;
  if(y<96)return;
  if(state.selectedTool==='erase') eraseAt(x,y); else placeEntity(state.selectedTool,x,y);
});

['input','change'].forEach(evt=>{
  [UI.foodRate,UI.creatureSpeed,UI.beaconPower,UI.maroReaction].forEach(el=>el.addEventListener(evt,updateLabels));
});

UI.pauseBtn.addEventListener('click',()=>{state.paused=!state.paused;UI.pauseBtn.textContent=state.paused?'Play':'Pause';log(state.paused?'World paused.':'World running.');});
UI.resetBtn.addEventListener('click',resetWorld);
UI.surpriseBtn.addEventListener('click',surprise);
UI.clearLogBtn.addEventListener('click',()=>UI.eventLog.innerHTML='');
document.querySelectorAll('[data-preset]').forEach(btn=>btn.addEventListener('click',()=>addPreset(btn.dataset.preset)));
UI.ideaBtn.addEventListener('click',()=>UI.ideaDialog.showModal());
UI.closeDialogBtn.addEventListener('click',()=>UI.ideaDialog.close());

window.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(e.key==='ArrowLeft'||k==='a')state.keys.left=true;
  if(e.key==='ArrowRight'||k==='d')state.keys.right=true;
  if(e.key==='ArrowUp'||k==='w')state.keys.up=true;
  if(e.key==='ArrowDown'||k==='s')state.keys.down=true;
});
window.addEventListener('keyup',e=>{
  const k=e.key.toLowerCase();
  if(e.key==='ArrowLeft'||k==='a')state.keys.left=false;
  if(e.key==='ArrowRight'||k==='d')state.keys.right=false;
  if(e.key==='ArrowUp'||k==='w')state.keys.up=false;
  if(e.key==='ArrowDown'||k==='s')state.keys.down=false;
});

updateLabels(); updateStats(); log('World ready. Choose a piece and click the stage.'); requestAnimationFrame(loop);
