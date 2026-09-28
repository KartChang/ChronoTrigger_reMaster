import {build} from 'esbuild';import {mkdir,writeFile,readFile} from 'node:fs/promises';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';import {surface,png} from './asset-export.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
/** Reuses E author pixels; G's activation manifest supersedes E's historical flags. */
export async function exportNpcAttention(out='dist/art/production-vq04g'){
 await mkdir(out,{recursive:true});await mkdir('.test',{recursive:true});
 await build({stdin:{contents:"export * from './src/production-story-npc-art';export {STORY_NPC_KINDS} from './src/story-npc-art';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:'.test/npc-attention-export.mjs'});
 const a=await import(pathToFileURL(resolve('.test/npc-attention-export.mjs')).href),assets=[];
 for(const kind of a.STORY_NPC_KINDS){const s=surface(768,128),cells=[];
  for(const [row,pose] of ['ambient','greet'].entries())for(let facing=0;facing<4;facing++)for(let frame=0;frame<4;frame++){
   const data=a.storyNpcProductionCell(kind,frame,facing,pose),x=(facing*4+frame)*48,y=row*64;
   for(let yy=0;yy<64;yy++)Buffer.from(data.subarray(yy*192,(yy+1)*192)).copy(s.rgba,((y+yy)*768+x)*4);
   cells.push({pose,facing,frame,x,y,width:48,height:64,pivot:[24,63],runtimeEligible:true,rgbaSha256:sha(data)});
  }
  const file='story-'+kind+'.png',bytes=png(s);await writeFile(resolve(out,file),bytes);assets.push({kind,file,width:768,height:128,pngSha256:sha(bytes),rgbaSha256:sha(s.rgba),cells});
 }
 const m={schema:'chrono-vq04g-npc-attention-export-v1',approved:false,nativeEvidence:false,romExtracted:false,authorProfile:a.STORY_NPC_PRODUCTION.id,activationProfile:'vq04g-live-npc-attention',reusedAuthorPixels:true,runtimeEligibleNpcCellSlots:224,stagedNpcWalkCellSlots:112,directionalMovementEnabled:false,runtimeCombatCellSlots:0,activationNote:'G supersedes historical E activation metadata, not its authored pixels. Eligibility is not proof every slot appeared in native evidence.',authorSha256:sha(await readFile('src/production-story-npc-art.ts')),assets};
 await writeFile(resolve(out,'manifest.json'),JSON.stringify(m,null,2)+'\n');return m;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)console.log(JSON.stringify(await exportNpcAttention(process.argv[2]),null,2));
