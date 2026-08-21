const canvas = document.getElementById('labCanvas');
const ctx = canvas.getContext('2d');

const elements = {
  creatureName: document.getElementById('creatureName'),
  bodyShape: document.getElementById('bodyShape'),
  colorStyle: document.getElementById('colorStyle'),
  eyeStyle: document.getElementById('eyeStyle'),
  accessoryStyle: document.getElementById('accessoryStyle'),
  nearBehavior: document.getElementById('nearBehavior'),
  idleBehavior: document.getElementById('idleBehavior'),
  sensitivityRadius: document.getElementById('sensitivityRadius'),
  speedScale: document.getElementById('speedScale'),
  radiusValue: document.getElementById('radiusValue'),
  speedValue: document.getElementById('speedValue'),
  rulePreview: document.getElementById('rulePreview'),
  creatureCount: document.getElementById('creatureCount'),
  selectedName: document.getElementById('selectedName'),
  rosterList: document.getElementById('rosterList'),
  presetList: document.getElementById('presetList'),
  releaseBtn: document.getElementById('releaseBtn'),
  savePresetBtn: document.getElementById('savePresetBtn'),
  surpriseBtn: document.getElementById('surpriseBtn'),
  missionBtn: document.getElementById('missionBtn'),
  resetWorldBtn: document.getElementById('resetWorldBtn'),
  clearPresetsBtn: document.getElementById('clearPresetsBtn'),
  ideaDialog: document.getElementById('ideaDialog'),
  closeDialogBtn: document.getElementById('closeDialogBtn'),
};

const COLORS = {
  sunny: { top: '#EA5B43', bottom: '#F2C23D', accent: '#2B6DE0', arm: '#71A9BF' },
  berry: { top: '#D94C81', bottom: '#F5D063', accent: '#2B6DE0', arm: '#8BC0D7' },
  mint: { top: '#65C9A8', bottom: '#F4E8BE', accent: '#2B6DE0', arm: '#8ED3E8' },
  night: { top: '#263247', bottom: '#5E7BCB', accent: '#F2C23D', arm: '#A7C7D9' },
};

const BEHAVIOR_LABELS = {
  follow: 'Follow Maro',
  flee: 'Run Away',
  orbit: 'Orbit Around Maro',
  freeze: 'Freeze in Place',
  dance: 'Dance',
  wander: 'Wander',
  bounce: 'Bounce Around',
  patrol: 'Patrol',
  rest: 'Rest',
};

const BEHAVIOR_LABELS_JA = {
  follow: 'マロについていく',
  flee: '逃げる',
  orbit: 'マロの周りを回る',
  freeze: 'その場で止まる',
  dance: 'ダンスする',
  wander: '歩き回る',
  bounce: '跳ね回る',
  patrol: 'パトロールする',
  rest: '休む',
};

function currentLanguage() {
  return document.documentElement.lang === 'ja' ? 'ja' : 'en';
}

function behaviorLabel(key) {
  return (currentLanguage() === 'ja' ? BEHAVIOR_LABELS_JA : BEHAVIOR_LABELS)[key];
}

function formValueLabel(key) {
  if (currentLanguage() !== 'ja') return key;
  return {
    round:'丸', square:'四角', triangle:'三角', sunny:'サニー', berry:'ベリー', mint:'ミント', night:'ナイト',
    dot:'点', wide:'ぱっちり', sleepy:'ねむそう', flag:'旗', antenna:'アンテナ', crown:'王冠'
  }[key] || key;
}

const FORM_KEYS = [
  'creatureName', 'bodyShape', 'colorStyle', 'eyeStyle', 'accessoryStyle', 'nearBehavior', 'idleBehavior', 'sensitivityRadius', 'speedScale'
];

const storageKey = 'oyc-creature-lab-presets';
let presetLibrary = [];
let nextCreatureId = 1;

const spriteSheets = {
  directions: loadImage('assets/maro-directions.png'),
  frontStrip: loadImage('assets/maro-front-strip.png'),
};

const input = {
  left: false,
  right: false,
  up: false,
  down: false,
};

