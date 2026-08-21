const fs=require('fs');
const path=require('path');
const root=__dirname,dist=path.join(root,'dist');
fs.rmSync(dist,{recursive:true,force:true});
fs.mkdirSync(path.join(dist,'assets'),{recursive:true});
['index.html','styles.css','app.js','hunger.js','code-viewer.js','code-viewer.css','projects.json'].forEach(f=>fs.copyFileSync(path.join(root,f),path.join(dist,f)));
['maro-directions.png','maro-front-strip.png'].forEach(f=>fs.copyFileSync(path.join(root,'assets',f),path.join(dist,'assets',f)));
console.log('Build complete: /dist');
