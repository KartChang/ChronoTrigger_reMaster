import {build} from 'esbuild';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {surface,png} from './asset-export.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
/** Same authored cells and rear-bank texture used at the real application upload.
 * Retained combat/reaction cells are explicitly labelled, not claimed as new artwork. */
export async function exportProductionParty(out=resolve('dist/art/production-vq04d')){
 await mkdir(out,{recursive:true});await mkdir('.test',{recursive:true});
 await build({stdin:{contents:"export * from './src/production-party-cell';export {PARTY_ART} from './src/production-party-art';export {paintCanyonHorizon,HORIZON_ART} from './src/canyon-horizon-finish';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',packages:'external',outfile:'.test/production-party-export.mjs'});
 const a=await import(pathToFileURL(resolve('.test/production-party-export.mjs')).href),assets=[];
 const save=async(name,sheet,extra={})=>{const rgba=Buffer.from(sheet.rgba),bytes=png({...sheet,rgba});await writeFile(resolve(out,name+'.png'),bytes);assets.push({name,file:name+'.png',width:sheet.width,height:sheet.height,rgbaSha256:sha(rgba),pngSha256:sha(bytes),...extra});};
 for(let h=0;h<4;h++){
  const sheet=surface(48*16,64*8),cells=[];
  for(let p=0;p<8;p++)for(let d=0;d<4;d++)for(let f=0;f<4;f++){
   const code=h*128+p*16+d*4+f,cell=a.partyCell(code),x=(d*4+f)*48,y=p*64,meta=a.decodePartyCell(code);
   for(let row=0;row<64;row++)Buffer.from(cell.subarray(row*48*4,(row+1)*48*4)).copy(sheet.rgba,((y+row)*sheet.width+x)*4);
   cells.push({...meta,x,y,width:48,height:64,redrawn:a.PARTY_ART.redrawnPoses.includes(meta.pose),rgbaSha256:sha(cell)});
  }
  await save('party-'+['crono','marle','lucca','frog'][h],sheet,{cells,redrawnCells:64,retainedCells:64,pivot:[24,62]});
 }
 await save('canyon-rear-bank',a.paintCanyonHorizon(),{profile:a.HORIZON_ART.id});
 const manifest={schema:'chrono-vq04d-party-art-export-v1',profile:a.PARTY_ART.id,approved:false,fullCharacterArtComplete:false,redrawnCells:256,retainedCombatReactionCells:256,redrawnPoses:a.PARTY_ART.redrawnPoses,retainedPoses:a.PARTY_ART.retainedPoses,nativeEvidence:false,sourceSha256:sha(await readFile('src/production-party-art.ts')),legacySourceSha256:sha(await readFile('src/hd-hero-art.ts')),assets};
 await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)console.log(JSON.stringify(await exportProductionParty(process.argv[2]),null,2));