const world = {
  width: canvas.width,
  height: canvas.height,
  creatures: [],
  selectedCreatureId: null,
  time: 0,
  maro: {
    x: canvas.width * 0.5,
    y: canvas.height * 0.56,
    vx: 0,
    vy: 0,
    speed: 220,
    dir: 'down',
    frame: 0,
    frameTimer: 0,
    radius: 28,
  },
};

function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function distance(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

function normalize(dx, dy) {
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

function currentFormState() {
  return {
    creatureName: elements.creatureName.value.trim() || `Creature ${world.creatures.length + 1}`,
    bodyShape: elements.bodyShape.value,
    colorStyle: elements.colorStyle.value,
    eyeStyle: elements.eyeStyle.value,
    accessoryStyle: elements.accessoryStyle.value,
    nearBehavior: elements.nearBehavior.value,
    idleBehavior: elements.idleBehavior.value,
    sensitivityRadius: Number(elements.sensitivityRadius.value),
    speedScale: Number(elements.speedScale.value),
  };
}

function applyFormState(formState) {
  FORM_KEYS.forEach((key) => {
    if (elements[key] && formState[key] !== undefined) {
      elements[key].value = String(formState[key]);
    }
  });
  updateFormLabels();
  updateRulePreview();
}

function updateFormLabels() {
  elements.radiusValue.textContent = String(elements.sensitivityRadius.value);
  elements.speedValue.textContent = `${Number(elements.speedScale.value).toFixed(1)}×`;
}

function updateRulePreview() {
  const form = currentFormState();
  elements.rulePreview.textContent = currentLanguage() === 'ja' ? [
    `クリーチャー ${form.creatureName}`,
    `からだ  ${formValueLabel(form.bodyShape)}・${formValueLabel(form.colorStyle)}・${formValueLabel(form.eyeStyle)}`,
    '',
    `マロが近くにいるとき (${form.sensitivityRadius}px)`,
    `→ ${behaviorLabel(form.nearBehavior)}`,
    '',
    'それ以外',
    `→ ${behaviorLabel(form.idleBehavior)}`,
    '',
    `速さ ${Number(form.speedScale).toFixed(1)}×`,
  ].join('\n') : [
    `CREATURE ${form.creatureName.toUpperCase()}`,
    `BODY  ${form.bodyShape.toUpperCase()} · ${form.colorStyle.toUpperCase()} · ${form.eyeStyle.toUpperCase()}`,
    '',
    `WHEN MARO IS NEAR (${form.sensitivityRadius}px)`,
    `→ ${behaviorLabel(form.nearBehavior).toUpperCase()}`,
    '',
    `OTHERWISE`,
    `→ ${behaviorLabel(form.idleBehavior).toUpperCase()}`,
    '',
    `SPEED ${Number(form.speedScale).toFixed(1)}×`,
  ].join('\n');
}

window.getSceneCode = () => {
  const form = currentFormState();
  const ja = currentLanguage() === 'ja';
  return {
    title: ja ? 'クリーチャーの行動ルール' : 'CREATURE BEHAVIOR RULES',
    steps: elements.rulePreview.textContent.split('\n'),
    operations: ja ? [
      '近さを調べる():\n  距離 = マロとクリーチャーの間\n  近い = 距離 <= 感度の半径',
      '行動を選ぶ():\n  もし近いなら:\n    近くにいるときの行動を実行\n  それ以外:\n    いつもの動きを実行',
      '移動する(速さ):\n  位置 += 向き × 速さ × 経過時間\n  ステージの端で向きを変える'
    ] : [
      'CHECK_NEAR():\n  distance = BETWEEN(Maro, creature)\n  near = distance <= sensitivity_radius',
      'CHOOSE_BEHAVIOR():\n  IF near:\n    RUN near_behavior\n  ELSE:\n    RUN default_motion',
      'MOVE(speed):\n  position += direction × speed × delta_time\n  TURN at the stage edges'
    ],
  };
};

function makeCreatureFromForm(form) {
  const speed = 58 * form.speedScale;
  return {
    id: nextCreatureId++,
    name: form.creatureName,
    bodyShape: form.bodyShape,
    colorStyle: form.colorStyle,
    eyeStyle: form.eyeStyle,
    accessoryStyle: form.accessoryStyle,
    nearBehavior: form.nearBehavior,
    idleBehavior: form.idleBehavior,
    sensitivityRadius: form.sensitivityRadius,
    speedScale: form.speedScale,
    baseSpeed: speed,
    x: rand(110, world.width - 110),
    y: rand(140, world.height - 95),
    vx: rand(-1, 1) * speed,
    vy: rand(-1, 1) * speed,
    phase: rand(0, Math.PI * 2),
    orbitAngle: rand(0, Math.PI * 2),
    idleTimer: rand(0.3, 1.2),
    hopTimer: 0,
    size: 36,
    selected: false,
  };
}

function releaseCreature() {
  if (world.creatures.length >= 5) {
    window.alert(currentLanguage()==='ja'?'ラボに放せるクリーチャーは5体までです。':'You can release up to 5 creatures in the lab.');
    return;
  }
  const creature = makeCreatureFromForm(currentFormState());
  world.creatures.push(creature);
  selectCreature(creature.id);
  renderRoster();
}

function selectCreature(id) {
  world.selectedCreatureId = id;
  const none=currentLanguage()==='ja'?'なし':'None';
  elements.selectedName.textContent = id ? (world.creatures.find(c => c.id === id)?.name || none) : none;
  renderRoster();
}

function removeCreature(id) {
  world.creatures = world.creatures.filter((creature) => creature.id !== id);
  if (world.selectedCreatureId === id) {
    selectCreature(null);
  }
  renderRoster();
}

function resetWorld() {
  world.creatures = [];
  world.selectedCreatureId = null;
  world.maro.x = canvas.width * 0.5;
  world.maro.y = canvas.height * 0.56;
  world.maro.vx = 0;
  world.maro.vy = 0;
  selectCreature(null);
  renderRoster();
}

function handleCreatureClick(mx, my) {
  let clicked = null;
  for (let i = world.creatures.length - 1; i >= 0; i--) {
    const creature = world.creatures[i];
    const hitRadius = creature.size * 0.9;
    if (Math.hypot(mx - creature.x, my - creature.y) <= hitRadius) {
      clicked = creature;
      break;
    }
  }
  if (clicked) {
    clicked.hopTimer = 0.45;
    selectCreature(clicked.id);
  } else {
    selectCreature(null);
  }
}

function savePreset() {
  const form = currentFormState();
  presetLibrary.unshift({
    id: `preset-${Date.now()}`,
    label: form.creatureName,
    ...form,
  });
  presetLibrary = presetLibrary.slice(0, 8);
  persistPresets();
  renderPresets();
}

function persistPresets() {
  localStorage.setItem(storageKey, JSON.stringify(presetLibrary));
}

function loadPresets() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(parsed)) {
      presetLibrary = parsed;
    }
  } catch (error) {
    presetLibrary = [];
  }
}

