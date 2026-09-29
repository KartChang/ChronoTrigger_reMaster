import {build} from 'esbuild';import {mkdir,writeFile,readFile} from 'node:fs/promises';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';import {png} from './asset-export.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
export async function exportProductionGrove(out='dist/art/production-vq04l'){
 await mkdir(out,{recursive:true});await mkdir('.test',{recursive:true});await build({entryPoints:['src/production-grove-art.ts'],bundle:true,platform:'node',format:'esm',outfile:'.test/grove-export.mjs'});
 const {GROVE_ART,paintGroveSurface}=await import(pathToFileURL(resolve('.test/grove-export.mjs')).href),assets=[];
 for(const kind of ['fern-fronds','root-moss']){const p=paintGroveSurface(kind),rgba=Buffer.from(p.rgba),bytes=png({...p,rgba});await writeFile(resolve(out,kind+'.png'),bytes);assets.push({kind,file:kind+'.png',width:p.width,height:p.height,rgbaSha256:sha(rgba),pngSha256:sha(bytes),variants:4});}
 const manifest={schema:'chrono-vq04l-grove-export-v1',profile:GROVE_ART.id,approved:false,nativeEvidence:false,romExtracted:false,sourceSha256:sha(await readFile('src/production-grove-art.ts')),assets};await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)console.log(JSON.stringify(await exportProductionGrove(process.argv[2]),null,2));
