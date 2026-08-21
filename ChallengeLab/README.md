# On Your Code · Smart Lab (Day 2+)

A standalone, mobile-first companion scene designed to sit **next to the existing Day 2** guided challenges.
It keeps the same visual language (outlined cards, Bauhaus geometry, Day 2 palette) but shifts from "follow commands" toward **algorithmic problem solving**.

## 10 challenge progression

1. **Order matters — Sequence**: assemble an exact route.
2. **Think before Run — Tracing state**: predict the final tile before execution.
3. **One bad instruction — Debugging**: find and repair a single faulty instruction.
4. **Say it smaller — Loop**: compress a square into a repeated two-step pattern.
5. **One command, different distance — Parameters**: change values instead of inventing new commands.
6. **Make the program react — Conditionals**: choose behaviour based on a wall ahead.
7. **Follow the Colors — Conditions + movement**: map blue, red, and yellow tiles to visible movement rules.
8. **Lantern Patrol — Repeat until**: keep moving and light each lantern until Maro reaches the workshop.
9. **Repair the Patrol Program — Debugging groups**: fix the indentation that traps `MOVE` inside a condition.
10. **Build a Mission — Creative system design**: place Maro, a workshop, lanterns, and walls; build and explain a working program.

Each solved challenge unlocks a concise concept card and the next mission. Progress is stored in `localStorage`.

## Run

No build step and no dependencies.

- Open this folder in VS Code.
- Use **Live Server** on `index.html`, or run any simple static server.
- It can also be uploaded directly as an HTML project to itch.io or GitHub Pages.

## Test

```bash
npm test
```

## Integrate beside your current Day 2

Recommended structure:

```text
on-your-code/
├── day2/              # your existing 3 guided challenges (unchanged)
└── smart-lab/         # this folder
```

On your existing Day 2 scene/menu, add a second scene card after Day 2:

```html
<a href="../smart-lab/index.html">SMART LAB · 10 CHALLENGES</a>
```

If your master project has a router, route this folder as the scene immediately after Day 2 instead. Do not remove or merge the existing Day 2 challenges.

## Visual note

Challenge Lab includes the same four-direction Maro-kun sprite sheet used by
Scene 1 and Scene 2. It keeps its own copy under `assets/characters/maro/`, so
the game remains an independent, portable module.
