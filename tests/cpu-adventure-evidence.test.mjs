import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {assertCpuAdventure,inspectAdventureFiles,CHAPTERS,SAVE_PATHS} from '../scripts/cpu-adventure-evidence.mjs';
const C=JSON.parse(readFileSync(new URL('./cpu-adventure-contract.json',import.meta.url)));
const id={sourceSha:'a'.repeat(40),runId:'unit-only',runAttempt:'1',htmlSha256:'b'.repeat(64),htmlBytes:999};
const hash=b=>createHash('sha256').update(b).digest('hex');
const clone=structuredClone;
// Only synthetic in-memory/temporary-directory validator fixtures; NEVER CI browser evidence.
function state(chapter){return {chapter,mode:'explore',ticks:100,era:'middle',joined:true,players:[{x:0,z:0},{x:1,z:0}],rescue:{stage:'allied',tonics:2},trial:{stage:'none',luccaJoined:false}};}
function observation(chapter){return {state:state(chapter),viewChapter:chapter,paused:false,heap:null,
 renderer:{backend:'cpu-canvas2d',webglVersion:0,canvas2dFallback:true,physicalDeviceApproved:false,width:8,height:8,
  frames:{profile:'vq02f-active-frame-window',active:true,samples:120,capacity:120,ready:true,meanMs:50,p95Ms:60,maxMs:70,fps:20,physicalDeviceApproved:false},
  cpu:{profile:'vq02d-existing-scene-cpu-raster',draws:1,triangles:2,fragments:64,unsupportedResources:0,artApproved:false,textureMemory:{bytes:256,budget:33554432,entries:1,entryLimit:512,mipBytes:0},sampling:{enabled:false,alphaCutouts:'nearest'}}},
 pixels:{source:'actual-cpu-canvas',context2d:true,webgl1:true,webgl2:true,width:8,height:8,opaque:64,min:0,max:255,sum:999}};}
