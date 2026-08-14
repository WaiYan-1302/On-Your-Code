# On Your Code · Modular Hub

The `Main` folder contains the Node.js launcher and its menu files. Every scene
remains an independent sibling game folder. Run the menu from `Main` instead of
opening an HTML file directly.

## Menu order

1. Scene 1 — First Steps
2. Scene 2 — Think Ahead
3. ChallengeLab — Challenge Lab
4. Five Scenes — Maro's Workshop

## Run

```powershell
cd Main
npm.cmd run setup
npm.cmd start
```

Then open `http://127.0.0.1:4173/`. The setup command is needed only once.

The main server serves the three static games and starts Maro's Workshop only
when its card is selected. `Main/projects.json` is the registry for current and
future game folders.

## Publish to GitHub Pages

Keep the modular source folders intact and generate the standalone static site:

```powershell
cd Main
npm.cmd run deploy:build
```

This replaces only `Deploy/`. To check the exact repository-subpath behavior:

```powershell
npm.cmd run deploy:preview
```

Commit the generated `Deploy` folder. In the GitHub repository, select
**Settings → Pages → Source: GitHub Actions**. The workflow in
`.github/workflows/deploy-pages.yml` publishes `Deploy` whenever it changes on
the `main` branch.