function clearPresets() {
  presetLibrary = [];
  persistPresets();
  renderPresets();
}

function surpriseMe() {
  const randomChoice = (list) => list[Math.floor(Math.random() * list.length)];
  applyFormState({
    creatureName: randomChoice(['Piko', 'Mimo', 'Roro', 'Tako', 'Luma', 'Maroid', 'Bobo']),
    bodyShape: randomChoice(['round', 'square', 'triangle']),
    colorStyle: randomChoice(['sunny', 'berry', 'mint', 'night']),
    eyeStyle: randomChoice(['dot', 'wide', 'sleepy']),
    accessoryStyle: randomChoice(['flag', 'antenna', 'crown']),
    nearBehavior: randomChoice(['follow', 'flee', 'orbit', 'freeze', 'dance']),
    idleBehavior: randomChoice(['wander', 'bounce', 'patrol', 'rest']),
    sensitivityRadius: [80, 100, 120, 140, 160, 180][Math.floor(Math.random() * 6)],
    speedScale: [0.7, 0.8, 1.0, 1.2, 1.4][Math.floor(Math.random() * 5)],
  });
}

function renderPresets() {
  if (!presetLibrary.length) {
    elements.presetList.className = 'preset-list empty-state';
    elements.presetList.innerHTML = '<p>No presets saved yet.</p>';
    return;
  }

  elements.presetList.className = 'preset-list';
  elements.presetList.innerHTML = presetLibrary.map((preset) => {
    const colors = COLORS[preset.colorStyle];
    return `
      <article class="preset-item">
        <header>
          <strong><span class="color-chip" style="background:${colors.top}"></span>${preset.label}</strong>
          <span class="badge">${formValueLabel(preset.bodyShape)}</span>
        </header>
        <div>${behaviorLabel(preset.nearBehavior)} · ${behaviorLabel(preset.idleBehavior)}</div>
        <div class="inline-buttons">
          <button class="pill-button mini secondary" data-action="apply-preset" data-id="${preset.id}">Load</button>
          <button class="pill-button mini primary" data-action="spawn-preset" data-id="${preset.id}">Spawn</button>
        </div>
      </article>
    `;
  }).join('');
}

