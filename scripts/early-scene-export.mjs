import {build} from 'esbuild';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {png} from './asset-export.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
/** Real production surface exports, not gameplay screenshots or artistic approval. */
export async function exportEarlyScenes(out=resolve('dist/art/production-vq04c')){
 await mkdir(out,{recursive:true});await mkdir('.test',{recursive:true});
 await build({entryPoints:['src/early-scene-art.ts'],bundle:true,format:'esm',platform:'node',outfile:'.test/early-scene-export.mjs'});
 const {EARLY_SCENE_ART,paintEarlySceneSurface}=await import(pathToFileURL(resolve('.test/early-scene-export.mjs')).href),assets=[];
 for(const kind of Object.keys(EARLY_SCENE_ART.dimensions)){
  const pixels=paintEarlySceneSurface(kind),rgba=Buffer.from(pixels.rgba),bytes=png({...pixels,rgba});await writeFile(resolve(out,kind+'.png'),bytes);
  assets.push({kind,file:kind+'.png',width:pixels.width,height:pixels.height,rgbaSha256:sha(rgba),pngSha256:sha(bytes)});
 }
 const manifest={schema:'chrono-early-scene-art-vq04c-v1',profile:EARLY_SCENE_ART.id,approved:false,sourceSha256:sha(await readFile('src/early-scene-art.ts')),method:'same-runtime-authored-pixels',conceptImagesEmbedded:false,assets};
 await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)console.log(JSON.stringify(await exportEarlyScenes(process.argv[2]),null,2));