const file=path=>({path,bytes:100,sha256:'c'.repeat(64)});
function fixture(stage){
 const r={schema:'chrono-cpu-adventure-v1',stage,status:'passed',...id,physicalDevice:false,artApproved:false,wholeGameAccepted:false,errors:[],launchArgs:['--no-sandbox','--disable-webgl'],backendPreference:'auto',
  observations:CHAPTERS[stage].map((chapter,i)=>({...observation(chapter),label:C[stage].labels[i],image:file(`cpu-checkpoint-${String(i+1).padStart(2,'0')}.png`)})),
  sourceSave:file(stage==='rescue'?'cpu-renderer/era600/cpu-kingdom-v4.json':'cpu-renderer/rescue/rescue-returned-v5.json'),journeyReport:file(stage+'-report.json'),files:[file(stage+'-report.json')]};
 const journey={status:'passed',errors:[],passed:clone(C[stage].labels),organApproaches:[{}],chestApproaches:[{}]};
 const s=r.observations.map(o=>o.state);
 if(stage==='rescue'){
  s[0].rescue.stage='entered';s[2].rescue.organOpen=true;s[3].rescue.chestOpened=true;s[4].mode='battle';s[4].rescue.encounter='guards';Object.assign(s[7].rescue,{yakraWon:true,chancellorFreed:true,stage:'rescued'});s[8].rescue.stage='reunited';s[9].rescue.stage='returned';s[9].era='present';
 }else{
  s[0].trial.stage='court';Object.assign(s[1].trial,{stage:'cell',question:3,verdict:'not-guilty'});Object.assign(s[2].trial,{fritzFreed:true,luccaJoined:true});s[3].trial.headRepairs=1;s[4].trial.tankWon=true;s[5].era='future';Object.assign(s[5].trial,{tankWon:true,luccaJoined:true,marleJoined:true});Object.assign(s[6].trial,{route:'wait',days:3,luccaJoined:true,fritzFreed:false,experience:30});
 }
 r.nativeRoutes=C[stage].moves.map(([axis,target])=>{
  const b=state('fair');b.players[0][axis]=target-1;const a=clone(b);a.ticks+=20;a.players[0][axis]=target;
  const before={state:b,paused:false},afterRelease={state:a,paused:false},key=axis==='x'?'d':'w',arrow=axis==='x'?'ArrowRight':'ArrowUp',keys=[key,arrow];
  return {axis,target,coop:true,status:'arrived',epsilon:.12,timeoutMs:30000,maxHoldMs:250,arrivalOwner:0,budget:135,before,afterRelease,pulses:[{before,afterRelease,keys,releaseKeys:[...keys].reverse(),holdMs:250,chordOrder:'primary-outer'}]};
 });
 r.encounters=C[stage].encounters.map(([axis,target])=>{
  const before=state('fair');before.players[0][axis]=target-1;const afterRelease=clone(before);afterRelease.ticks+=20;afterRelease.mode='battle';const key=axis==='x'?'d':'w',keys=[key,axis==='x'?'ArrowRight':'ArrowUp'];return {axis,target,before,afterRelease,budget:135,status:'entered-battle',keys,attemptedKeys:keys,releasedKeys:[...keys].reverse(),timeoutMs:30000};
 });
 r.performanceWindows=[0,1,2].map(index=>{const before=observation(stage==='rescue'?'fair':'futuregate');before.state.ticks+=index*360;before.renderer.cpu.draws+=index*120;const after=clone(before);after.state.ticks+=360;after.renderer.cpu.draws+=120;return {index,before,after,label:C[stage].labels[stage==='rescue'?9:5],status:'observed-not-certified',requiredDraws:120,timeoutMs:30000,wallMs:6000};});
 return {r,journey};
}
for(const stage of ['rescue','trial'])test(stage+' unit model covers the existing milestones, not native acceptance',()=>{const {r,journey}=fixture(stage);assert(assertCpuAdventure(r,journey,id));});
const mutations={
 missing:r=>r.observations.pop(),wrongOrder:r=>r.observations.reverse(),imageReuse:r=>r.observations[1].image=r.observations[0].image,stale:r=>r.sourceSha='0'.repeat(40),run:r=>r.runId='other',attempt:r=>r.runAttempt='2',html:r=>r.htmlSha256='0'.repeat(64),size:r=>r.htmlBytes++,partial:r=>r.status='running',error:r=>r.errors.push('runtime'),priorFailure:r=>r.failure={},device:r=>r.physicalDevice=true,art:r=>r.artApproved=true,whole:r=>r.wholeGameAccepted=true,forced:r=>r.launchArgs.push('--use-angle=swiftshader'),preference:r=>r.backendPreference='cpu',
 wrongParent:r=>r.sourceSave.path='../wrong.json',missingLeg:r=>r.nativeRoutes.pop(),changedTarget:r=>r.nativeRoutes[0].target++,epsilon:r=>r.nativeRoutes[0].epsilon=.13,timeout:r=>r.nativeRoutes[0].timeoutMs=30001,budget:r=>r.nativeRoutes[0].budget++,owner:r=>r.nativeRoutes[0].arrivalOwner=1,unownedPeer:r=>r.nativeRoutes[0].coop=false,longHold:r=>r.nativeRoutes[0].pulses[0].holdMs=251,wrongChord:r=>r.nativeRoutes[0].pulses[0].chordOrder='primary-inner',unreleased:r=>r.nativeRoutes[0].pulses[0].releaseKeys=[],unobserved:r=>r.nativeRoutes[0].afterRelease=clone(r.nativeRoutes[0].before),overshoot:r=>r.nativeRoutes[0].afterRelease.state.players[0].x+=.13,rollback:r=>r.nativeRoutes[0].afterRelease.state.ticks=0,
 noEncounter:r=>r.encounters.pop(),falseEncounter:r=>r.encounters[0].afterRelease.mode='explore',encounterRelease:r=>r.encounters[0].releasedKeys=[],encounterTarget:r=>r.encounters[0].target++,encounterBudget:r=>r.encounters[0].budget++,
 missingWindow:r=>r.performanceWindows.pop(),replayedWindows:r=>{r.performanceWindows[1]=clone(r.performanceWindows[0]);r.performanceWindows[1].index=1;},windowLabel:r=>r.performanceWindows[0].label='unknown',shortWindow:r=>r.performanceWindows[0].after.renderer.cpu.draws--,pausedWindow:r=>r.performanceWindows[0].after.paused=true,inventedFrames:r=>r.performanceWindows[0].after.renderer.frames.samples=119,falseFps:r=>r.performanceWindows[0].after.renderer.frames.fps=60,nonfinite:r=>r.performanceWindows[0].after.renderer.frames.meanMs=NaN,windowCertified:r=>r.performanceWindows[0].status='certified',sameTick:r=>r.performanceWindows[0].after.state.ticks=100,
 manifest:r=>r.files=[],unsafe:r=>r.files[0].path='../secret.json',repeatedFile:r=>r.files.push(clone(r.files[0]))
};
for(const [name,change] of Object.entries(mutations))test('adventure fails closed: '+name,()=>{const {r,journey}=fixture('rescue');change(r);assert.throws(()=>assertCpuAdventure(r,journey,id));});
for(const [name,change] of Object.entries({webgl:o=>o.renderer.webglVersion=2,noDraw:o=>o.renderer.cpu.draws=0,unsupported:o=>o.renderer.cpu.unsupportedResources=1,memory:o=>o.renderer.cpu.textureMemory.bytes=33554433,filtered:o=>o.renderer.cpu.sampling.enabled=true,mipLeak:o=>o.renderer.cpu.textureMemory.mipBytes=84,alpha:o=>o.renderer.cpu.sampling.alphaCutouts='linear',blank:o=>o.pixels.max=0,empty:o=>o.pixels.width=0,fakeCanvas:o=>o.pixels.source='fixture',wrongSize:o=>o.renderer.width=9,cpuArt:o=>o.renderer.cpu.artApproved=true,inventedDevice:o=>o.renderer.physicalDeviceApproved=true,staleView:o=>o.viewChapter='truce',heap:o=>o.heap={used:-1,total:1,limit:2}}))test('actual observation rejects '+name,()=>{const {r,journey}=fixture('rescue');change(r.observations[0]);assert.throws(()=>assertCpuAdventure(r,journey,id));});
for(const [name,change] of Object.entries({noRescue:r=>r.observations[7].state.rescue.yakraWon=false,noReturn:r=>r.observations[9].state.rescue.stage='allied',freeTonic:r=>r.observations[9].state.rescue.tonics=3}))test('rescue fact '+name,()=>{const {r,journey}=fixture('rescue');change(r);assert.throws(()=>assertCpuAdventure(r,journey,id));});
for(const [name,change] of Object.entries({noCourt:r=>r.observations[1].state.trial.question=0,noTank:r=>r.observations[4].state.trial.tankWon=false,noWait:r=>r.observations[6].state.trial.route='escape',falseFritz:r=>r.observations[6].state.trial.fritzFreed=true,freeXp:r=>r.observations[6].state.trial.experience=99}))test('trial fact '+name,()=>{const {r,journey}=fixture('trial');change(r);assert.throws(()=>assertCpuAdventure(r,journey,id));});

