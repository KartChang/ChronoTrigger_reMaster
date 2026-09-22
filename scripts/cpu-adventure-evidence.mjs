import {assertStoryNpcs} from './story-npc-evidence.mjs';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {inspectCpuEraEvidence} from './cpu-era-evidence.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const need=(ok,s)=>{if(!ok)throw Error('CPU adventure: '+s);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const integer=x=>Number.isSafeInteger(x)&&x>=0;
const hash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const safe=p=>typeof p==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_-]*\.(json|png)$/.test(p);
export const CHAPTERS={rescue:['cathedral','cathedral','cathedral','passage','passage','sanctum','sanctum','sanctum','chamber','fair'],trial:['courtroom','cellblock','warden','prisonbridge','prisonbridge','futuregate','warden']};
export const SAVE_PATHS={rescue:['rescue-organ-v5.json','rescue-allied-v5.json','rescue-reunited-v5.json','rescue-returned-v5.json'],trial:['trial-cell-v7.json','trial-supplies-v7.json','trial-future-v7.json','trial-wait-route-v7.json']};
const CONTRACT=JSON.parse(readFileSync(new URL('../tests/cpu-adventure-contract.json',import.meta.url),'utf8'));
const SOURCES={rescue:'cpu-renderer/era600/cpu-kingdom-v4.json',trial:'cpu-renderer/rescue/rescue-returned-v5.json'};
const stamp=(r,id)=>{for(const k of ['sourceSha','runId','runAttempt','htmlSha256','htmlBytes'])need(r[k]===id[k],'identity '+k);};
const receipt=f=>f&&safe(f.path)&&integer(f.bytes)&&f.bytes>0&&hash(f.sha256);

export function checkObservation(o){
 assertStoryNpcs(o);
 const r=o?.renderer,c=r?.cpu,p=o?.pixels,m=c?.textureMemory;
 need(o?.state?.chapter===o?.viewChapter&&typeof o.paused==='boolean','coherent observation');
 need(r?.backend==='cpu-canvas2d'&&r.webglVersion===0&&r.canvas2dFallback===true&&r.physicalDeviceApproved===false,'native CPU identity');
 need(c?.profile==='vq02d-existing-scene-cpu-raster'&&integer(c.draws)&&c.draws>0&&integer(c.fragments)&&c.fragments>0&&integer(c.triangles)&&c.triangles>0&&c.unsupportedResources===0,'actual CPU work');
 need(m&&integer(m.bytes)&&m.bytes<=33554432&&m.budget===33554432&&integer(m.entries)&&m.entries>0&&m.entries<=512&&m.entryLimit===512&&m.mipBytes===0,'bounded default texture memory');
 need(c.sampling?.enabled===false&&c.sampling.alphaCutouts==='nearest','default sampling');
 if(o.heap!==null){const h=o.heap;need(h&&integer(h.used)&&integer(h.total)&&integer(h.limit)&&h.used<=h.total&&h.total<=h.limit&&h.precision==='browser-reported; not process RSS','heap accounting');}
 need(c.artApproved===false,'CPU art claim');
 need(p?.source==='actual-cpu-canvas'&&p.context2d===true&&p.webgl1===true&&p.webgl2===true,'real CPU canvas');
 need(integer(p.width)&&integer(p.height)&&p.width>0&&p.height>0&&p.width*p.height<=307200&&p.width===r.width&&p.height===r.height&&p.opaque===p.width*p.height,'canvas dimensions');
 need(integer(p.min)&&integer(p.max)&&integer(p.sum)&&p.min>=0&&p.max<=255&&p.max-p.min>16&&p.sum>0,'nonblank actual pixels');
}

