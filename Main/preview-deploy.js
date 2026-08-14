const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const host = "127.0.0.1";
const port = Number(process.env.DEPLOY_PORT || 4175);
const basePath = "/on-your-code/";
const deployRoot = path.resolve(__dirname, "..", "Deploy");
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

if (!fs.existsSync(path.join(deployRoot, "index.html"))) {
  console.error("Deploy is missing. Run `npm.cmd run deploy:build` first.");
  process.exit(1);
}

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${host}:${port}`).pathname);

  if (pathname === "/") {
    response.writeHead(302, { Location: basePath });
    response.end();
    return;
  }

  if (!pathname.startsWith(basePath)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  const relative = pathname.slice(basePath.length);
  const requested = relative && !relative.endsWith("/")
    ? relative
    : `${relative}index.html`;
  const filePath = path.resolve(deployRoot, requested);

  if (filePath !== deployRoot && !filePath.startsWith(`${deployRoot}${path.sep}`)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    fs.createReadStream(filePath).pipe(response);
  });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the older preview first.`);
    process.exit(1);
  }
  throw error;
});

server.listen(port, host, () => {
  console.log(`\nGitHub Pages preview: http://${host}:${port}${basePath}`);
  console.log("Press Ctrl+C to stop.\n");
});
