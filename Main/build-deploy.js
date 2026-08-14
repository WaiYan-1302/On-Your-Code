const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");

const workspaceRoot = path.resolve(__dirname, "..");
const deployRoot = path.join(workspaceRoot, "Deploy");
const workshopRoot = path.join(workspaceRoot, "Five Scenes");
const workshopOutput = path.join(workshopRoot, "deploy-dist");

if (
  path.dirname(deployRoot) !== workspaceRoot ||
  path.basename(deployRoot) !== "Deploy"
) {
  throw new Error(`Unsafe deployment path: ${deployRoot}`);
}

const viteCli = path.join(
  workshopRoot,
  "node_modules",
  "vite",
  "bin",
  "vite.js",
);

if (!fs.existsSync(viteCli)) {
  console.error("Maro's Workshop dependencies are missing.");
  console.error("Run `npm.cmd run setup` in Main, then try again.");
  process.exit(1);
}

console.log("Building the static Maro's Workshop…");
const build = spawnSync(
  process.execPath,
  [viteCli, "build", "--config", "vite.deploy.config.ts"],
  { cwd: workshopRoot, stdio: "inherit", shell: false },
);

if (build.status !== 0) process.exit(build.status ?? 1);

console.log("Creating a fresh Deploy folder…");
fs.rmSync(deployRoot, { recursive: true, force: true });
fs.mkdirSync(deployRoot, { recursive: true });

function copyFile(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function copyTree(source, destination, ignored = new Set()) {
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyTree(from, to, ignored);
    else if (entry.isFile()) copyFile(from, to);
  }
}

for (const file of ["index.html", "styles.css", "app.js"]) {
  copyFile(path.join(__dirname, file), path.join(deployRoot, file));
}
copyFile(path.join(workspaceRoot, "i18n.js"), path.join(deployRoot, "i18n.js"));

const ignoredProjectFiles = new Set([
  "node_modules",
  "test",
  "tests",
  "package.json",
  "package-lock.json",
  "README.md",
  "INTEGRATION.md",
]);

for (const project of [
  { folder: "Scene 1", output: "scene-1" },
  { folder: "Scene 2", output: "scene-2" },
  { folder: "ChallengeLab", output: "challenge-lab" },
]) {
  copyTree(
    path.join(workspaceRoot, project.folder),
    path.join(deployRoot, project.output),
    ignoredProjectFiles,
  );
}

copyTree(workshopOutput, path.join(deployRoot, "workshop"));
fs.writeFileSync(path.join(deployRoot, ".nojekyll"), "");

function versionStaticAssets(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      versionStaticAssets(filePath);
      continue;
    }
    if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== ".html") continue;

    const html = fs.readFileSync(filePath, "utf8");
    const versioned = html.replace(
      /((?:src|href)=")(\.\.?\/[^"?]+\.(?:css|js))(?:\?[^"#]*)?("\s*\/?>?)/gi,
      (match, before, assetUrl, after) => {
        const assetPath = path.resolve(path.dirname(filePath), assetUrl);
        if (!assetPath.startsWith(`${deployRoot}${path.sep}`) || !fs.existsSync(assetPath)) return match;
        const hash = crypto
          .createHash("sha256")
          .update(fs.readFileSync(assetPath))
          .digest("hex")
          .slice(0, 10);
        return `${before}${assetUrl}?v=${hash}${after}`;
      },
    );
    fs.writeFileSync(filePath, versioned);
  }
}

versionStaticAssets(deployRoot);

const required = [
  "index.html",
  "styles.css",
  "app.js",
  "scene-1/index.html",
  "scene-2/index.html",
  "challenge-lab/index.html",
  "workshop/index.html",
];

const missing = required.filter(
  (relativePath) => !fs.existsSync(path.join(deployRoot, relativePath)),
);

if (missing.length) {
  console.error(`Deploy validation failed. Missing: ${missing.join(", ")}`);
  process.exit(1);
}

const mainHtml = fs.readFileSync(path.join(deployRoot, "index.html"), "utf8");
for (const route of ["./scene-1/", "./scene-2/", "./challenge-lab/", "./workshop/"]) {
  if (!mainHtml.includes(`href="${route}"`)) {
    console.error(`Deploy validation failed. Main menu is missing ${route}`);
    process.exit(1);
  }
}

const files = fs.readdirSync(deployRoot, { recursive: true, withFileTypes: true });
const totalBytes = files
  .filter((entry) => entry.isFile())
  .reduce((sum, entry) => sum + fs.statSync(path.join(entry.parentPath, entry.name)).size, 0);

console.log(`\nDeploy is ready: ${deployRoot}`);
console.log(`Published size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