function renderRoster() {
  elements.creatureCount.textContent = `${world.creatures.length}/5`;

  if (!world.creatures.length) {
    elements.rosterList.className = 'roster-list empty-state';
    elements.rosterList.innerHTML = '<p>No creatures released yet.</p>';
    return;
  }

  elements.rosterList.className = 'roster-list';
  elements.rosterList.innerHTML = world.creatures.map((creature) => {
    const colors = COLORS[creature.colorStyle];
    const isSelected = creature.id === world.selectedCreatureId;
    return `
      <article class="roster-item" style="outline:${isSelected ? '3px solid #2B6DE0' : 'none'}">
        <header>
          <strong><span class="color-chip" style="background:${colors.top}"></span>${creature.name}</strong>
          <span class="badge ${isSelected ? 'blue' : ''}">${formValueLabel(creature.bodyShape)}</span>
        </header>
        <div>${currentLanguage()==='ja'?'近いとき':'Near'} → ${behaviorLabel(creature.nearBehavior)}</div>
        <div>${currentLanguage()==='ja'?'いつも':'Idle'} → ${behaviorLabel(creature.idleBehavior)}</div>
        <div class="inline-buttons">
          <button class="pill-button mini secondary" data-action="select-creature" data-id="${creature.id}">Focus</button>
          <button class="pill-button mini danger" data-action="delete-creature" data-id="${creature.id}">Remove</button>
        </div>
      </article>
    `;
  }).join('');
}

function steerCreature(creature, targetX, targetY, speedFactor = 1) {
  const dir = normalize(targetX - creature.x, targetY - creature.y);
  creature.vx = dir.x * creature.baseSpeed * speedFactor;
  creature.vy = dir.y * creature.baseSpeed * speedFactor;
}

function updateMaro(dt) {
  const maro = world.maro;
  let dx = 0;
  let dy = 0;
  if (input.left) dx -= 1;
  if (input.right) dx += 1;
  if (input.up) dy -= 1;
  if (input.down) dy += 1;

  if (dx !== 0 || dy !== 0) {
    const dir = normalize(dx, dy);
    maro.vx = dir.x * maro.speed;
    maro.vy = dir.y * maro.speed;
    if (Math.abs(dir.x) > Math.abs(dir.y)) {
      maro.dir = dir.x > 0 ? 'right' : 'left';
    } else {
      maro.dir = dir.y > 0 ? 'down' : 'up';
    }
    maro.frameTimer += dt;
    if (maro.frameTimer > 0.12) {
      maro.frame = (maro.frame + 1) % 4;
      maro.frameTimer = 0;
    }
  } else {
    maro.vx *= 0.85;
    maro.vy *= 0.85;
    maro.frame = 0;
  }

  maro.x += maro.vx * dt;
  maro.y += maro.vy * dt;
  maro.x = clamp(maro.x, 46, world.width - 46);
  maro.y = clamp(maro.y, 96, world.height - 42);
}

