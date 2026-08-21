# Maro's Workshop 2 — Creature Behavior Lab

A standalone interactive scene for **On Your Code**.

## Concept
Players create cute Maro-style creatures, assign simple behavior rules, and test them in a small sandbox. The goal is to make programming feel like **giving personality through rules**.

## Features
- Bauhaus-inspired UI with Maro-kun palette
- Maro moves with arrow keys / WASD
- Creature builder with editable body, colors, eyes, accessory, behavior, and speed
- Live rule preview in pseudo-code form
- Preset save/load system using browser localStorage
- Up to 5 live creatures in the world at once
- English/Japanese toggle and a language-aware `<Code>` pseudocode viewer
- Selection without a circular wrapper around the creature artwork

## Controls
- **Move Maro:** Arrow keys or WASD
- **Select creature:** Click it on the stage or use the roster panel
- **Release creature:** Use the builder panel

## Run locally
```bash
npm run setup
npm start
```
Then open:

```text
http://localhost:3000
```

## Build
```bash
npm run build
```

## File structure
- `index.html` — main page
- `styles.css` — UI styling
- `app.js` — simulation logic and rendering
- `assets/` — Maro sprite references used in the scene
- `server.js` — lightweight local server
- `build-deploy.js` — copies a deployable version to `/dist`
- `preview-deploy.js` — preview helper
- `projects.json` — metadata
