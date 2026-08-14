# On Your Code · Day 2

A mobile-first set of three guided programming challenges for the On Your Mark
camp. It uses the four-direction Maro sprite and runs as a static website.

## Teaching progression

1. **Reach the lantern — Sequence**  
   Students build the four-command route `MOVE, MOVE, TURN RIGHT, MOVE`.
2. **Repair the mistake — Prediction and debugging**  
   Students must predict Maro’s stopping tile before running a supplied
   five-command program. After observing the wrong result, tapping a program
   command opens replacement mode and enables the three command choices.
3. **Too many commands — Repetition**  
   A square route requires eight primitive commands, but only six slots are
   available. The first unsuccessful attempt unlocks a `REPEAT 4 TIMES` block;
   placing `MOVE` and `TURN RIGHT` inside solves the route.

Each completed challenge reveals a one-sentence explanation card.

## Run in VS Code

1. Open this folder in VS Code.
2. Install the **Live Server** extension if needed.
3. Right-click `index.html` and choose **Open with Live Server**.
4. Use a phone-sized browser viewport to preview the student experience.

No framework or package installation is required.

## Test

With Node.js installed:

```bash
npm test
```

The tests verify all three intended solutions, the prediction and replacement
gates, the repeat unlock, short explanation cards, and the directional Maro
sprite contract.

## Deploy

This folder can be deployed directly to GitHub Pages or itch.io as an HTML
project. Keep the directory structure unchanged so the module and sprite paths
continue to work.

## Structure

```text
on-your-code-day2/
├── assets/characters/maro/
│   └── maro-walk-4directions-4frames-128-v2.png
├── js/
│   ├── app.js
│   ├── challenges.js
│   └── game-engine.js
├── test/
│   ├── game-engine.test.js
│   └── ui-contract.test.js
├── index.html
├── styles.css
├── package.json
└── README.md
```
