# On Your Code Main

This folder contains the main menu and its Node.js server. The four games remain
separate sibling folders; Main serves or launches them without merging their
code. It uses only Node.js built-ins, so the menu itself has no dependencies.

## First run

In a VS Code PowerShell terminal:

```powershell
cd Main
npm.cmd run setup
npm.cmd start
```

Open `http://127.0.0.1:4173/`.

Use `npm.cmd` on Windows because PowerShell may block the `npm.ps1` wrapper.
Press `Ctrl+C` in the terminal to stop the main server and any game opened from
it. Maro's Workshop starts only when its menu card is selected.

After the one-time setup, future runs only need:

```powershell
cd Main
npm.cmd start
```

## Add a future module

Add one entry to `projects.json`:

- `id`: URL-safe unique name.
- `name`: human-readable project name.
- `route`: stable URL ending in `/`.
- `folder`: folder beside `Main`.
- `type`: `static` for an HTML project or `vite` for a Vite project.
- `port`: required for a Vite project.

Then add its card to the root launcher and link it to the registered route.

## Build and preview GitHub Pages

Generate a fresh static publishing artifact without changing any source game:

```powershell
npm.cmd run deploy:build
```

The command replaces only the sibling `Deploy` folder. Preview it under a
repository-style subpath with:

```powershell
npm.cmd run deploy:preview
```

Open `http://127.0.0.1:4175/on-your-code/`. Commit `Deploy` when you are ready
to publish. The included GitHub Actions workflow uploads that folder to Pages.
