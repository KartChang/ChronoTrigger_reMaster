import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {createState,activeSlot,guestKind} from '../.test/core.mjs';
import {expectedTownParty,assertTownPartyCoverage} from '../scripts/town-party-evidence.mjs';
import {assertTownCameraLayouts} from '../scripts/town-camera-evidence.mjs';
import {retainCpuEraFailure} from '../scripts/cpu-era-failure.mjs';
const excerpt=JSON.parse(readFileSync('tests/fixtures/ci66-town-camera-regression.json','utf8'));
excerpt.record.views=excerpt.record.views.map(v=>({...v,state:structuredClone(excerpt.record.before)}));
const state=()=>{const s=createState('truce');s.era='middle';s.joined=true;s.opening.phase='vista';s.kingdom.phase='arrival';return s;};
const coreIds=s=>['p0',...(activeSlot(s,1)?['p1']:[]),...(guestKind(s)?['guest']:[])];
test('Y availability is not the saved co-op preference: departed Marle, Lucca, follower, downed and third ally',()=>{
 const s=state();assert.deepEqual(expectedTownParty(s),['p0']);s.joined=false;assert.deepEqual(expectedTownParty(s),['p0']);
 s.kingdom.phase='rescue';assert.deepEqual(expectedTownParty(s),['p0','p1']);s.joined=true;assert.deepEqual(expectedTownParty(s),['p0','p1']);
 s.players[1].hp=0;assert.deepEqual(expectedTownParty(s),['p0','p1']);s.rescue.stage='allied';assert.deepEqual(expectedTownParty(s),['p0','p1','guest']);
});
test('Y exhaustive non-trial membership agrees with unchanged production rules; inputs stay frozen',()=>{
 let count=0;const s=state();
 for(const joined of [false,true])for(const prologue of ['legacy','waking','home','fair','collision','companions'])
 for(const kingdom of ['none','arrival','audience','erasing','missing','rescue'])for(const opening of ['none','approach','resonance','lost','pendant','crossing','canyon','vista'])
 for(const rescue of ['none','entered','cleared','allied','rescued','homecoming','reunited','returned']){
  s.joined=joined;s.prologue.stage=prologue;s.kingdom.phase=kingdom;s.opening.phase=opening;s.rescue.stage=rescue;
  const before=JSON.stringify(s);assert.deepEqual(expectedTownParty(s),coreIds(s));assert.equal(JSON.stringify(s),before);count++;
 }
 assert.equal(count,4608); // Type-state cross-product, not a claim all combinations are reachable.
});
test('Y trial override parity is independent of stale rescue and co-op flags',()=>{
 const s=state();let count=0;
 for(const joined of [false,true])for(const trial of ['escort','court','cell','escape','tank','flight','future'])
 for(const lucca of [false,true])for(const marle of [false,true])for(const rescue of ['none','allied','reunited']){
  s.joined=joined;s.trial.stage=trial;s.trial.luccaJoined=lucca;s.trial.marleJoined=marle;s.rescue.stage=rescue;
  assert.deepEqual(expectedTownParty(s),coreIds(s));count++;
 }assert.equal(count,168);
});
for(const [name,mutate] of Object.entries({
 missingPrologue:s=>delete s.prologue,missingTrial:s=>delete s.trial,missingRescue:s=>delete s.rescue,
 unknownPrologue:s=>s.prologue.stage='maybe',unknownOpening:s=>s.opening.phase='maybe',unknownKingdom:s=>s.kingdom.phase='maybe',unknownRescue:s=>s.rescue.stage='maybe',unknownTrial:s=>s.trial.stage='maybe',
 unknownJoined:s=>delete s.joined,numericJoined:s=>s.joined=1,noPlayers:s=>delete s.players,missingSlot:s=>s.players.pop(),noLuccaFlag:s=>delete s.trial.luccaJoined,noMarleFlag:s=>delete s.trial.marleJoined,wrongChapter:s=>s.chapter='forest'
}))test('Y rejects incomplete or ambiguous membership: '+name,()=>{const s=state();mutate(s);assert.throws(()=>expectedTownParty(s),/Town party evidence/);});
for(const [name,phase,rescue,ids] of [
 ['lost actual second','rescue','none',['p0','inn-sign']],['unjoined follower omitted','rescue','none',['p0','inn-sign']],
 ['ghost departed Marle','arrival','none',['p0','p1','inn-sign']],['missing active guest','rescue','allied',['p0','p1','inn-sign']],
 ['ghost inactive guest','arrival','none',['p0','guest','inn-sign']],['duplicate owner','rescue','none',['p0','p1','p1','inn-sign']],
 ['unknown owner','rescue','none',['p0','p1','p3','inn-sign']],['lost first player','rescue','none',['p1','inn-sign']],['lost inn','rescue','none',['p0','p1']]
])test('Y fails closed with retained diagnostics: '+name,()=>{
 const s=state();s.kingdom.phase=phase;s.rescue.stage=rescue;if(name==='unjoined follower omitted')s.joined=false;
 const before=JSON.stringify(s);assert.throws(()=>assertTownPartyCoverage(s,ids),e=>{assert.equal(e.observation.joined,s.joined);assert.deepEqual(e.observation.observedIds,ids);assert.deepEqual(e.observation.expectedIds,[...coreIds(s),'inn-sign']);e.observation.observedIds.push('mutated-copy');return /Town camera evidence/.test(e.message);});
 assert.equal(JSON.stringify(s),before);assert(!ids.includes('mutated-copy'));
});
test('Y immutable CI66 raw excerpt exposes old joined-only error; new gate evaluates identical facts, not a new native run',()=>{
 assert.equal(excerpt.sourceSha,'e18ac52e5ad37b0259ef1f27ce40c3d6fb9f6ef4');assert.equal(excerpt.runId,'35875725015');
 const r=structuredClone(excerpt.record),before=JSON.stringify(r),ids=r.views[1].camera.rects.map(x=>x.id);
 assert.equal(r.before.joined,true);assert.equal(activeSlot(r.before,1),false);assert.deepEqual(ids,['p0','inn-sign']);
 assert.throws(()=>{if(r.before.joined)assert(ids.includes('p1'),'second human retained');},/second human retained/);
 assert(assertTownCameraLayouts(r));assert.equal(JSON.stringify(r),before);
});
test('Y real departed excerpt cannot admit a ghost P2 or lose a now-active P2',()=>{
 const ghost=structuredClone(excerpt.record),rect={...ghost.views[1].camera.rects[0],id:'p1'};
 ghost.views[1].camera.rects.splice(1,0,rect);ghost.views[1].camera.camera.actors.splice(1,0,{...rect});
 assert.throws(()=>assertTownCameraLayouts(ghost),/exact story-active/);
 const missing=structuredClone(excerpt.record);missing.before.kingdom.phase='rescue';missing.views.forEach(v=>v.state.kingdom.phase='rescue');
 assert.throws(()=>assertTownCameraLayouts(missing),/exact story-active/);
});
test('Y rejects changing story eligibility between frozen views even when coordinates and ticks agree',()=>{
 const r=structuredClone(excerpt.record);r.views[1].state.kingdom.phase='rescue';assert.throws(()=>assertTownCameraLayouts(r),/complete frozen party state/);
});
test('Y first mismatch diagnostics survive the original failure writer without changing raw report bytes',()=>{
 const dir=mkdtempSync(join(tmpdir(),'chrono-y-')),raw=JSON.stringify(excerpt.record);try{
  writeFileSync(join(dir,'report.json'),raw);let error;try{assertTownPartyCoverage(state(),['p0','p1','inn-sign']);}catch(e){error=e;}
  const identity={sourceSha:excerpt.sourceSha,runId:excerpt.runId,runAttempt:'1'};
  const receipt=retainCpuEraFailure(dir,error,identity);assert.equal(receipt.accepted,false);assert.equal(receipt.status,'failed');assert.equal(receipt.error.observation.kind,'town-party-coverage');
  assert.equal(receipt.report.sha256,createHash('sha256').update(raw).digest('hex'));assert.equal(readFileSync(join(dir,'report.json'),'utf8'),raw);
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('Y every production phase union is accepted and compared, so new enum values cannot silently become absences',()=>{
 const bindings=[['src/prologue-data.ts','PrologueStage','prologue','stage'],['src/story-data.ts','OpeningPhase','opening','phase'],['src/kingdom-data.ts','KingdomPhase','kingdom','phase'],['src/rescue-data.ts','RescueStage','rescue','stage'],['src/trial-data.ts','TrialStage','trial','stage']];
 for(const [path,type,key,field] of bindings){const source=readFileSync(path,'utf8'),union=source.match(new RegExp('export type '+type+'\\s*=([^;]+);'));assert(union,path);for(const [,value] of union[1].matchAll(/'([^']+)'/g)){const s=state();s[key][field]=value;assert.deepEqual(expectedTownParty(s),coreIds(s),type+':'+value);}}
});

// Production World + CPU canvas port. This is offline geometry, not browser or art acceptance.
import {World} from '../.test/cpu-entry.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
for(const [name,joined,phase,rescue,hp] of [
 ['arrival co-op preference retained',true,'arrival','none',120],['arrival single-player',false,'arrival','none',120],
 ['queen missing',true,'missing','none',120],['Lucca co-op',true,'rescue','none',120],
 ['Lucca follower',false,'rescue','none',120],['downed Lucca remains visible',true,'rescue','none',0],
 ['Frog third ally',true,'rescue','allied',120],['Marle third ally',false,'rescue','reunited',120]
])test('Y production scene evidence follows story slots: '+name,()=>{
 const ow=globalThis.window,od=globalThis.document;
 const doc={createElement:tag=>tag==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.document=doc;globalThis.window={devicePixelRatio:1,addEventListener(){},removeEventListener(){},navigator:{}};
 const canvas=cpuTestCanvas(960,640);canvas.canvas.ownerDocument=doc;const world=new World(canvas.canvas);
 try{
  const s=state();s.joined=joined;s.kingdom.phase=phase;s.rescue.stage=rescue;s.players[1].hp=hp;
  s.players.forEach((p,i)=>{p.x=i*1.3;p.z=6.4;});Object.assign(s.rescue.guest,{x:-.9,z:5.7});s.ticks=48;
  const before=structuredClone(s);world.draw(s,0,false);const record={before:structuredClone(s),beforeCamera:world.inspect().earlyComfort,views:[]};
  for(const [width,height] of [[960,640],[390,844],[844,390]]){
   canvas.canvas.clientWidth=width;canvas.canvas.clientHeight=height;world.resize();world.draw(s,0,false);
   record.views.push({state:structuredClone(s),camera:world.inspect().earlyComfort,renderer:world.inspectRenderer(),village:world.inspect().storyNpcs.kingdom.village});
  }
  canvas.canvas.clientWidth=960;canvas.canvas.clientHeight=640;world.resize();world.draw(s,0,false);record.afterCamera=world.inspect().earlyComfort;
  assert.deepEqual(s,before);assert(assertTownCameraLayouts(record));
  assert.deepEqual(record.views[1].camera.rects.map(a=>a.id),[...coreIds(s),'inn-sign']);
 }finally{world.engine.dispose();globalThis.window=ow;globalThis.document=od;}
});
