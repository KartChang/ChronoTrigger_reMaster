import {createHash} from 'node:crypto';
import {assertTownBuildingRoute} from './town-building-evidence.mjs';
import {assertTownRoute} from './town-route-evidence.mjs';
import {retainCpuEraFailure} from './cpu-era-failure.mjs';
import {assertWoodland} from './woodland-evidence.mjs';
import {assertVillage,assertVillageLayouts} from './village-evidence.mjs';
import {readFileSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {inspectCpuEvidence} from './cpu-evidence.mjs';
const sha = b => createHash('sha256').update(b).digest('hex');
const need = (ok, text) => { if (!ok) throw Error('CPU era continuation: '+text); };
const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const hash = x => typeof x === 'string' && /^[a-f0-9]{64}$/.test(x);
const finite = n => typeof n === 'number' && Number.isFinite(n);
const flags = r => r.physicalDevice === false && r.artApproved === false && r.wholeGameAccepted === false;
export const ERA_CHAPTERS = ['fair','canyon','truce','forest','castle','chamber','castle','cathedral'];
export const ERA_IMAGES = ['01-pendant-loss','02-canyon','03-truce','04-forest','05-castle','06-chamber','07-lucca','08-cathedral'];
export const ERA_MOVES = [
 ['x',0,true],['z',6.4,true],['x',-2.4,false],['z',8.7,false],['z',7,false],['x',0,false],
 ['x',-2.4,false],['z',8.7,false],['z',-6.1,false],['z',1,false],['x',-4.5,false],
 ['x',0,false],['z',-4.3,false],['x',-6.5,false],['x',7.3,false],['x',0,false],['z',8.2,false],
 ['z',-2.6,false],['x',-1,false],['z',4,false],['x',8,false],['z',6.2,false],['z',.6,false],
 ['z',-6.8,false],['z',-3.2,false],['x',2.5,false],['x',0,true],['z',-6.8,true],['z',.5,true],['x',-9,true]
];
const receipt = i => i && /^[a-z0-9-]+\.(png|json)$/.test(i.path) && Number.isSafeInteger(i.bytes) && i.bytes>8 && hash(i.sha256);
const playerTuple = s => s.players.map(p=>[p.x,p.z,p.hp,p.mp]);
function observation(o, enabled) {
 const v=o?.renderer, c=v?.cpu, p=o?.pixels, s=c?.sampling, m=c?.textureMemory;
 need(v?.backend==='cpu-canvas2d' && v.webglVersion===0 && v.canvas2dFallback===true,'CPU backend');
 need(c?.profile==='vq02d-existing-scene-cpu-raster' && c.draws>0 && c.fragments>0 && c.triangles>0 && c.unsupportedResources===0,'CPU pixels missing');
 need(m?.budget===33554432 && m.bytes>=0 && m.bytes<=33554432 && m.entries<=512 && m.entryLimit===512 && m.mipBytes>=0 && m.mipBytes<=m.bytes,'texture budget');
 need(s?.profile==='vq02j-opaque-affine-minification' && s.enabled===enabled && s.alphaCutouts==='nearest' && s.perspective==='nearest-fallback','sampling policy');
 need(Number.isSafeInteger(s.minifiedTriangles) && s.minifiedTriangles>=0 && (enabled || (s.minifiedTriangles===0 && m.mipBytes===0)),'sampling accounting');
 need(p?.source==='actual-cpu-canvas' && p.context2d===true && p.webgl1===true && p.webgl2===true,'native CPU canvas');
 need(Number.isSafeInteger(p.width) && Number.isSafeInteger(p.height) && p.width>0 && p.height>0 && p.width===v.width && p.height===v.height && p.width*p.height<=307200 && p.opaque===p.width*p.height && p.max-p.min>16 && p.sum>0,'blank/different-size canvas');
 need(receipt(o.image) && o.image.path.endsWith('.png') && o.state?.chapter===o.chapter,'original capture');
}
/** Structural unit fixtures are only verifier tests; the CLI consumes same-run native reports. */
export function assertCpuEraEvidence(r, identity) {
 need(r?.schema==='chrono-cpu-era600-v1' && r.status==='passed' && flags(r),'successful bounded report');
 for(const k of ['sourceSha','runId','runAttempt','htmlSha256','htmlBytes'])need(r[k]===identity[k],'source/run/HTML mismatch');
 need(Array.isArray(r.errors) && r.errors.length===0,'runtime errors');
 need(r.entry?.chapter==='fair' && r.entry.fair.gatoWon===true && r.entry.opening.phase==='none','actual parent fair journey');
 need(r.sourceSave?.path==='../cpu-own-fair-save.json' && r.sourceSave.bytes>0 && hash(r.sourceSave.sha256),'parent own v2 export');
 need(equal(r.views?.map(o=>o.chapter),ERA_CHAPTERS),'chapter coverage');
 r.views.forEach((o,i)=>{observation(o,true);assertWoodland(o.woodland,o.chapter);need(o.image.path===ERA_IMAGES[i]+'.png','chapter image ownership');});
 r.views.forEach(o=>assertVillage(o.village,o.chapter));
 assertVillageLayouts(r.villageLayouts,observation,receipt);
 const f=r.filtering;
 need(f?.fullStateEqual===true && equal(f.before,f.after),'sampling changed full paused state');
 for(const [k,on] of [['nearest',false],['filtered',true],['restored',false]]){
  observation(f[k],on);need(f[k].image.path==='sampling-'+k+'.png' && hash(f[k].canvasSha256),'sampling capture');
  need(equal(f[k].state,f.before),'sampling capture not fully frozen');
 }
 need(f.filtered.renderer.cpu.sampling.minifiedTriangles>0 && f.filtered.renderer.cpu.textureMemory.mipBytes>0,'filter not actually used');
 need(f.nearest.canvasSha256!==f.filtered.canvasSha256 && f.restored.canvasSha256===f.nearest.canvasSha256,'real canvas change/revert');
 for(const k of ['pendantPause','queenPause'])need(r[k]?.fullStateEqual===true && equal(r[k].before,r[k].after),'cinematic pause');
 need(['approach','resonance'].includes(r.pendantPause.before.opening.phase) && r.queenPause.before.kingdom.phase==='erasing','cinematic not active at pause');
 need(r.departedP2Inactive===true && r.views[0].state.opening.phase==='lost' && r.views[1].state.era==='middle','pendant departure');
 const peer=r.companionApproach, pb=peer?.before, pa=peer?.afterRelease;
 need(peer?.key==='ArrowLeft' && peer.targetUpperX===1.5 && peer.timeoutMs===30000 && pb?.chapter==='fair' && pa?.chapter==='fair','companion stage approach');
 need(peer.budget===Math.ceil((Math.abs(1.5-pb.players[1].x)/4+2)*60) && pa.ticks>=pb.ticks && pa.ticks-pb.ticks<=peer.budget,'companion approach budget');
 need(equal([pb.players[0].x,pb.players[0].z],[pa.players[0].x,pa.players[0].z]) && Math.hypot(pa.players[1].x+2.4,pa.players[1].z-9)<6,'companion interaction radius');
 need(r.nativeRoutes?.length===ERA_MOVES.length,'missing original route leg');
 r.nativeRoutes.forEach((t,i)=>{
  need(equal([t.axis,t.target,t.coop],ERA_MOVES[i]) && t.status==='arrived' && t.epsilon===.12 && t.timeoutMs===30000 && t.maxHoldMs===250 && t.arrivalOwner===0,'route contract');
  const b=t.before?.state,a=t.afterRelease?.state, speed=b?.chapter==='overworld1000'?2.4:4;
  need(b?.players?.length===2 && a?.players?.length===2 && !t.before.paused && !t.afterRelease.paused && b.chapter===a.chapter && b.mode==='explore' && a.mode==='explore','route boundary');
  need(t.budget===Math.ceil((Math.abs(t.target-b.players[0][t.axis])/speed+2)*60) && a.ticks>=b.ticks && a.ticks-b.ticks<=t.budget,'original elapsed budget');
  need(Math.abs(a.players[0][t.axis]-t.target)<.12,'released arrival');
  need(Array.isArray(t.pulses) && t.pulses.length<=256,'pulse bound');
  let previous=t.before, inner=false;
  for(const p of t.pulses){
   const error=t.target-p.before.state.players[0][t.axis];
   const key=t.axis==='x'?(error>0?'d':'a'):(error>0?'w':'s');
   const arrow={d:'ArrowRight',a:'ArrowLeft',w:'ArrowUp',s:'ArrowDown'}[key];
   if(p.chordOrder==='primary-inner')inner=true;
   const order=t.coop?(inner?'primary-inner':'primary-outer'):'single-owner';
   const keys=t.coop?(inner?[arrow,key]:[key,arrow]):[key];
   need(p.chordOrder===order && equal(p.keys,keys) && equal(p.releaseKeys,[...keys].reverse()),'native chord/release order');
   need(Number.isInteger(p.holdMs) && p.holdMs>=0 && p.holdMs<=250 && equal(p.before,previous),'pulse timing/continuity');
   need(p.afterRelease?.state.ticks>=p.before.state.ticks && !p.afterRelease.paused,'pulse clock/boundary');
   previous=p.afterRelease;
  }
  need(equal(previous,t.afterRelease),'arrival not last released observation');
 });
 need(r.boundaries?.length===2 && r.battles?.length===2,'solo encounters absent');
 for(let i=0;i<2;i++){
  const b=r.boundaries[i], battle=r.battles[i], chapter=i?'forest':'canyon', target=i?1:4.8;
  need(b.before?.chapter===chapter && b.before.mode==='explore' && b.key===(i?'w':'s') && b.target===target && b.timeoutMs===30000,'encounter entry');
  need(b.budget===Math.ceil((Math.abs(target-b.before.players[0].z)/4+2)*60) && b.afterRelease.ticks>=b.before.ticks && b.afterRelease.ticks-b.before.ticks<=b.budget,'encounter budget');
  need(b.afterRelease.chapter===chapter && b.afterRelease.mode==='battle' && b.reached.mode==='battle','encounter reached');
  need(battle.soloP1===true && battle.before.chapter===chapter && battle.before.mode==='battle' && battle.before.enemies.length===(i?2:3) && battle.before.players[1].atb===0,'solo encounter');
  need(battle.victory.mode==='victory' && battle.victory.enemies.length===battle.before.enemies.length && battle.victory.enemies.every(e=>e.hp<=0) && battle.victory.players[1].hp===battle.before.players[1].hp,'solo victory');
  need((i?battle.victory.kingdom.forestWon:battle.victory.opening.canyonWon)===true && battle.victory.fair.gatoWon===true,'victory flags');
 }
 const o=r.luccaOwnership;
 need(o?.label==='露卡' && o.before.kingdom.phase==='rescue' && o.after.kingdom.phase==='rescue' && o.after.joined===true && o.after.players[1].x>o.before.players[1].x+.3 && equal([o.before.players[0].x,o.before.players[0].z],[o.after.players[0].x,o.after.players[0].z]),'Lucca ownership');
 need(r.saves?.length===2,'own exports absent');
 r.saves.forEach((s,i)=>{
  const n=s.nativeImport;
  need(s.version===i+3 && s.path===(i?'cpu-kingdom-v4.json':'cpu-opening-v3.json') && receipt(s) && s.sameRunExport===true,'own export');
  need(n?.status==='passed' && n.expected==='imported' && n.stage==='completed' && n.terminal?.event==='imported' && n.frozenWhileSelecting===true && n.freezeComparison?.equal===true && n.selection?.bytes===s.bytes && n.selection.sha256===s.sha256 && !n.selection.negativeFixture,'native import');
  need(s.before.chapter===(i?'castle':'canyon') && s.after.chapter===s.before.chapter && equal(s.before.fair,s.after.fair) && equal(playerTuple(s.before),playerTuple(s.after)),'import state changed');
 });
 need(r.final?.chapter==='cathedral' && r.final.kingdom.forestWon===true && r.final.fair.gatoWon===true,'cathedral endpoint');
 return true;
}
export function inspectCpuEraEvidence({dir,buildDir,sourceSha,runId,runAttempt}) {
 // Reuse, never replace or relax, the original two-journey verifier.
 const parent=inspectCpuEvidence({dir:resolve(dir,'..'),buildDir,sourceSha,runId,runAttempt});
 const identity={sourceSha,runId,runAttempt,htmlSha256:parent.htmlSha256,htmlBytes:parent.htmlBytes};
 const raw=readFileSync(join(dir,'report.json')),r=JSON.parse(raw);assertCpuEraEvidence(r,identity);
 assertTownRoute(r.townReadability,r.nativeRoutes,observation,receipt);
 assertTownBuildingRoute(r.townReadability);
 const files=[{path:'report.json',bytes:raw.length,sha256:sha(raw)}];
 const keep=(item,png=false)=>{
  const b=readFileSync(join(dir,item.path));need(b.length===item.bytes && sha(b)===item.sha256,'listed bytes/hash mismatch');
  if(png)need(b.subarray(0,8).toString('hex')==='89504e470d0a1a0a','PNG signature');
  files.push({path:item.path,bytes:b.length,sha256:sha(b)});return b;
 };
 for(const o of [...r.views,...['nearest','filtered','restored'].map(k=>r.filtering[k])])keep(o.image,true);
 for(const v of r.villageLayouts.views){keep(v.image,true);const b=keep(v.canvasImage,true);need(b.readUInt32BE(16)===v.pixels.width&&b.readUInt32BE(20)===v.pixels.height,'actual canvas PNG dimensions');}
 for(const s of r.saves)need(JSON.parse(keep(s)).version===s.version,'export version');
 const own=JSON.parse(keep(r.sourceSave));need(own.version===2 && own.fair.gatoWon===true,'parent export state');
 const parentReport=JSON.parse(readFileSync(resolve(dir,'../report.json'))),parentReceipt=parentReport.cases[1].save;
 need(parentReceipt.bytes===r.sourceSave.bytes && parentReceipt.sha256===r.sourceSave.sha256,'parent export chain');
 const native=readFileSync(join(dir,'native-import-report.json')),n=JSON.parse(native);
 need(n.schema==='chrono-native-import-evidence-v1' && n.sourceSha===sourceSha && n.status==='passed' && n.physicalDeviceApproved===false && equal(n.attempts,r.saves.map(s=>s.nativeImport)),'final native import record');
 files.push({path:'native-import-report.json',bytes:native.length,sha256:sha(native)});
 for(const v of r.villageLayouts.views){const n=v.pauseAccess.nearest;keep(n.image,true);const b=keep(n.canvasImage,true);need(b.readUInt32BE(16)===n.pixels.width&&b.readUInt32BE(20)===n.pixels.height,'nearest canvas PNG dimensions');}
 for(const v of r.townReadability.stops){keep(v.image,true);const b=keep(v.canvasImage,true);need(b.readUInt32BE(16)===v.pixels.width&&b.readUInt32BE(20)===v.pixels.height,'town route canvas PNG dimensions');}
 need(new Set(files.map(f=>f.path)).size===files.length,'duplicate file owner');
 return {schema:'chrono-cpu-era-source-ledger-v1',status:'passed',...identity,files,chapters:ERA_CHAPTERS,physicalDevice:false,artApproved:false,wholeGameAccepted:false};
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const r=inspectCpuEraEvidence({dir:'test-results/cpu-renderer/era600',buildDir:'dist',sourceSha:process.env.GITHUB_SHA,runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT});writeFileSync('test-results/cpu-renderer/era600/source-ledger.json',JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));}
 catch(e){console.error(e);try{retainCpuEraFailure('test-results/cpu-renderer/era600',e,{sourceSha:process.env.GITHUB_SHA,runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT});}catch(retentionError){console.error('Failure receipt could not be written',retentionError);}process.exitCode=1;}
}
