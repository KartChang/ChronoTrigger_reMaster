import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const port=Number(process.env.PORT||4173);
createServer(async(req,res)=>{try{if(req.url==='/favicon.ico'){res.writeHead(204);res.end();return;}if(req.url?.split('?')[0]!=='/'&&req.url?.split('?')[0]!=='/index.html'){res.writeHead(404);res.end();return;}res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(await readFile(new URL('../dist/index.html',import.meta.url)));}catch{res.writeHead(503);res.end('Run npm run build first.');}}).listen(port,'127.0.0.1',()=>console.log(`Open http://127.0.0.1:${port} (local only)`));
