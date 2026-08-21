# Maro's Workshop 2 — Mini World Simulator

A controlled creative simulation scene for **On Your Code**.

## What students do
1. Place plants, munchers, drifters, beacons, and ponds.
2. Change a few readable world rules.
3. Run the simulation and observe what happens.
4. Change one rule and compare the result.

The scene is intentionally bounded instead of being a full physics sandbox, so behavior stays predictable and robust.

## Included systems
- Maro movement using Arrow Keys / WASD
- Plants that grow food
- Munchers that seek and eat ripe plants
- A visible hunger timer: munchers die after 30 seconds without food
- Drifters that wander and respond to beacons
- Ponds that slow moving creatures
- Optional Follow / Flee reaction to Maro
- Food growth, creature speed and beacon-strength controls
- English/Japanese toggle and a language-aware `<Code>` pseudocode viewer
- Garden / Busy World / Quiet World presets
- World event log and live statistics
- Pseudocode-style world rule display
- Pause, play, reset and erase tools

## Run
```bash
npm run setup
npm start
```
Then visit:
```text
http://localhost:3000
```

## Build
```bash
npm run build
```
The deployable static files are copied into `dist/`.
