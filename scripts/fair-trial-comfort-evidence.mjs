import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {isDeepStrictEqual as same} from 'node:util';
import {inspectLane} from './ci-evidence.mjs';
import {inspectCpuAdventureEvidence} from './cpu-adventure-evidence.mjs';
import {inspectCpuEvidence} from './cpu-evidence.mjs';
import {decodeCanvasPng} from './field-enemy-evidence.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const need=(ok,why)=>{if(!ok)throw Error('Fair/trial comfort: '+why);};
const chapters={'fair-witnesses':'fair','fair-vendors':'fair',courtroom:'courtroom','forest-gate':'guardia1000'};
const roles={conduct:['elder','girl','merchant'],vendors:['shopper','shopper','shopper'],courtroom:['defender','judge','prosecutor'],'forest-gate':['guard','guard','guard']};
const frame=(t,seed)=>{const n=(t+seed*37)%240;return n<90?0:n<180?1:n<189?2:3;};
/** Extra source-bound gate. Unit fixtures are never exported as native results. */
export function assertWitnessComfort(r,load,id,key,backend){
 need(Object.hasOwn(chapters,key)&&r?.key===key&&r.schema==='chrono-native-fair-trial-comfort-v1'&&r.status==='passed'&&!r.error&&!r.cleanupError,'completed original report');
 for(const k of ['sourceSha','runId','runAttempt','htmlSha256','htmlBytes'])need(r[k]===id[k],'identity '+k);
 need(r.physicalDevice===false&&r.artApproved===false&&r.realTimeComfortApproved===false,'unsupported approval');
 const s=r.beforeState;
 need(s?.chapter===chapters[key]&&Number.isSafeInteger(s.ticks)&&s.ticks>=0&&same(s,r.afterState)&&r.fullStateEqual===true,'frozen full state');
 need(typeof r.originalReduce==='boolean'&&same(r.phases?.map(p=>p.phase),['before','reduced','restored']),'ordered preferences');
 const expected=key==='fair-witnesses'?['conduct','vendors']:key==='fair-vendors'?['vendors']:['trial'];
 const files=[];
 for(const [index,p] of r.phases.entries()){
  const reduced=index===1?true:r.originalReduce,o=p.observation;
  need(same(s,p.state)&&same(o,p.repeated)&&o?.chapter===s.chapter&&o.paused===true&&o.mediaReduce===reduced,'repeated paused observation');
  need(same(Object.keys(o.groups??{}).sort(),expected),'actual motion groups');
  for(const [name,g] of Object.entries(o.groups)){
   const m=g.motion,a=g.actors;need(g.profile==='outlined-live-actors-r2'&&m?.profile==='vq03f-witness-motion-preference','retained witness profile');
   need(m.clock==='simulation-ticks'&&m.tick===s.ticks&&m.reducedMotion===reduced&&m.stateMutation===false,'presentation clock/preference');
   need(Array.isArray(a)&&a.length>0&&Number.isSafeInteger(m.bindingCount)&&m.bindingCount>=a.length,'binding accounting');
   need(same(a.map(n=>n.kind).sort(),roles[name==='trial'?key:name]),'required native role coverage');
   need(new Set(a.map(n=>n.seed)).size===a.length,'distinct seeds');
   for(const n of a){need(typeof n.name==='string'&&n.name.length>0&&Number.isSafeInteger(n.seed)&&n.seed>=0&&Number.isSafeInteger(n.uploads)&&n.uploads>=1,'actor ownership/accounting');need(n.frame===(reduced?0:frame(s.ticks,n.seed))&&same(n.cell,{width:48,height:64}),'authored frame/cell');}
  }
  if(key==='forest-gate'){
   const g=o.gate;need(s.trial?.stage==='flight'&&g?.name==='forest-time-gate'&&g.visible===true&&same(g.position,[5.5,1.35,4])&&same(g.rotation,[Math.PI/2,0,reduced?0:s.ticks/180]),'actual gate transform and visibility');
  }else need(o.gate===null,'unrelated decoration');
  const v=o.renderer;need(v?.backend===backend&&Number.isSafeInteger(v.width)&&Number.isSafeInteger(v.height)&&v.width>0&&v.height>0,'renderer ownership');
  if(backend==='cpu-canvas2d')need(v.webglVersion===0&&v.width*v.height<=640*480&&v.samplingEnabled===false&&v.mode==='auto','original CPU policy');
  else need([1,2].includes(v.webglVersion)&&v.samplingEnabled===null,'WebGL context');
  need(Number.isSafeInteger(o.viewport?.width)&&Number.isSafeInteger(o.viewport?.height)&&o.viewport.width>0&&o.viewport.height>0&&typeof o.focus==='string','viewport/focus');
  const image=p.image;need(image?.path===p.phase+'.png'&&image.source==='actual-native-canvas','original image path');
  const raw=load(image.path);need(Buffer.isBuffer(raw)&&raw.length===image.bytes&&sha(raw)===image.sha256,'image bytes/hash');
  const png=decodeCanvasPng(raw);need(png.width===v.width&&png.height===v.height,'decoded canvas dimensions');
  let lo=255,hi=0;for(let j=0;j<png.rgba.length;j+=4){need(png.rgba[j+3]===255,'opaque scene');for(let c=0;c<3;c++){lo=Math.min(lo,png.rgba[j+c]);hi=Math.max(hi,png.rgba[j+c]);}}
  need(hi-lo>16,'nonblank pixels');files.push({path:image.path,bytes:raw.length,sha256:sha(raw)});
 }
 const [before,middle,after]=r.phases.map(p=>p.observation);
 for(const k of ['renderer','viewport','focus'])need(same(before[k],middle[k])&&same(before[k],after[k]),'unchanged '+k);
 need(files[0].sha256===files[2].sha256&&files[0].bytes===files[2].bytes,'restored exact canvas');
 for(const name of expected){
  const a=before.groups[name],b=middle.groups[name],c=after.groups[name];
  need(a.motion.bindingCount===b.motion.bindingCount&&a.motion.bindingCount===c.motion.bindingCount,'stable bindings');
  a.actors.forEach((v,i)=>{const m=b.actors[i],z=c.actors[i];need(m&&z&&same([v.name,v.kind,v.seed],[m.name,m.kind,m.seed])&&same([v.name,v.kind,v.seed],[z.name,z.kind,z.seed]),'same actors');need(m.uploads===v.uploads+(v.frame===m.frame?0:1)&&z.uploads===m.uploads+(m.frame===z.frame?0:1),'single upload per changed frame');});
 }
 return files;
}
export function inspectFairTrialComfort({resultsDir,buildDir,sourceSha,runId,runAttempt,lane}){
 need(['validate','bad'].includes(lane),'supported lane');
 const parent=inspectLane({lane,resultsDir,buildDir,sourceSha,runId,runAttempt});need(parent.status==='passed','original lane remains passed');
 const id={sourceSha,runId:String(runId),runAttempt:String(runAttempt),htmlSha256:parent.htmlSha256,htmlBytes:parent.htmlBytes};
 if(lane==='validate'){
  inspectCpuAdventureEvidence({resultsDir,buildDir,sourceSha,runId,runAttempt});
  inspectCpuEvidence({dir:join(resultsDir,'cpu-renderer'),buildDir,sourceSha,runId,runAttempt});
 }
 const targets=lane==='bad'?[['keyboard','keyboard-report.json','fair-witnesses','webgl']]:[['cpu-renderer','report.json','fair-vendors','cpu-canvas2d'],['cpu-renderer/trial','trial-report.json','courtroom','cpu-canvas2d'],['cpu-renderer/trial','trial-report.json','forest-gate','cpu-canvas2d']];
 const files=new Map();const keep=path=>{const b=readFileSync(join(resultsDir,path));files.set(path,{path,bytes:b.length,sha256:sha(b)});return b;};
 for(const [dir,parentName,key,backend] of targets){
  const original=JSON.parse(keep(join(dir,parentName)));
  const refs=key==='fair-vendors'?[original.cases?.find(c=>c.name==='fair-coop-combat-save')?.fairTrialComfort]:original.fairTrialComfort;
  need(Array.isArray(refs)&&refs.filter(r=>r?.key===key).length===1,'original journey links extra capture');
  const ref=refs.find(r=>r.key===key),path=`fair-trial-comfort/${key}/report.json`;
  need(ref.path===path,'linked report path');const raw=keep(join(dir,path));
  need(raw.length===ref.bytes&&sha(raw)===ref.sha256,'linked report bytes');const report=JSON.parse(raw);need(same(ref.state,report.beforeState),'same native paused state');
  assertWitnessComfort(report,p=>keep(join(dir,'fair-trial-comfort',key,p)),id,key,backend);
 }
 return {schema:'chrono-fair-trial-comfort-source-ledger-v1',status:'passed',lane,...id,files:[...files.values()],originalLedgersModified:false,physicalDevice:false,artApproved:false,realTimeComfortApproved:false,wholeGameAccepted:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const lane=process.argv[2];
 try{const r=inspectFairTrialComfort({resultsDir:'test-results',buildDir:'dist',sourceSha:process.env.GITHUB_SHA,runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT,lane});mkdirSync('test-results/ci',{recursive:true});writeFileSync(`test-results/ci/fair-trial-comfort-${lane}.json`,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));}
 catch(e){console.error(e);process.exitCode=1;}
}