export function checkReleasedRoute(t){
 need(t&&['x','z'].includes(t.axis)&&finite(t.target)&&typeof t.coop==='boolean'&&t.status==='arrived'&&t.epsilon===.12&&t.timeoutMs===30000&&t.maxHoldMs===250&&t.arrivalOwner===0,'native route policy');
 const b=t.before?.state,a=t.afterRelease?.state, speed=b?.chapter==='overworld1000'?2.4:4;
 need(b?.players?.length===2&&a?.players?.length===2&&!t.before.paused&&!t.afterRelease.paused&&b.mode==='explore'&&a.mode==='explore'&&b.chapter===a.chapter,'native route boundary');
 need(t.coop===(b.joined&&(b.trial.stage==='none'||b.trial.luccaJoined)),'route ownership');
 need(finite(b.players[0][t.axis])&&finite(a.players[0][t.axis])&&integer(b.ticks)&&integer(a.ticks)&&a.ticks>=b.ticks,'native route coordinates');
 need(t.budget===Math.ceil((Math.abs(t.target-b.players[0][t.axis])/speed+2)*60)&&a.ticks-b.ticks<=t.budget&&Math.abs(a.players[0][t.axis]-t.target)<.12,'released arrival/budget');
 need(Array.isArray(t.pulses)&&t.pulses.length<=256,'native pulse limit');
 if(t.coop){
  need(t.policy==='vq02n-independent-paired-arrival'&&same(t.arrivalOwners,[0,1]),'paired arrival policy');
  need(a.players.every(p=>finite(p[t.axis])&&Math.abs(p[t.axis]-t.target)<.12),'both released arrivals');
  let previous=t.before;
  for(const p of t.pulses){
   need(same(p.before,previous),'paired pulse continuity');
   const owners=p.owners;
   need(same(owners,[0])||same(owners,[1])||same(owners,[0,1])||same(owners,[1,0]),'paired pulse owners');
   const errors=owners.map(i=>t.target-p.before.state.players[i][t.axis]);
   need(errors.every(e=>finite(e)&&Math.abs(e)>=.12),'pulse cannot drift an arrived owner');
   const keys=errors.map((e,j)=>{const k=t.axis==='x'?(e>0?'d':'a'):(e>0?'w':'s');return owners[j]===0?k:{d:'ArrowRight',a:'ArrowLeft',w:'ArrowUp',s:'ArrowDown'}[k];});
   need(same(p.keys,keys)&&same(p.releaseKeys,[...keys].reverse()),'paired native key/release');
   need(p.chordOrder===(owners.length===2?'paired-coarse':'independent-precision')&&
       (owners.length===1||errors[0]*errors[1]>0),'paired command order');
   const v=p.afterRelease?.state;
   need(integer(p.holdMs)&&p.holdMs<=250&&integer(v?.ticks)&&v.ticks>=p.before.state.ticks&&v.ticks-b.ticks<=t.budget&&
       !p.afterRelease.paused&&v.mode==='explore'&&v.chapter===b.chapter&&v.joined&&(v.trial.stage==='none'||v.trial.luccaJoined),'paired release boundary');
   for(let i=0;i<2;i++)for(const axis of ['x','z']){
    need(finite(v.players?.[i]?.[axis]),'paired finite coordinates');
    if(axis!==t.axis||!owners.includes(i))need(v.players[i][axis]===p.before.state.players[i][axis],'unowned actor movement');
   }
   previous=p.afterRelease;
  }
  need(same(previous,t.afterRelease),'unobserved paired arrival');
  return;
 }

 let previous=t.before,inner=false;
 for(const p of t.pulses){
  need(same(p.before,previous),'pulse continuity');
  const error=t.target-p.before.state.players[0][t.axis],k=t.axis==='x'?(error>0?'d':'a'):(error>0?'w':'s'),arrow={d:'ArrowRight',a:'ArrowLeft',w:'ArrowUp',s:'ArrowDown'}[k];
  if(p.chordOrder==='primary-inner')inner=true;
  const keys=t.coop?(inner?[arrow,k]:[k,arrow]):[k];
  need(p.chordOrder===(t.coop?(inner?'primary-inner':'primary-outer'):'single-owner')&&same(p.keys,keys)&&same(p.releaseKeys,[...keys].reverse()),'native chord');
  need(integer(p.holdMs)&&p.holdMs<=250&&integer(p.afterRelease?.state.ticks)&&p.afterRelease.state.ticks>=p.before.state.ticks&&!p.afterRelease.paused&&p.afterRelease.state.mode==='explore'&&p.afterRelease.state.chapter===b.chapter,'pulse release');
  previous=p.afterRelease;
 }
 need(same(previous,t.afterRelease),'unobserved arrival');
}

