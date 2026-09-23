import {runInNewContext} from 'node:vm';
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {assertTownRoute,assertTownSignOcclusion} from '../scripts/town-route-evidence.mjs';
import {townPartyStateFixture} from './helpers/town-camera-fixture.mjs';
const same=structuredClone;
const state=()=>({...townPartyStateFixture(),mode:'explore',players:[{x:0,z:6.4},{x:1,z:6.4}],kingdom:{phase:'arrival'},opening:{phase:'vista'}});
const image=path=>({path,bytes:100,sha256:'a'.repeat(64)});
function occ(s,blocked=false){return {profile:'vq02z-inn-actor-visibility',active:true,owner:'kingdom-truce/inn-sign',approved:false,tick:s.ticks,method:'parallel-orthographic-triangle-rays',subjects:['p0'],blockedBy:blocked?['p0']:[],meshRayTests:blocked?1:9,visibility:blocked?.3:1,meshVisibility:blocked?.3:1,originalVisibility:1,originalMaterialMode:1,materialMode:blocked?2:1,fadeTicks:9,holdTicks:12,textureUnchanged:true,geometryUnchanged:true};}
function fixture(){
 const routes=Array.from({length:15},()=>({}));let s=state();
 for(const [j,[axis,target]] of [['z',1],['x',-4.5],['x',0],['z',-4.3],['x',-6.5],['x',7.3]].entries()){s=same(s);s.players[0][axis]=target;s.ticks+=100;routes[j+9]={axis,target,coop:false,afterRelease:{state:same(s)}};}
 const names=['entry','resident','inn','exit'],ends=[9,11,14,15];
 const stops=names.map((name,i)=>{
  const s=i?same(routes[ends[i]-1].afterRelease.state):state(),rects=[{id:'p0',left:.5,right:.6,top:.3,bottom:.4}];
  return {name,chapter:'truce',state:s,after:same(s),paused:true,fullStateEqual:true,viewport:{width:390,height:844},routeEnd:ends[i],signOcclusion:occ(s,i===2),image:image(`town-route-${name}.png`),canvasImage:{...image(`town-route-${name}-canvas.png`),source:'actual-cpu-canvas'},renderer:{width:249,height:540},camera:{townProfile:'vq02x-town-portrait',camera:{active:true,portrait:true,ratio:249/540,bounds:{left:.045,right:.955,top:.12,bottom:.8}},motion:{tick:s.ticks},rects}};
 });
 return {routes,r:{schema:'chrono-town-route-readability-v1',status:'passed',physicalDevice:false,artApproved:false,motionVideo:false,routeStart:9,routeEnd:15,originalViewport:{width:960,height:640},restoredViewport:{width:960,height:640},beforeResize:same(stops[0].state),beforeRestore:same(s),afterRestore:same(s),stops}};
}
const run=k=>assertTownRoute(k.r,k.routes,()=>{},i=>i?.bytes>8&&/^[a-f0-9]{64}$/.test(i.sha256));
test('Z verifier-only structural fixture is not native evidence; all four existing pixel checks are invoked',()=>{
 const k=fixture(),before=JSON.stringify(k);let n=0;assert(assertTownRoute(k.r,k.routes,()=>n++,()=>true));assert.equal(n,4);assert.equal(JSON.stringify(k),before);
});
for(const [name,mutate] of Object.entries({
 missing:r=>delete r.stops,missingStop:r=>r.stops.pop(),duplicateStop:r=>r.stops[3]=same(r.stops[2]),falsePass:r=>r.status='failed',deviceClaim:r=>r.physicalDevice=true,artClaim:r=>r.artApproved=true,videoClaim:r=>r.motionVideo=true,
 alteredRoute:r=>r.routeEnd=16,wrongStart:r=>r.routeStart=8,wrongRestore:r=>r.restoredViewport.width=390,resizeState:r=>r.afterRestore.ticks++,entryState:r=>r.beforeResize.ticks++,
 wrongViewport:r=>r.stops[1].viewport.height=390,wrongLeg:r=>r.stops[1].routeEnd=12,unpaused:r=>r.stops[1].paused=false,unfrozen:r=>r.stops[1].after.players[0].x++,missingReceipt:r=>delete r.stops[1].canvasImage,
 canvasOwner:r=>r.stops[1].canvasImage.source='fixture',screenshotOwner:r=>r.stops[1].image.path='other.png',wrongMode:r=>r.stops[1].state.mode='battle',wrongBuffer:r=>r.stops[1].camera.camera.ratio=1,
 unsafeActor:r=>r.stops[1].camera.rects[0].left=0,missingActor:r=>r.stops[1].camera.rects=[],nanActor:r=>r.stops[1].camera.rects[0].right=NaN,
 absentFade:r=>{r.stops[2].signOcclusion.visibility=1;r.stops[2].signOcclusion.meshVisibility=1;r.stops[2].signOcclusion.materialMode=1;},noOcclusion:r=>r.stops[2].signOcclusion.blockedBy=[],ghostActor:r=>r.stops[2].signOcclusion.subjects.push('p1'),
 discardedAlpha:r=>r.stops[2].signOcclusion.materialMode=1,unboundedRays:r=>r.stops[2].signOcclusion.meshRayTests=28,wrongTick:r=>r.stops[2].signOcclusion.tick--,outOfRange:r=>r.stops[2].signOcclusion.visibility=.1,
 duplicatedBlocker:r=>r.stops[2].signOcclusion.blockedBy.push('p0'),foreignOwner:r=>r.stops[2].signOcclusion.owner='home',changedPixels:r=>r.stops[2].signOcclusion.textureUnchanged=false,
 missingRestoration:r=>{r.stops[3].signOcclusion=occ(r.stops[3].state,true);}
}))test('Z rejects corrupted route evidence: '+name,()=>{const k=fixture();mutate(k.r);assert.throws(()=>run(k),/Town route|Town party/);});
test('Z cannot accept different actual movement legs or a stopped actor moved off the native trace',()=>{
 let k=fixture();k.routes[9].target=2;assert.throws(()=>run(k),/route order/);
 k=fixture();k.r.stops[2].state.players[0].x++;k.r.stops[2].after=same(k.r.stops[2].state);assert.throws(()=>run(k),/stopped players/);
});
test('Z preserves active second/follower/third membership independent of joined preference',()=>{
 const s=state();s.kingdom.phase='rescue';s.joined=false;s.rescue.stage='allied';const o=occ(s);o.subjects=['p0','p1','guest'];o.meshRayTests=27;assert(assertTownSignOcclusion(o,s));o.subjects.pop();assert.throws(()=>assertTownSignOcclusion(o,s),/actor ray owners/);
});
test('Z first failure retains a detached raw observation; no source hook or route driver is changed',()=>{
 const s=state(),o=occ(s,true);o.meshVisibility=1;assert.throws(()=>assertTownSignOcclusion(o,s),e=>{assert.equal(e.observation.meshVisibility,1);e.observation.meshVisibility=0;return true;});assert.equal(o.meshVisibility,1);
 const cli=readFileSync('scripts/cpu-era-evidence.mjs','utf8');assert(cli.includes('assertCpuEraEvidence(r,identity);'));assert(cli.includes('assertTownRoute(r.townReadability,r.nativeRoutes,observation,receipt);'));assert(cli.includes('town route canvas PNG dimensions'));
 const observer=readFileSync('tests/town_route_capture.py','utf8');for(const forbidden of ['setState(','.clock.','__CHRONO_TEST__.set','set_input_files','dispatch_event'])assert(!observer.includes(forbidden));
});

