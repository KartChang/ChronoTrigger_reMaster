import {build} from 'esbuild';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
import {surface,png} from './asset-export.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
/** Exports use the exact authored cell APIs. The manifest distinguishes production
 * NPC ambient uploads from staged directions/gaits and protected party combat art. */
export async function exportProductionCharacters(out=resolve('dist/art/production-vq04e')){
 await mkdir(out,{recursive:true});await mkdir('.test',{recursive:true});
 await build({stdin:{contents:"export * from './src/production-story-npc-art';export {STORY_NPC_KINDS} from './src/story-npc-art';export * from './src/production-combat-art';export {HD_HERO_IDS} from './src/hd-hero-art';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:'.test/production-character-export.mjs'});
 const a=await import(pathToFileURL(resolve('.test/production-character-export.mjs')).href),assets=[];
 async function sheet(name,poses,paint,pivot,runtime){
  const s=surface(768,poses.length*64),cells=[];
  for(const [row,pose]of poses.entries())for(let facing=0;facing<4;facing++)for(let frame=0;frame<4;frame++){
   const data=paint(pose,facing,frame),x=(facing*4+frame)*48,y=row*64;
   for(let yy=0;yy<64;yy++)Buffer.from(data.subarray(yy*192,(yy+1)*192)).copy(s.rgba,((y+yy)*768+x)*4);
   cells.push({pose,facing,frame,x,y,width:48,height:64,pivot,runtimeApplied:runtime(pose,facing),rgbaSha256:sha(data)});
  }
  const bytes=png(s);await writeFile(resolve(out,name+'.png'),bytes);assets.push({name,file:name+'.png',width:s.width,height:s.height,pngSha256:sha(bytes),rgbaSha256:sha(s.rgba),cells});
 }
 for(const kind of a.STORY_NPC_KINDS)await sheet('story-'+kind,['ambient','walk','greet'],(p,d,f)=>a.storyNpcProductionCell(kind,f,d,p),[24,63],(p,d)=>p==='ambient'&&d===0);
 for(const hero of a.HD_HERO_IDS)await sheet('combat-'+hero,a.COMBAT_ART.poses,(p,d,f)=>a.authoredCombatCell(hero,d,f,p),[24,62],()=>false);
 const manifest={schema:'chrono-vq04e-character-export-v1',approved:false,nativeEvidence:false,romExtracted:false,storyProfile:a.STORY_NPC_PRODUCTION.id,combatProfile:a.COMBAT_ART.id,
  authoredNpcCellSlots:336,runtimeNpcAmbientCellSlots:28,stagedNpcCellSlots:308,authoredCombatCellSlots:256,runtimeCombatCellSlots:0,activationHold:a.COMBAT_ART.activationHold,
  sourceSha256:sha(Buffer.concat(await Promise.all(['src/native-actor-pixels.ts','src/production-story-npc-art.ts','src/production-combat-art.ts'].map(p=>readFile(p))))),assets};
 await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)console.log(JSON.stringify(await exportProductionCharacters(process.argv[2]),null,2));