export function assertCpuAdventure(r,journey,id){
 need(r?.schema==='chrono-cpu-adventure-v1'&&r.status==='passed'&&Object.hasOwn(CHAPTERS,r.stage),'complete report');stamp(r,id);
 need(r.physicalDevice===false&&r.artApproved===false&&r.wholeGameAccepted===false,'unsupported certification');
 need(same(r.launchArgs,['--no-sandbox','--disable-webgl'])&&r.backendPreference==='auto','launch flags');
 need(Array.isArray(r.errors)&&r.errors.length===0&&!r.failure,'runtime errors');
 need(journey?.status==='passed'&&Array.isArray(journey.errors)&&journey.errors.length===0&&Array.isArray(journey.passed),'original journey failed');
 need(same(journey.passed,CONTRACT[r.stage].labels)&&same(r.observations?.map(o=>o.label),journey.passed)&&same(r.observations.map(o=>o.state.chapter),CHAPTERS[r.stage]),'original milestone coverage');
 r.observations.forEach((o,i)=>{checkObservation(o);need(receipt(o.image)&&o.image.path===`cpu-checkpoint-${String(i+1).padStart(2,'0')}.png`,'checkpoint image');});
 need(r.sourceSave?.path===SOURCES[r.stage]&&integer(r.sourceSave.bytes)&&r.sourceSave.bytes>0&&hash(r.sourceSave.sha256),'parent source');
 need(receipt(r.journeyReport)&&r.journeyReport.path===r.stage+'-report.json','original report receipt');
 need(Array.isArray(r.nativeRoutes)&&same(r.nativeRoutes.map(t=>[t.axis,t.target]),CONTRACT[r.stage].moves),'missing or changed route legs');
 r.nativeRoutes.forEach(checkReleasedRoute);
 need(Array.isArray(r.encounters)&&same(r.encounters.map(t=>[t.axis,t.target]),CONTRACT[r.stage].encounters),'missing encounter boundary');
 for(const e of r.encounters){
  const b=e.before,a=e.afterRelease,delta=e.target-b?.players?.[0]?.[e.axis];
  const key=e.axis==='x'?(delta>0?'d':'a'):(delta>0?'w':'s');
  const coop=b?.joined&&(b.trial.stage==='none'||b.trial.luccaJoined),keys=coop?[key,{d:'ArrowRight',a:'ArrowLeft',w:'ArrowUp',s:'ArrowDown'}[key]]:[key];
  need(['x','z'].includes(e.axis)&&finite(e.target)&&e.status==='entered-battle'&&b?.mode==='explore'&&a?.mode==='battle'&&b.chapter===a.chapter,'real encounter');
  need(same(e.keys,keys)&&same(e.attemptedKeys,keys)&&same(e.releasedKeys,[...keys].reverse())&&e.timeoutMs===30000,'encounter release');
  need(e.budget===Math.ceil((Math.abs(delta)/4+2)*60)&&integer(a.ticks)&&integer(b.ticks)&&a.ticks>=b.ticks&&a.ticks-b.ticks<=e.budget,'encounter budget');
 }
 const s=r.observations.map(o=>o.state);
 if(r.stage==='rescue'){
  need(s[0].rescue.stage==='entered'&&s[1].rescue.stage==='allied'&&s[2].rescue.organOpen&&s[3].rescue.chestOpened,'actual rescue progression');
  need(s[4].mode==='battle'&&s[4].rescue.encounter==='guards'&&s[7].rescue.yakraWon&&s[7].rescue.chancellorFreed&&s[7].rescue.stage==='rescued','actual battles/rescue');
  need(s[8].rescue.stage==='reunited'&&s[9].rescue.stage==='returned'&&s[9].rescue.tonics===2&&s[9].era==='present','actual homecoming');
  need(journey.organApproaches?.length===1&&journey.chestApproaches?.length===1,'solid prop approach evidence');
 }else{
  need(s[0].trial.stage==='court'&&s[1].trial.stage==='cell'&&s[1].trial.question===3&&s[1].trial.verdict==='not-guilty'&&!s[1].trial.luccaJoined,'court and imprisonment');
  need(s[2].trial.fritzFreed&&s[2].trial.luccaJoined&&s[3].trial.headRepairs>0&&s[4].trial.tankWon,'actual escape/tank');
  need(s[5].era==='future'&&s[5].trial.marleJoined&&s[5].trial.luccaJoined&&s[5].trial.tankWon,'2300 arrival');
  need(s[6].trial.route==='wait'&&s[6].trial.days===3&&s[6].trial.luccaJoined&&!s[6].trial.fritzFreed&&s[6].trial.experience===30,'alternate native cell branch');
 }
 need(Array.isArray(r.performanceWindows)&&r.performanceWindows.length===3,'three sustained observation windows');
 r.performanceWindows.forEach((w,i)=>{
  need(w.status==='observed-not-certified'&&w.index===i&&w.requiredDraws===120&&w.timeoutMs===30000&&finite(w.wallMs)&&w.wallMs>0,'bounded window');
  checkObservation(w.before);checkObservation(w.after);
  const a=w.after,b=w.before,f=a.renderer.frames,chapter=r.stage==='rescue'?'fair':'futuregate';
  need(w.label===CONTRACT[r.stage].labels[r.stage==='rescue'?9:5],'window milestone');
  if(i){const previous=r.performanceWindows[i-1].after;need(b.renderer.cpu.draws>=previous.renderer.cpu.draws&&b.state.ticks>=previous.state.ticks,'overlapping or replayed windows');}
  need(a.state.chapter===chapter&&b.state.chapter===chapter&&a.state.mode==='explore'&&b.state.mode==='explore'&&!a.paused&&!b.paused&&a.state.ticks>b.state.ticks,'active exploration samples');
  need(a.renderer.cpu.draws-b.renderer.cpu.draws>=120&&f?.profile==='vq02f-active-frame-window'&&f.active===true&&f.samples===120&&f.capacity===120&&f.ready===true&&f.physicalDeviceApproved===false,'real active frame window');
  need(finite(f.meanMs)&&f.meanMs>0&&finite(f.p95Ms)&&f.p95Ms>0&&finite(f.maxMs)&&f.maxMs>=f.meanMs&&f.maxMs>=f.p95Ms&&finite(f.fps)&&Math.abs(f.fps-1000/f.meanMs)<1e-7,'coherent frame metrics');
 });
 need(Array.isArray(r.files)&&r.files.length>0&&r.files.every(receipt)&&new Set(r.files.map(f=>f.path)).size===r.files.length,'file manifest');
 return true;
}

