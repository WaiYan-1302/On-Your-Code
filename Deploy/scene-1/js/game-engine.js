export const COMMANDS = Object.freeze({
  MOVE: "MOVE",
  TURN_LEFT: "TURN_LEFT",
  TURN_RIGHT: "TURN_RIGHT",
});

export const DIRECTIONS = Object.freeze(["N", "E", "S", "W"]);

const VECTORS = Object.freeze({
  N: { x: 0, y: -1 },
  E: { x: 1, y: 0 },
  S: { x: 0, y: 1 },
  W: { x: -1, y: 0 },
});

export class GameEngine {
  constructor({ size = 5, start = { x: 0, y: 2, direction: "E" } } = {}) {
    this.size = size;
    this.start = { ...start };
    this.state = { ...start };
  }

  reset() {
    this.state = { ...this.start };
    return this.snapshot();
  }

  snapshot() {
    return { ...this.state };
  }

  restore(snapshot) {
    this.state = { ...snapshot };
    return this.snapshot();
  }

  execute(command) {
    if (!Object.values(COMMANDS).includes(command)) {
      throw new Error(`Unknown command: ${command}`);
    }

    if (command === COMMANDS.TURN_LEFT) {
      this.turn(-1);
      return { moved: false, blocked: false, state: this.snapshot() };
    }

    if (command === COMMANDS.TURN_RIGHT) {
      this.turn(1);
      return { moved: false, blocked: false, state: this.snapshot() };
    }

    return this.move();
  }

  turn(amount) {
    const currentIndex = DIRECTIONS.indexOf(this.state.direction);
    const nextIndex = (currentIndex + amount + DIRECTIONS.length) % DIRECTIONS.length;
    this.state.direction = DIRECTIONS[nextIndex];
  }

  move() {
    const vector = VECTORS[this.state.direction];
    const next = {
      x: this.state.x + vector.x,
      y: this.state.y + vector.y,
    };
    const blocked =
      next.x < 0 ||
      next.y < 0 ||
      next.x >= this.size ||
      next.y >= this.size;

    if (!blocked) {
      this.state.x = next.x;
      this.state.y = next.y;
    }

    return { moved: !blocked, blocked, state: this.snapshot() };
  }
}
