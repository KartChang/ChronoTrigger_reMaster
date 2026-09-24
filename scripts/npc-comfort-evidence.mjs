import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {isDeepStrictEqual as same} from 'node:util';
import {inspectCpuEraEvidence} from './cpu-era-evidence.mjs';
import {decodeCanvasPng} from './field-enemy-evidence.mjs';
const need=(ok,why)=>{if(!ok)throw Error('NPC comfort evidence: '+why);};
const sha=b=>createHash('sha256').update(b).digest('hex');
const ambient=(tick,seed)=>{const t=(tick+seed*37)%240;return t<90?0:t<180?1:t<189?2:3;};
/** Extra gate; does not weaken or rewrite any of the seven retained ledgers. */
export function assertNpcComfort(r,load){
 need(r?.schema==='chrono-native-npc-comfort-v1'&&r.status==='passed','completed native report');
 need(r.physicalDevice===false&&r.artApproved===false&&r.realTimeComfortApproved===false,'unsupported approval');
 need(typeof r.originalReduce==='boolean'&&r.fullStateEqual===true&&same(r.beforeState,r.afterState),'frozen full state');
 const s=r.beforeState;need(s?.chapter==='truce'&&Number.isSafeInteger(s.ticks)&&s.ticks>=0,'real town tick');
 need(same(r.phases?.map(p=>p.phase),['before','reduced','restored']),'three ordered phases');
 const files=[];
 for(const [i,p] of r.phases.entries()){
  const reduced=i===1?true:r.originalReduce,o=p.observation,n=o?.npc,m=n?.motion;
  need(same(p.state,s)&&same(p.repeated,o)&&o?.chapter==='truce'&&o.paused===true&&o.mediaReduce===reduced,'observed frozen boundary');
  need(n?.profile==='vq02q-story-npc-cloth-and-silhouette'&&n.approved===false,'retained NPC art');
  need(m?.profile==='vq03e-npc-motion-preference'&&m.clock==='simulation-ticks'&&m.tick===s.ticks&&m.reducedMotion===reduced&&m.stateMutation===false&&m.bindingCount===2,'runtime preference/tick');
  need(same(n.actors?.map(a=>a.name+':'+a.kind).sort(),['innkeeper:innkeeper','townsperson:resident']),'actual NPC role coverage');
  need(new Set(n.actors.map(a=>a.seed)).size===2,'distinct stable seeds');
  for(const a of n.actors){
   need(Number.isSafeInteger(a.seed)&&a.seed>=0&&Number.isSafeInteger(a.uploads)&&a.uploads>=0&&Number.isInteger(a.frame),'actor accounting');
   need(a.frame===(reduced?0:ambient(s.ticks,a.seed))&&same(a.cell,{width:48,height:64}),'authored frame/cell');
  }
  const v=o.renderer;need(v?.backend==='cpu-canvas2d'&&v.webglVersion===0&&v.samplingEnabled===true,'original CPU backend/quality');
  need(same(o.viewport,{width:960,height:640})&&typeof o.focus==='string','original paused viewport/focus');
  const image=p.image;need(image?.path===`npc-comfort/${p.phase}.png`&&image.source==='actual-cpu-canvas','original image ownership');
  const bytes=load(image.path);need(Buffer.isBuffer(bytes)&&bytes.length===image.bytes&&sha(bytes)===image.sha256,'original image bytes/hash');
  const png=decodeCanvasPng(bytes);need(png.width===v.width&&png.height===v.height,'original decoded canvas dimensions');
  let low=255,high=0;for(let j=0;j<png.rgba.length;j+=4){need(png.rgba[j+3]===255,'opaque scene');for(let k=0;k<3;k++){low=Math.min(low,png.rgba[j+k]);high=Math.max(high,png.rgba[j+k]);}}
  need(high-low>16,'nonblank original scene');files.push({path:image.path,bytes:bytes.length,sha256:image.sha256});
 }
 const first=r.phases[0].observation,last=r.phases[2].observation;
 need(files[0].sha256===files[2].sha256,'restored exact canvas');
 for(const key of ['focus','viewport','renderer'])need(same(first[key],last[key]),'restored '+key);
 for(const [j,a] of first.npc.actors.entries()){
  const middle=r.phases[1].observation.npc.actors[j],z=last.npc.actors[j];
  need(a.name===middle.name&&a.name===z.name&&a.seed===middle.seed&&a.seed===z.seed,'stable actor ownership');
  need(middle.uploads===a.uploads+(a.frame===middle.frame?0:1)&&z.uploads===middle.uploads+(middle.frame===z.frame?0:1),'single upload per changed pose');
 }
 return files;
}
export function inspectNpcComfort({dir,buildDir,sourceSha,runId,runAttempt}){
 const parent=inspectCpuEraEvidence({dir,buildDir,sourceSha,runId,runAttempt});
 const bytes=readFileSync(join(dir,'report.json')),r=JSON.parse(bytes);
 const extra=r.villageLayouts?.npcComfort;
 need(same(extra?.beforeState,r.villageLayouts?.before)&&same(extra?.afterState,r.villageLayouts?.after),'same original paused visit');
 const files=assertNpcComfort(extra,path=>readFileSync(join(dir,path)));
 const before=readFileSync(join(dir,'village-canvas-0.png'));
 need(files[0].sha256===sha(before)&&files[0].bytes===before.length,'same original village canvas');
 return {schema:'chrono-npc-comfort-source-ledger-v1',status:'passed',sourceSha,runId,runAttempt,
  htmlSha256:parent.htmlSha256,htmlBytes:parent.htmlBytes,files:[{path:'report.json',bytes:bytes.length,sha256:sha(bytes)},...files],
  originalSevenLedgersModified:false,physicalDevice:false,artApproved:false,realTimeComfortApproved:false,wholeGameAccepted:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const r=inspectNpcComfort({dir:'test-results/cpu-renderer/era600',buildDir:'dist',sourceSha:process.env.GITHUB_SHA,runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT});writeFileSync('test-results/cpu-renderer/era600/npc-comfort-source-ledger.json',JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));}
 catch(e){console.error(e);process.exitCode=1;}
}
