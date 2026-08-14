const http=require('http');
const fs=require('fs');
const path=require('path');
const PORT=process.env.PORT||3000;
const ROOT=__dirname;
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png'};
http.createServer((req,res)=>{
  const reqPath=req.url==='/'?'/index.html':decodeURI(req.url.split('?')[0]);
  const file=path.normalize(path.join(ROOT,reqPath));
  if(!file.startsWith(ROOT)){res.writeHead(403);return res.end('Forbidden');}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':MIME[path.extname(file)]||'application/octet-stream'});res.end(data);});
}).listen(PORT,()=>console.log(`Mini World Simulator running at http://localhost:${PORT}`));
