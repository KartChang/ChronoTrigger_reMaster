import {build} from 'esbuild';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
import {png} from './asset-export.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
/** Exact renderer author API; these are reusable assets, not native gameplay captures. */
export async function exportProductionPlaces(out=resolve('dist/art/production-vq04f')){
 await mkdir(out,{recursive:true});await mkdir('.test',{recursive:true});
 await build({entryPoints:['src/production-place-art.ts'],bundle:true,platform:'node',format:'esm',outfile:'.test/production-place-export.mjs'});
 const {PLACE_ART,paintPlaceSurface}=await import(pathToFileURL(resolve('.test/production-place-export.mjs')).href),assets=[];
 for(const kind of Object.keys(PLACE_ART.dimensions)){
  const p=paintPlaceSurface(kind),rgba=Buffer.from(p.rgba),bytes=png({...p,rgba});await writeFile(resolve(out,kind+'.png'),bytes);
  assets.push({kind,file:kind+'.png',width:p.width,height:p.height,rawBytes:rgba.length,pngSha256:sha(bytes),rgbaSha256:sha(rgba),alpha:kind==='town-verge'});
 }
 const manifest={schema:'chrono-vq04f-place-export-v1',profile:PLACE_ART.id,approved:false,nativeEvidence:false,romExtracted:false,sourceSha256:sha(Buffer.concat(await Promise.all(['src/production-place-art.ts','src/woodland-art.ts','src/surface-layout.ts','src/kingdom-data.ts'].map(p=>readFile(p))))),assets};
 await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)console.log(JSON.stringify(await exportProductionPlaces(process.argv[2]),null,2));
