import {build} from 'esbuild';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {surface,png} from './asset-export.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
/** Authored working atlases: same source painters + pigment pass as the application.
 * No assembled atlas is used as a screenshot or proof of complete animation. */
export async function exportProductionActors(out=resolve('dist/art/production-vq04b')){
 await mkdir(out,{recursive:true});await mkdir('.test',{recursive:true});
 await build({stdin:{contents:"export {finishActorPixels,ACTOR_FINISH} from './src/production-actor-finish';export {drawWitness,WITNESS_KINDS} from './src/witness-art';export {paintProductionForestFloor} from './src/production-art';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',packages:'external',outfile:'.test/production-actor-export.mjs'});
 const a=await import(pathToFileURL(resolve('.test/production-actor-export.mjs')).href),assets=[];
 const save=async(name,sheet,extra={})=>{const rgba=Buffer.from(sheet.rgba),bytes=png({...sheet,rgba});await writeFile(resolve(out,name+'.png'),bytes);assets.push({name,file:name+'.png',width:sheet.width,height:sheet.height,rgbaSha256:sha(rgba),pngSha256:sha(bytes),...extra});};
 for(const kind of a.WITNESS_KINDS){const sheet=surface(48*4,64);for(let f=0;f<4;f++){const cell=surface(48,64);a.drawWitness(cell.ink,kind,f);const data=a.finishActorPixels(new Uint8ClampedArray(cell.rgba));for(let y=0;y<64;y++)Buffer.from(data.subarray(y*48*4,(y+1)*48*4)).copy(sheet.rgba,(y*192+f*48)*4);}await save('witness-'+kind,sheet,{frames:4,runtimeScope:'courtroom supporting cast only; other locations retain original witness art'});}
 await save('guardia-forest-floor',a.paintProductionForestFloor(),{source:'existing owned floor repaint',additionalGpuTextures:0});
 const manifest={schema:'chrono-vq04b-finish-export-v1',profile:a.ACTOR_FINISH.id,runtimeScope:'courtroom supporting cast only',partyEnemyPaintersRetained:true,approved:false,posesRedrawn:false,conceptImagesEmbedded:false,sourceSha256:sha(await readFile('src/production-actor-finish.ts')),assets};
 await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)console.log(JSON.stringify(await exportProductionActors(process.argv[2]),null,2));
