const fs = require('fs');
const path = require('path');

const root = __dirname;
const dist = path.join(root, 'dist');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.mkdirSync(path.join(dist, 'assets'), { recursive: true });

['index.html', 'styles.css', 'app.js', 'code-viewer.js', 'code-viewer.css', 'projects.json'].forEach((file) => {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
});

['maro-directions.png', 'maro-front-strip.png'].forEach((file) => {
  fs.copyFileSync(path.join(root, 'assets', file), path.join(dist, 'assets', file));
});

console.log('Build complete. Files copied to /dist');
