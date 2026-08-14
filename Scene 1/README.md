# On Your Code

A portrait mobile-first creative coding playground for the On Your Mark camp.

This Day‑1 build features Maro and includes:

- a 5×5 board;
- mascot position and direction;
- MOVE, TURN LEFT, and TURN RIGHT;
- RUN, STEP, RESET MARO, UNDO, and CLEAR COMMANDS;
- current-command highlighting;
- a smooth three-frame walking loop during movement;
- the fourth/last sprite frame as idle only after Maro fully stops;
- direction-aware facing: native right view, mirrored left view, and a
  four-direction facing marker;
- responsive portrait layout with a centered phone-style desktop preview.

## Open it in VS Code

1. Open the `on-your-code` folder in VS Code.
2. Install the **Live Server** extension if you do not already have it.
3. Right-click `index.html` and choose **Open with Live Server**.
4. In the browser developer tools, switch to a phone-sized viewport.

No framework or package installation is required.

## Run the tests

With Node.js installed:

```bash
npm test
```

## Day‑1 acceptance test

1. Add `MOVE`, `MOVE`, `TURN RIGHT`, `MOVE`.
2. Press **Run**.
3. Confirm each command highlights in order.
4. Confirm the mascot finishes at column 3, row 4, facing south.
5. Press **Reset** and confirm the command list remains.
6. Press **Step** and confirm exactly one command executes.
7. Press **Undo** and confirm the last action reverses.
8. Press **Clear commands** and confirm Maro stays in his current tile.

## Controls

- **MOVE FORWARD** moves Maro one tile in the direction he faces.
- **TURN LEFT / TURN RIGHT** changes his facing direction without moving.
- **RUN ALL COMMANDS** executes the remaining program.
- **NEXT STEP** executes one command.
- **RESET MARO** returns Maro to the start while keeping the command list.
- **CLEAR COMMANDS** removes only the program; Maro stays where he is.
- **UNDO** restores the previous program and board state.

## Structure

```text
on-your-code/
├── assets/
│   └── characters/
│       └── maro/
│           └── maro-walk-4directions-4frames-128-v2.png
├── index.html
├── styles.css
├── js/
│   ├── app.js
│   └── game-engine.js
└── test/
    └── game-engine.test.js
```

`game-engine.js` contains only board and command rules. `app.js` connects those
rules to the screen. Keep that separation: later game scenes such as
Constellation and Bauhaus Circles can reuse the command engine while changing
their goals, obstacles, art, and feedback.

## Good first Codex prompts in VS Code

Use small, testable requests:

> Read README.md and the current code. Replace the temporary mascot shape with
> a sprite image while preserving its grid position, direction indicator,
> animation, and accessibility label. Do not change the command engine.

> Add a goal tile to the board. Keep the goal configuration separate from the
> GameEngine movement rules. Add a test for detecting when the mascot reaches
> the goal.

> Add a Constellation scene configuration that changes the board colors and
> goal condition but reuses MOVE, TURN_LEFT, TURN_RIGHT, RUN, STEP, RESET, and
> UNDO.
