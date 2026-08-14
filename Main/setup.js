const { spawn } = require("node:child_process");
const path = require("node:path");

const workspaceRoot = path.resolve(__dirname, "..");
const workshopRoot = path.join(workspaceRoot, "Five Scenes");
const npmCli = path.join(
  path.dirname(process.execPath),
  "node_modules",
  "npm",
  "bin",
  "npm-cli.js",
);

console.log("Installing Maro's Workshop dependencies…");

if (!require("node:fs").existsSync(npmCli)) {
  console.error(`npm was not found beside Node.js at ${npmCli}`);
  process.exit(1);
}

const installer = spawn(process.execPath, [npmCli, "install"], {
  cwd: workshopRoot,
  stdio: "inherit",
  shell: false,
});

installer.on("error", (error) => {
  console.error(`Could not start npm: ${error.message}`);
  process.exitCode = 1;
});

installer.on("exit", (code) => {
  if (code === 0) {
    console.log("\nSetup complete. Run: npm.cmd start");
    return;
  }

  process.exitCode = code ?? 1;
});