function updateCreature(creature, dt) {
  creature.phase += dt * 5;
  creature.idleTimer -= dt;
  creature.hopTimer = Math.max(0, creature.hopTimer - dt);

  const dist = distance(creature, world.maro);
  const near = dist <= creature.sensitivityRadius;

  if (near) {
    switch (creature.nearBehavior) {
      case 'follow':
        steerCreature(creature, world.maro.x, world.maro.y, 1.25);
        break;
      case 'flee':
        steerCreature(creature, creature.x - (world.maro.x - creature.x), creature.y - (world.maro.y - creature.y), 1.25);
        break;
      case 'orbit': {
        creature.orbitAngle += dt * 1.9;
        const desiredX = world.maro.x + Math.cos(creature.orbitAngle + creature.id * 0.2) * (creature.sensitivityRadius * 0.62);
        const desiredY = world.maro.y + Math.sin(creature.orbitAngle + creature.id * 0.2) * (creature.sensitivityRadius * 0.45);
        steerCreature(creature, desiredX, desiredY, 1.1);
        break;
      }
      case 'freeze':
        creature.vx *= 0.75;
        creature.vy *= 0.75;
        break;
      case 'dance':
        creature.vx = Math.cos(world.time * 10 + creature.id) * creature.baseSpeed * 0.35;
        creature.vy = Math.sin(world.time * 8 + creature.id) * creature.baseSpeed * 0.18;
        break;
    }
  } else {
    switch (creature.idleBehavior) {
      case 'wander':
        if (creature.idleTimer <= 0) {
          creature.idleTimer = rand(0.8, 1.7);
          const dir = normalize(rand(-1, 1), rand(-1, 1));
          creature.vx = dir.x * creature.baseSpeed * 0.8;
          creature.vy = dir.y * creature.baseSpeed * 0.8;
        }
        break;
      case 'bounce':
        if (Math.abs(creature.vx) < 10 && Math.abs(creature.vy) < 10) {
          const dir = normalize(rand(-1, 1), rand(-1, 1));
          creature.vx = dir.x * creature.baseSpeed;
          creature.vy = dir.y * creature.baseSpeed;
        }
        break;
      case 'patrol':
        if (creature.idleTimer <= 0) {
          creature.idleTimer = rand(1.2, 2.2);
          const sign = Math.random() > 0.5 ? 1 : -1;
          creature.vx = sign * creature.baseSpeed * 0.9;
          creature.vy = Math.sin(world.time + creature.id) * creature.baseSpeed * 0.2;
        }
        break;
      case 'rest':
        creature.vx *= 0.9;
        creature.vy *= 0.9;
        break;
    }
  }

  creature.x += creature.vx * dt;
  creature.y += creature.vy * dt;

  const margin = 44;
  if (creature.x < margin) {
    creature.x = margin;
    creature.vx = Math.abs(creature.vx) || creature.baseSpeed * 0.7;
  }
  if (creature.x > world.width - margin) {
    creature.x = world.width - margin;
    creature.vx = -Math.abs(creature.vx) || -creature.baseSpeed * 0.7;
  }
  if (creature.y < 112) {
    creature.y = 112;
    creature.vy = Math.abs(creature.vy) || creature.baseSpeed * 0.6;
  }
  if (creature.y > world.height - 44) {
    creature.y = world.height - 44;
    creature.vy = -Math.abs(creature.vy) || -creature.baseSpeed * 0.6;
  }
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, world.height);
  gradient.addColorStop(0, '#fff9ef');
  gradient.addColorStop(1, '#f4ecdc');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.fillStyle = '#f5d264';
  ctx.fillRect(48, 64, 120, 28);
  ctx.fillStyle = '#2b6de0';
  ctx.fillRect(world.width - 200, 74, 136, 24);
  ctx.fillStyle = '#ea5b43';
  ctx.beginPath();
  ctx.arc(170, 432, 72, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2c23d';
  ctx.beginPath();
  ctx.arc(world.width - 104, 438, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b6de0';
  ctx.fillRect(world.width * 0.45, 96, 18, 90);
  ctx.fillRect(world.width * 0.45 - 48, 142, 114, 18);

  ctx.fillStyle = 'rgba(43, 109, 224, 0.07)';
  ctx.fillRect(32, world.height - 130, world.width - 64, 94);
  ctx.strokeStyle = '#111f2a';
  ctx.lineWidth = 3;
  ctx.strokeRect(32, world.height - 130, world.width - 64, 94);

  ctx.strokeStyle = 'rgba(17,31,42,0.2)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(54 + i * 116, world.height - 84);
    ctx.lineTo(106 + i * 116, world.height - 84);
    ctx.stroke();
  }
}

