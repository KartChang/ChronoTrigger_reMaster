import {build} from 'esbuild';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {png} from './asset-export.mjs';
/** Exports the exact runtime pixels, not the approved concept images or a fake gameplay view. */
export async function exportProductionArt(out=resolve('dist/art/production-vq04a')){
 await mkdir(out,{recursive:true});await mkdir('.test',{recursive:true});
 await build({entryPoints:['src/production-art.ts'],bundle:true,platform:'node',format:'esm',outfile:'.test/production-art-export.mjs'});
 const {paintProductionSurface,PRODUCTION_ART}=await import(pathToFileURL(resolve('.test/production-art-export.mjs')).href);
 const sourceSha256=createHash('sha256').update(await readFile('src/production-art.ts')).digest('hex'),assets=[];
 for(const kind of Object.keys(PRODUCTION_ART.dimensions)){
  const surface=paintProductionSurface(kind),rgba=Buffer.from(surface.rgba),bytes=png({...surface,rgba});
  await writeFile(resolve(out,kind+'.png'),bytes);
  assets.push({kind,file:kind+'.png',width:surface.width,height:surface.height,rawBytes:rgba.length,rgbaSha256:createHash('sha256').update(rgba).digest('hex'),pngSha256:createHash('sha256').update(bytes).digest('hex')});
 }
 const manifest={schema:'chrono-vq04a-runtime-art-export-v1',profile:PRODUCTION_ART.id,approved:false,sourceSha256,sampling:'nearest',method:'Authored deterministic pixel surfaces used by ArtDirectedWorld. Concept images are not embedded.',assets};
 await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)console.log(JSON.stringify(await exportProductionArt(process.argv[2]),null,2));