export function inspectCpuAdventureEvidence({resultsDir,buildDir,sourceSha,runId,runAttempt}){
 const parent=inspectCpuEraEvidence({dir:join(resultsDir,'cpu-renderer/era600'),buildDir,sourceSha,runId,runAttempt});
 const id={sourceSha,runId,runAttempt,htmlSha256:parent.htmlSha256,htmlBytes:parent.htmlBytes};
 return inspectAdventureFiles({resultsDir,identity:id});
}
/** File checks shared with unit fixtures; production calls only after the full parent verifier. */
export function inspectAdventureFiles({resultsDir,identity:id}){
 const {sourceSha}=id;
 const files=[];
 const keep=(path,f)=>{const bytes=readFileSync(join(resultsDir,path));if(f)need(bytes.length===f.bytes&&sha(bytes)===f.sha256,'file bytes/hash '+path);files.push({path,bytes:bytes.length,sha256:sha(bytes)});return bytes;};
 const era=JSON.parse(keep('cpu-renderer/era600/report.json'));let previous=era.saves[1];
 for(const stage of ['rescue','trial']){
  const dir='cpu-renderer/'+stage+'/',r=JSON.parse(keep(dir+'cpu-journey.json')),journey=JSON.parse(readFileSync(join(resultsDir,dir+stage+'-report.json')));
  assertCpuAdventure(r,journey,id);
  need(r.sourceSave.bytes===previous.bytes&&r.sourceSave.sha256===previous.sha256,'same-run export chain');
  const source=JSON.parse(keep(r.sourceSave.path,r.sourceSave));need(source.version===(stage==='rescue'?4:5),'parent version');
  need(journey.sourceSave===r.sourceSave.path&&journey.sourceSaveSha256===r.sourceSave.sha256,'original journey source');
  const found=new Map();for(const f of r.files){const raw=keep(dir+f.path,f);if(f.path.endsWith('.png'))need(raw.subarray(0,8).toString('hex')==='89504e470d0a1a0a','PNG signature');found.set(f.path,{raw,...f});}
  for(const o of r.observations)need(same(o.image,((({raw,...x})=>x)(found.get(o.image.path)??{}))),'checkpoint manifest link');
  need(same(r.journeyReport,((({raw,...x})=>x)(found.get(stage+'-report.json')??{}))),'report manifest link');
  for(const path of SAVE_PATHS[stage]){const f=found.get(path);need(f,'own export '+path);need(JSON.parse(f.raw).version===(stage==='rescue'?5:7),'own version');}
  const native=JSON.parse(found.get('native-import-report.json')?.raw??'null');
  need(native?.schema==='chrono-native-import-evidence-v1'&&native.status==='passed'&&native.sourceSha===sourceSha&&native.physicalDeviceApproved===false&&native.attempts?.length===(stage==='rescue'?1:2),'native chooser chain');
  native.attempts.forEach((n,i)=>{const selected=i?found.get('trial-cell-v7.json'):r.sourceSave;need(n.status==='passed'&&n.expected==='imported'&&n.stage==='completed'&&n.terminal?.event==='imported'&&n.frozenWhileSelecting===true&&n.freezeComparison?.equal===true&&n.selection?.bytes===selected.bytes&&n.selection.sha256===selected.sha256&&!n.selection.negativeFixture,'native import receipt');});
  if(stage==='rescue')previous=found.get('rescue-returned-v5.json');
 }
 // Duplicate parent-export references must agree; keep one entry per physical path.
 const unique=new Map();for(const f of files){if(unique.has(f.path))need(same(unique.get(f.path),f),'conflicting file owner');else unique.set(f.path,f);}
 return {schema:'chrono-cpu-adventure-source-ledger-v1',status:'passed',...id,files:[...unique.values()],physicalDevice:false,artApproved:false,wholeGameAccepted:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const r=inspectCpuAdventureEvidence({resultsDir:'test-results',buildDir:'dist',sourceSha:process.env.GITHUB_SHA,runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT});writeFileSync('test-results/cpu-renderer/adventure-source-ledger.json',JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));}
 catch(e){console.error(e);process.exitCode=1;}
}
