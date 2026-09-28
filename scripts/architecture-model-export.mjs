import {build} from 'esbuild';import {mkdir,readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';
/** Geometry recipe is the actual renderer's author API, not a screenshot or native proof. */
export async function exportArchitecture(out='dist/art/production-vq04h'){
 await mkdir(out,{recursive:true});await mkdir('.test',{recursive:true});
 await build({entryPoints:['src/production-architecture-art.ts'],outfile:'.test/architecture-author-export.mjs',bundle:true,platform:'node',format:'esm'});
 const {ARCHITECTURE_ART}=await import(pathToFileURL(resolve('.test/architecture-author-export.mjs')).href);
 const result={schema:'chrono-vq04h-geometry-recipe-v1',profile:ARCHITECTURE_ART,sourceSha256:createHash('sha256').update(await readFile('src/production-architecture-art.ts')).digest('hex'),nativeEvidence:false,approved:false,romExtracted:false,newBitmapAssets:0,notice:'Private geometry copies only. No actor/sign bitmap, XZ footprint, camera or gameplay change.'};
 await writeFile(resolve(out,'architecture-model.json'),JSON.stringify(result,null,2)+'\n');return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)console.log(JSON.stringify(await exportArchitecture(process.argv[2]),null,2));