// Executes the production inspector's lexical scope, not a copied receipt expression.
// Parent filesystem/domain ports are unit stubs; this is never native evidence.
function inspectRouteReceiptPort(source, onRoute) {
 const begin=source.indexOf('export function inspectCpuEraEvidence(');
 const end=source.indexOf('\nif(process.argv[1]',begin);
 assert(begin>=0&&end>begin,'production inspector source boundary');
 const receiptLine=source.split('\n').find(line=>line.startsWith('const receipt = '));
 assert(receiptLine,'production receipt validator');
 const k=fixture();
 const inspector=runInNewContext(receiptLine+'\n('+source.slice(begin,end).replace(/^export /,'')+')',{
  hash:x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x),
  inspectCpuEvidence:()=>({htmlSha256:'a'.repeat(64),htmlBytes:100}),
  resolve:(...parts)=>parts.join('/'),join:(...parts)=>parts.join('/'),
  readFileSync:()=>JSON.stringify({townReadability:k.r,nativeRoutes:k.routes}),
  assertCpuEraEvidence:()=>{},observation:()=>{},assertTownRoute:onRoute
 });
 return ()=>inspector({dir:'unit-only',buildDir:'unit-only',sourceSha:'unit-only',runId:'unit-only',runAttempt:'1'});
}
test('Z production inspector reaches the route gate with the callable receipt validator, not its later parent-save record',()=>{
 const source=readFileSync('scripts/cpu-era-evidence.mjs','utf8');
 const sentinel=Error('unit-only route receipt port reached');let reached=false;
 const inspect=inspectRouteReceiptPort(source,(record,routes,observe,validateReceipt)=>{
  reached=true;assert.equal(typeof validateReceipt,'function');
  assert.equal(validateReceipt(image('unit.png')),true);
  assert.equal(Boolean(validateReceipt({...image('unit.png'),bytes:0})),false);
  assert.equal(Boolean(validateReceipt({...image('unit.png'),sha256:'bad'})),false);
  assertTownRoute(record,routes,observe,validateReceipt);
  throw sentinel;
 });
 assert.throws(inspect,error=>error===sentinel);assert.equal(reached,true);
});
test('Z a restored parent receipt shadow reproduces the unpublished temporal-dead-zone bug before the route gate',()=>{
 const source=readFileSync('scripts/cpu-era-evidence.mjs','utf8').replaceAll('parentReceipt','receipt');
 let reached=false;const inspect=inspectRouteReceiptPort(source,()=>{reached=true;});
 assert.throws(inspect,error=>error.name==='ReferenceError'&&/receipt/.test(error.message));
 assert.equal(reached,false);
});
