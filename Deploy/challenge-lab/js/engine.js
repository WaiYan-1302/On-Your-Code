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

export function runReactiveMaze({ map, maxTicks = 80 }) {
  const engine = new GridEngine({ size: map.size, start: map.start, walls: map.walls });
  const path = [engine.snapshot()];
  let ticks = 0;
  while (ticks < maxTicks) {
    if (engine.state.x === map.goal.x && engine.state.y === map.goal.y) {
      return { solved: true, ticks, path };
    }
    if (engine.wallAhead()) engine.turnRight();
    else engine.move();
    path.push(engine.snapshot());
    ticks += 1;
  }
  return { solved: false, ticks, path };
}