function diskFixture(){
 const resultsDir=mkdtempSync(join(tmpdir(),'unit-cpu-adventure-'));
 const put=(path,raw)=>{const p=join(resultsDir,path);mkdirSync(join(p,'..'),{recursive:true});const b=Buffer.isBuffer(raw)?raw:Buffer.from(JSON.stringify(raw));writeFileSync(p,b);return {path:path.split('/').at(-1),bytes:b.length,sha256:hash(b)};};
 const parent=put('cpu-renderer/era600/cpu-kingdom-v4.json',{version:4,note:'UNIT ONLY'});put('cpu-renderer/era600/report.json',{saves:[{},parent]});
 let previous=parent;
 for(const stage of ['rescue','trial']){
  const {r,journey}=fixture(stage),dir='cpu-renderer/'+stage+'/';r.sourceSave={...previous,path:r.sourceSave.path};journey.sourceSave=r.sourceSave.path;journey.sourceSaveSha256=r.sourceSave.sha256;r.files=[];
  r.observations.forEach(o=>{o.image=put(dir+o.image.path,Buffer.from('89504e470d0a1a0a00000000','hex'));r.files.push(o.image);});
  const saved=SAVE_PATHS[stage].map(path=>put(dir+path,{version:stage==='rescue'?5:7,note:'UNIT ONLY '+path}));r.files.push(...saved);
  const attempts=[r.sourceSave,...(stage==='trial'?[saved[0]]:[])].map(s=>({status:'passed',expected:'imported',stage:'completed',terminal:{event:'imported'},frozenWhileSelecting:true,freezeComparison:{equal:true},selection:{bytes:s.bytes,sha256:s.sha256}}));
  r.files.push(put(dir+'native-import-report.json',{schema:'chrono-native-import-evidence-v1',status:'passed',sourceSha:id.sourceSha,physicalDeviceApproved:false,attempts}));
  r.journeyReport=put(dir+stage+'-report.json',journey);r.files.push(r.journeyReport);put(dir+'cpu-journey.json',r);if(stage==='rescue')previous=saved.at(-1);
 }
 return resultsDir;
}
for(const kind of ['good','image-bytes','save-bytes','native-bytes','source-bytes','bad-native-with-new-hash','unlisted-image'])test('temporary unit file binding: '+kind,()=>{
 const dir=diskFixture();try{
  const rPath=join(dir,'cpu-renderer/rescue/cpu-journey.json'),r=JSON.parse(readFileSync(rPath));
  if(kind==='image-bytes')writeFileSync(join(dir,'cpu-renderer/rescue/cpu-checkpoint-01.png'),'changed');
  if(kind==='save-bytes')writeFileSync(join(dir,'cpu-renderer/rescue/rescue-returned-v5.json'),'{}');
  if(kind==='native-bytes')writeFileSync(join(dir,'cpu-renderer/rescue/native-import-report.json'),'{}');
  if(kind==='source-bytes')writeFileSync(join(dir,'cpu-renderer/era600/cpu-kingdom-v4.json'),'{}');
  if(kind==='bad-native-with-new-hash'){
   const p=join(dir,'cpu-renderer/rescue/native-import-report.json'),v=JSON.parse(readFileSync(p));v.attempts[0].frozenWhileSelecting=false;const b=Buffer.from(JSON.stringify(v));writeFileSync(p,b);Object.assign(r.files.find(x=>x.path==='native-import-report.json'),{bytes:b.length,sha256:hash(b)});writeFileSync(rPath,JSON.stringify(r));
  }
  if(kind==='unlisted-image'){r.files=r.files.filter(x=>x.path!=='cpu-checkpoint-01.png');writeFileSync(rPath,JSON.stringify(r));}
  if(kind==='good'){const v=inspectAdventureFiles({resultsDir:dir,identity:id});assert.equal(v.status,'passed');assert.equal(v.physicalDevice,false);assert.equal(new Set(v.files.map(f=>f.path)).size,v.files.length);}
  else assert.throws(()=>inspectAdventureFiles({resultsDir:dir,identity:id}));
 }finally{rmSync(dir,{recursive:true,force:true});}
});
