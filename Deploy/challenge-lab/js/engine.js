export const DIRS = ["N", "E", "S", "W"];
const VECTORS = {
  N: { x: 0, y: -1 },
  E: { x: 1, y: 0 },
  S: { x: 0, y: 1 },
  W: { x: -1, y: 0 },
};

export class GridEngine {
  constructor({ size = 5, start = { x: 0, y: 4, direction: "E" }, walls = [] } = {}) {
    this.size = size;
    this.start = { ...start };
    this.walls = new Set(walls.map(([x, y]) => `${x},${y}`));
    this.state = { ...start };
  }

  reset(start = this.start) {
    this.start = { ...start };
    this.state = { ...start };
    return this.snapshot();
  }

  snapshot() { return { ...this.state }; }

  turnRight() {
    const i = DIRS.indexOf(this.state.direction);
    this.state.direction = DIRS[(i + 1) % 4];
    return this.snapshot();
  }

  turnLeft() {
    const i = DIRS.indexOf(this.state.direction);
    this.state.direction = DIRS[(i + 3) % 4];
    return this.snapshot();
  }

  ahead() {
    const v = VECTORS[this.state.direction];
    return { x: this.state.x + v.x, y: this.state.y + v.y };
  }

  wallAhead() {
    const p = this.ahead();
    return p.x < 0 || p.y < 0 || p.x >= this.size || p.y >= this.size || this.walls.has(`${p.x},${p.y}`);
  }

  move() {
    if (this.wallAhead()) return { moved: false, blocked: true, state: this.snapshot() };
    const p = this.ahead();
    this.state.x = p.x;
    this.state.y = p.y;
    return { moved: true, blocked: false, state: this.snapshot() };
  }

  execute(command) {
    if (command === "MOVE") return this.move();
    if (command === "LEFT") return { moved: false, blocked: false, state: this.turnLeft() };
    if (command === "RIGHT") return { moved: false, blocked: false, state: this.turnRight() };
    throw new Error(`Unknown command: ${command}`);
  }
}

export function simulate({ start, commands, size = 5, walls = [] }) {
  const engine = new GridEngine({ start, size, walls });
  for (const command of commands) engine.execute(command);
  return engine.snapshot();
}

export function expandRepeat(body, count) {
  const out = [];
  for (let i = 0; i < count; i += 1) out.push(...body);
  return out;
}

export function runColorRoute({ start, goal, colors, rules, size = 5, maxTicks = 40 }) {
  const engine = new GridEngine({ size, start });
  const path = [engine.snapshot()];
  for (let ticks = 0; ticks < maxTicks; ticks += 1) {
    if (engine.state.x === goal.x && engine.state.y === goal.y) return { solved: true, path };
    const color = colors[`${engine.state.x},${engine.state.y}`];
    const action = color && rules[color];
    if (action === "LEFT" || action === "RIGHT") engine.execute(action);
    if (action === "MOVE2") {
      engine.execute("MOVE"); path.push(engine.snapshot());
      engine.execute("MOVE"); path.push(engine.snapshot());
    }
    engine.execute("MOVE"); path.push(engine.snapshot());
  }
  return { solved: false, path };
}

export function simulateMission({ start, goal, walls = [], lanterns = [], commands, size = 5 }) {
  const engine = new GridEngine({ size, start, walls });
  const lit = new Set();
  const path = [engine.snapshot()];
  const lightHere = () => {
    if (lanterns.some(([x, y]) => x === engine.state.x && y === engine.state.y)) {
      lit.add(`${engine.state.x},${engine.state.y}`);
    }
  };
  lightHere();
  for (const command of commands) {
    const result = engine.execute(command);
    path.push(engine.snapshot());
    lightHere();
    if (result.blocked) return { solved: false, blocked: true, lit, path, state: engine.snapshot() };
  }
  const atGoal = engine.state.x === goal.x && engine.state.y === goal.y;
  return { solved: atGoal && lit.size === lanterns.length, blocked: false, lit, path, state: engine.snapshot() };
}