function drawMaro() {
  const img = spriteSheets.directions;
  const frameW = img.width / 4 || 128;
  const frameH = img.height / 4 || 128;
  const rowMap = { up: 0, right: 1, down: 2, left: 3 };
  const row = rowMap[world.maro.dir] ?? 2;
  const frame = world.maro.frame;
  const drawW = 76;
  const drawH = 76;

  if (img.complete && img.naturalWidth) {
    ctx.drawImage(
      img,
      frame * frameW,
      row * frameH,
      frameW,
      frameH,
      world.maro.x - drawW / 2,
      world.maro.y - drawH / 2,
      drawW,
      drawH,
    );
  } else {
    ctx.fillStyle = '#f2c23d';
    ctx.beginPath();
    ctx.arc(world.maro.x, world.maro.y, 28, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#111f2a';
  ctx.font = '700 13px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Maro', world.maro.x, world.maro.y - 44);
}

function drawEyeSet(creature) {
  ctx.fillStyle = '#111f2a';
  switch (creature.eyeStyle) {
    case 'wide':
      ctx.beginPath();
      ctx.arc(-9, -5, 4, 0, Math.PI * 2);
      ctx.arc(9, -5, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'sleepy':
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-14, -5);
      ctx.lineTo(-4, -7);
      ctx.moveTo(4, -7);
      ctx.lineTo(14, -5);
      ctx.strokeStyle = '#111f2a';
      ctx.stroke();
      break;
    default:
      ctx.beginPath();
      ctx.arc(-8, -5, 3, 0, Math.PI * 2);
      ctx.arc(8, -5, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
  ctx.beginPath();
  ctx.arc(0, 5, 3.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawAccessory(creature) {
  const colors = COLORS[creature.colorStyle];
  switch (creature.accessoryStyle) {
    case 'antenna':
      ctx.strokeStyle = '#111f2a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -34);
      ctx.lineTo(0, -49);
      ctx.stroke();
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(0, -54, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'crown':
      ctx.fillStyle = colors.accent;
      ctx.strokeStyle = '#111f2a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-16, -29);
      ctx.lineTo(-8, -42);
      ctx.lineTo(0, -31);
      ctx.lineTo(8, -42);
      ctx.lineTo(16, -29);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    default:
      ctx.fillStyle = colors.accent;
      ctx.strokeStyle = '#111f2a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(2, -32);
      ctx.lineTo(2, -50);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, -48);
      ctx.lineTo(18, -42);
      ctx.lineTo(2, -36);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
  }
}

function drawCreature(creature) {
  const colors = COLORS[creature.colorStyle];
  const hopOffset = creature.hopTimer > 0 ? Math.sin((creature.hopTimer / 0.45) * Math.PI) * 16 : 0;
  const sway = Math.sin(creature.phase) * 1.2;

  ctx.save();
  ctx.translate(creature.x, creature.y - hopOffset);
  if (creature.nearBehavior === 'dance' && distance(creature, world.maro) <= creature.sensitivityRadius) {
    ctx.rotate(Math.sin(world.time * 10 + creature.id) * 0.14);
  }

  drawAccessory(creature);

  ctx.strokeStyle = '#111f2a';
  ctx.lineWidth = 3;

  // body bottom + top in Maro-ish palette
  if (creature.bodyShape === 'square') {
    ctx.fillStyle = colors.bottom;
    ctx.beginPath();
    ctx.roundRect(-28, -18, 56, 48, 16);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.top;
    ctx.beginPath();
    ctx.roundRect(-28, -32, 56, 32, 16);
    ctx.fill();
    ctx.stroke();
  } else if (creature.bodyShape === 'triangle') {
    ctx.fillStyle = colors.top;
    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.lineTo(32, 24);
    ctx.lineTo(-32, 24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.bottom;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(22, 24);
    ctx.lineTo(-22, 24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillStyle = colors.bottom;
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.top;
    ctx.beginPath();
    ctx.arc(0, -6, 30, Math.PI, 0);
    ctx.lineTo(30, -6);
    ctx.arc(0, -6, 30, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // face plate
  ctx.fillStyle = '#fffaf1';
  ctx.beginPath();
  ctx.arc(0, -2, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  drawEyeSet(creature);

  // arms
  ctx.fillStyle = colors.arm;
  ctx.beginPath();
  ctx.arc(-28, 8 + sway, 7, 0, Math.PI * 2);
  ctx.arc(28, 8 - sway, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // legs
  ctx.strokeStyle = '#2B6DE0';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-10, 30);
  ctx.lineTo(-16, 44 + Math.sin(creature.phase) * 2);
  ctx.moveTo(10, 30);
  ctx.lineTo(16, 44 - Math.sin(creature.phase) * 2);
  ctx.stroke();

  // name tag
  ctx.fillStyle = '#111f2a';
  ctx.font = '700 12px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(creature.name, 0, -50);

  ctx.restore();
}

function drawConnectionLines() {
  if (!world.selectedCreatureId) return;
  const selected = world.creatures.find((creature) => creature.id === world.selectedCreatureId);
  if (!selected) return;
  ctx.save();
  ctx.setLineDash([10, 8]);
  ctx.strokeStyle = 'rgba(43, 109, 224, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(selected.x, selected.y);
  ctx.lineTo(world.maro.x, world.maro.y);
  ctx.stroke();
  ctx.restore();
}

function draw() {
  drawBackground();
  drawConnectionLines();
  drawMaro();
  world.creatures.forEach(drawCreature);
}

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  world.time += dt;

  updateMaro(dt);
  world.creatures.forEach((creature) => updateCreature(creature, dt));
  draw();
  requestAnimationFrame(loop);
}

function installListeners() {
  window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') input.left = true;
    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') input.right = true;
    if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') input.up = true;
    if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') input.down = true;
  });

  window.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') input.left = false;
    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') input.right = false;
    if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') input.up = false;
    if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') input.down = false;
  });

  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (event.clientX - rect.left) * scaleX;
    const my = (event.clientY - rect.top) * scaleY;
    handleCreatureClick(mx, my);
  });

  FORM_KEYS.forEach((key) => {
    const element = elements[key];
    if (!element) return;
    element.addEventListener('input', () => {
      updateFormLabels();
      updateRulePreview();
    });
    element.addEventListener('change', () => {
      updateFormLabels();
      updateRulePreview();
    });
  });

  elements.releaseBtn.addEventListener('click', releaseCreature);
  elements.savePresetBtn.addEventListener('click', savePreset);
  elements.surpriseBtn.addEventListener('click', surpriseMe);
  elements.resetWorldBtn.addEventListener('click', resetWorld);
  elements.clearPresetsBtn.addEventListener('click', clearPresets);

  elements.missionBtn.addEventListener('click', () => elements.ideaDialog.showModal());
  elements.closeDialogBtn.addEventListener('click', () => elements.ideaDialog.close());
  elements.ideaDialog.addEventListener('click', (event) => {
    const rect = elements.ideaDialog.getBoundingClientRect();
    const isInDialog = (
      rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX && event.clientX <= rect.left + rect.width
    );
    if (!isInDialog) elements.ideaDialog.close();
  });

  elements.rosterList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const action = button.dataset.action;
    if (action === 'select-creature') selectCreature(id);
    if (action === 'delete-creature') removeCreature(id);
  });

  elements.presetList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = button.dataset.id;
    const preset = presetLibrary.find((item) => item.id === id);
    if (!preset) return;
    if (button.dataset.action === 'apply-preset') {
      applyFormState(preset);
    }
    if (button.dataset.action === 'spawn-preset') {
      applyFormState(preset);
      releaseCreature();
    }
  });
}

function init() {
  loadPresets();
  updateFormLabels();
  updateRulePreview();
  renderPresets();
  renderRoster();
  installListeners();
  requestAnimationFrame(loop);
}

window.addEventListener('oyc-language-change', () => {
  updateRulePreview();
  selectCreature(world.selectedCreatureId);
  renderPresets();
});

init();
