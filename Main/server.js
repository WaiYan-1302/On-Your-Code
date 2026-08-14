const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const host = "127.0.0.1";
const mainPort = Number(process.env.PORT || 4173);
const workspaceRoot = path.resolve(__dirname, "..");
const launcherRoot = __dirname;
const projects = JSON.parse(
  fs.readFileSync(path.join(__dirname, "projects.json"), "utf8"),
);
const children = new Map();

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function send(response, status, body, type = "text/plain; charset=utf-8") {
  response.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(body);
}

function serveFile(response, filePath, allowedRoot) {
  const resolvedRoot = path.resolve(allowedRoot);
  const resolvedFile = path.resolve(filePath);

  if (
    resolvedFile !== resolvedRoot &&
    !resolvedFile.startsWith(`${resolvedRoot}${path.sep}`)
  ) {
    send(response, 403, "Forbidden");
    return;
  }

  fs.stat(resolvedFile, (error, stats) => {
    if (error || !stats.isFile()) {
      send(response, 404, "Project file not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(resolvedFile).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    });
    fs.createReadStream(resolvedFile).pipe(response);
  });
}

function staticProject(response, project, pathname) {
  const projectRoot = path.join(workspaceRoot, project.folder);
  const relativeUrl = pathname.slice(project.route.length);
  let relativePath;

  try {
    relativePath = decodeURIComponent(relativeUrl);
  } catch {
    send(response, 400, "Invalid URL");
    return;
  }

  const requested = relativePath && !relativePath.endsWith("/")
    ? relativePath
    : `${relativePath}index.html`;
  serveFile(response, path.join(projectRoot, requested), projectRoot);
}

function isPortReady(port) {
  return new Promise((resolve) => {
    const request = http.get(
      { host, port, path: "/", timeout: 700 },
      (response) => {
        response.resume();
        resolve(true);
      },
    );
    request.on("error", () => resolve(false));
    request.on("timeout", () => {
      request.destroy();
      resolve(false);
    });
  });
}

function workshopPage(project) {
  const appUrl = `http://${host}:${project.port}/`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${project.name} · On Your Code</title>
  <style>
    *{box-sizing:border-box}html,body{height:100%;margin:0}body{display:grid;grid-template-rows:54px 1fr;background:#f4efe5;color:#17233d;font-family:Inter,system-ui,sans-serif}.bar{display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:2px solid #17233d;background:#ffc857;font-size:12px;font-weight:900;letter-spacing:.08em}.bar a{display:inline-flex;align-items:center;min-height:36px;padding:0 12px;border:2px solid #17233d;border-radius:999px;background:#fffdf8;color:inherit;text-decoration:none}.bar a:focus-visible{outline:4px solid #5578ff;outline-offset:2px}iframe{width:100%;height:100%;border:0;background:#fff}.loading{display:grid;place-items:center;padding:30px;text-align:center}.loading b{display:block;margin-bottom:8px;font-size:24px}.loading code{display:inline-block;margin-top:12px;padding:10px;border:2px solid #17233d;background:#fffdf8}
  </style>
</head>
<body>
  <header class="bar"><a href="/">← MAIN MENU</a><span>MARO'S WORKSHOP</span></header>
  <div id="stage" class="loading"><div><b>Opening the workshop…</b><span>The creative tools are starting.</span></div></div>
  <script>
    const stage = document.getElementById("stage");
    let attempts = 0;
    async function connect() {
      attempts += 1;
      try {
        const response = await fetch("/api/projects/${project.id}/status");
        const status = await response.json();
        if (status.ready) {
          const frame = document.createElement("iframe");
          frame.src = ${JSON.stringify(appUrl)};
          frame.title = ${JSON.stringify(project.name)};
          frame.allow = "clipboard-write";
          stage.replaceWith(frame);
          return;
        }
        if (status.needsSetup) {
          stage.innerHTML = '<div><b>One-time setup needed</b><span>Stop the server, run this inside the Main folder, then start again:</span><br><code>npm.cmd run setup</code></div>';
          return;
        }
      } catch {}
      if (attempts < 30) setTimeout(connect, 700);
      else stage.innerHTML = '<div><b>The workshop did not start</b><span>Check the Main terminal for the exact error.</span></div>';
    }
    connect();
  </script>
</body>
</html>`;
}

function startViteProject(project) {
  if (children.has(project.id)) return;

  const projectRoot = path.join(workspaceRoot, project.folder);
  const viteBinary = path.join(
    projectRoot,
    "node_modules",
    "vite",
    "bin",
    "vite.js",
  );

  if (!fs.existsSync(viteBinary)) return;

  const child = spawn(
    process.execPath,
    [viteBinary,
    "--host", host, "--port", String(project.port), "--strictPort"],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        ON_YOUR_CODE_MAIN: "1",
        WRANGLER_LOG_PATH: path.join(projectRoot, ".wrangler", "wrangler.log"),
      },
      // Keep the child app's port out of the Main terminal. Players should
      // always enter games through the menu at port 4173.
      stdio: ["ignore", "ignore", "pipe"],
      shell: false,
    },
  );

  children.set(project.id, child);
  child.stderr.on("data", (chunk) => {
    const message = chunk.toString().trim();
    if (message) console.error(`[${project.name}] ${message}`);
  });
  child.on("exit", (code) => {
    children.delete(project.id);
    if (code && code !== 0) {
      console.error(`[${project.name}] stopped with code ${code}.`);
    }
  });
  child.on("error", (error) => {
    console.error(`[${project.name}] ${error.message}`);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || `${host}:${mainPort}`}`);
  const pathname = url.pathname;

  if (pathname === "/") {
    serveFile(response, path.join(launcherRoot, "index.html"), launcherRoot);
    return;
  }

  if (pathname === "/styles.css" || pathname === "/app.js") {
    serveFile(response, path.join(launcherRoot, pathname.slice(1)), launcherRoot);
    return;
  }

  if (pathname === "/i18n.js") {
    serveFile(response, path.join(workspaceRoot, "i18n.js"), workspaceRoot);
    return;
  }

  const project = projects.find(
    (item) => pathname === item.route.slice(0, -1) || pathname.startsWith(item.route),
  );

  if (project) {
    if (pathname === project.route.slice(0, -1)) {
      response.writeHead(308, { Location: project.route });
      response.end();
      return;
    }

    if (project.type === "static") {
      staticProject(response, project, pathname);
      return;
    }

    startViteProject(project);
    send(response, 200, workshopPage(project), "text/html; charset=utf-8");
    return;
  }

  const statusMatch = pathname.match(/^\/api\/projects\/([^/]+)\/status$/);
  if (statusMatch) {
    const target = projects.find((item) => item.id === statusMatch[1]);
    if (!target || target.type !== "vite") {
      send(response, 404, JSON.stringify({ error: "Unknown project" }), "application/json");
      return;
    }

    const projectRoot = path.join(workspaceRoot, target.folder);
    const needsSetup = !fs.existsSync(path.join(projectRoot, "node_modules"));
    const ready = !needsSetup && await isPortReady(target.port);
    send(response, 200, JSON.stringify({ ready, needsSetup }), "application/json");
    return;
  }

  send(response, 404, "Page not found");
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error("\n============================================");
    console.error(" ON YOUR CODE · MAIN MENU IS ALREADY RUNNING");
    console.error(` http://${host}:${mainPort}/`);
    console.error("============================================");
    console.error("Open the address above, or stop the older terminal with Ctrl+C before restarting.\n");
    process.exit(1);
    return;
  }

  console.error(`\nCould not start the Main menu: ${error.message}\n`);
  process.exit(1);
});

server.listen(mainPort, host, () => {
  console.log("\n============================================");
  console.log(" ON YOUR CODE · MAIN MENU");
  console.log(` http://${host}:${mainPort}/`);
  console.log("============================================");
  console.log("Open the address above. Games start from its cards.");
  console.log("Press Ctrl+C to stop.\n");
});

function shutdown() {
  for (const child of children.values()) child.kill();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1500).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
