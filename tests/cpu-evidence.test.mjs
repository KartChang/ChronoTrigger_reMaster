import test from 'node:test';import assert from 'node:assert/strict';
import {assertCpuEvidence,inspectCpuEvidence} from '../scripts/cpu-evidence.mjs';
import {createHash} from 'node:crypto';import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';import {join} from 'node:path';import {tmpdir} from 'node:os';
const sha=b=>createHash('sha256').update(b).digest('hex');
const identity={sourceSha:'a'.repeat(40),runId:'123',runAttempt:'1',htmlSha256:sha('test-html'),htmlBytes:9};
const png=Buffer.from('89504e470d0a1a0a00010203','hex'),saveRaw=JSON.stringify({version:2});
// Synthetic rejection tests only. Never written to CI report output directories.
function fixture(){
 const observation=(name,chapter='fair')=>({ui:{cpuNotePresent:true,help:'預設嘗試 CPU 相容繪圖'},chapter,viewport:name,image:{path:name+'.png',bytes:png.length,sha256:sha(png)},renderer:{backend:'cpu-canvas2d',canvas2dFallback:true,webglVersion:0,browserChoosesBackend:false,forcedSoftware:false,width:32,height:18,cpu:{profile:'vq02d-existing-scene-cpu-raster',draws:2,meshes:1,fragments:12,triangles:2,unsupportedResources:0,frameMs:10,work:{profile:'vq02e-conservative-cpu-work',consideredSubmeshes:3,culledSubmeshes:1,shadedVertices:24,submittedTriangles:12,fastAccepted:8,trivialRejected:2,clipped:2},textureMemory:{bytes:512,budget:33554432,entries:1}}},pixels:{source:'actual-cpu-canvas',context2d:true,webgl1:true,webgl2:true,width:32,height:18,opaque:576,min:10,max:200,sum:9000}});
 const state=()=>({joined:true,chapter:'fair',players:[{x:0,z:0},{x:1,z:0}],fair:{gatoWon:true}});
 const before=state(),afterP1=state(),afterP2=state();afterP1.players[0].x=.5;afterP2.players[0].x=.5;afterP2.players[1].x=1.5;
 const save={sameRunExport:true,indexedDbReload:true,path:'cpu-own-fair-save.json',version:2,bytes:Buffer.byteLength(saveRaw),sha256:sha(saveRaw),before:state(),after:state()};
 save.nativeImport={status:'passed',expected:'imported',stage:'completed',terminal:{event:'imported'},frozenWhileSelecting:true,freezeComparison:{equal:true},selection:{bytes:save.bytes,sha256:save.sha256}};
 return {schema:'chrono-cpu-renderer-v1',status:'passed',...identity,physicalDevice:false,artApproved:false,wholeGameAccepted:false,errors:[],launchArgs:['--no-sandbox','--disable-webgl'],backendPreference:'auto',cases:[{name:'fresh-home-to-fair',status:'passed',loadMs:100,views:['bedroom','home','overworld1000','fair'].map(c=>observation('home-'+c,c)),actualStairs:true,motherTalked:true,originalMapTransitions:true},{name:'fair-coop-combat-save',status:'passed',loadMs:100,views:['desktop','portrait','short-landscape'].map(c=>observation(c)),pauseStateUnchanged:true,ownership:{before,afterP1,afterP2},victory:{...observation('victory'),state:{...state(),mode:'victory',enemies:[{hp:0}]}},afterImport:observation('after-import'),save}]};
}
test('synthetic CPU validator fixture is internally complete, not browser evidence',()=>assert(assertCpuEvidence(fixture(),identity)));
for(const [label,mutate] of Object.entries({
 missingWork:r=>delete r.cases[0].views[0].renderer.cpu.work,invalidWork:r=>r.cases[0].views[0].renderer.cpu.work.fastAccepted=NaN,inconsistentWork:r=>r.cases[0].views[0].renderer.cpu.work.submittedTriangles=100,overculled:r=>r.cases[0].views[0].renderer.cpu.work.culledSubmeshes=50,missingCpuNote:r=>r.cases[0].views[0].ui.cpuNotePresent=false,misleadingHelp:r=>r.cases[0].views[0].ui.help='WebGL only',
 failure:r=>r.status='failed',wrongSource:r=>r.sourceSha='b'.repeat(40),wrongRun:r=>r.runId='124',wrongHtml:r=>r.htmlSha256='0'.repeat(64),wrongAttempt:r=>r.runAttempt='2',errors:r=>r.errors.push('runtime'),fakeHardware:r=>r.cases[0].views[0].renderer.backend='webgl',api:r=>r.cases[0].views[0].renderer.webglVersion=2,emptyCanvas:r=>r.cases[0].views[0].pixels.max=10,
 rendererNoDraw:r=>r.cases[0].views[0].renderer.cpu.fragments=0,missingTexture:r=>r.cases[0].views[0].renderer.cpu.unsupportedResources=1,oversized:r=>r.cases[0].views[0].pixels.width=9999,memory:r=>r.cases[0].views[0].renderer.cpu.textureMemory.bytes=33554433,
 substitutedCanvas:r=>r.cases[0].views[0].pixels.source='fixture',webglStillPresent:r=>r.cases[0].views[0].pixels.webgl2=false,partialRoute:r=>r.cases[0].views.pop(),noMother:r=>r.cases[0].motherTalked=false,longLoad:r=>r.cases[0].loadMs=30001,contextOptout:r=>r.backendPreference='webgl',privilegedFlag:r=>r.launchArgs.push('--enable-unsafe-swiftshader'),
 p2MovedByP1:r=>r.cases[1].ownership.afterP1.players[1].x=4,noP2Movement:r=>r.cases[1].ownership.afterP2.players[1].x=1,pausedMutation:r=>r.cases[1].pauseStateUnchanged=false,noVictory:r=>r.cases[1].victory.state.mode='battle',foeAlive:r=>r.cases[1].victory.state.enemies[0].hp=1,
 fakeImport:r=>r.cases[1].save.nativeImport.status='started',modifiedSave:r=>r.cases[1].save.nativeImport.selection.sha256='0'.repeat(64),movedImport:r=>r.cases[1].save.after.players[0].z=2,noPNG:r=>r.cases[0].views[0].image=null,unsafePath:r=>r.cases[0].views[0].image.path='../out.png',deviceClaim:r=>r.physicalDevice=true,artClaim:r=>r.artApproved=true,wholeGameClaim:r=>r.wholeGameAccepted=true
}))test('CPU evidence rejects '+label,()=>{const r=fixture();mutate(r);assert.throws(()=>assertCpuEvidence(r,identity));});
test('read-only CPU ledger verifies raw PNG, same-run export and native record bytes',()=>{
 const root=mkdtempSync(join(tmpdir(),'cpu-ledger-unit-')),dir=join(root,'reports'),buildDir=join(root,'dist');mkdirSync(dir);mkdirSync(buildDir);const r=fixture();
 try{writeFileSync(join(buildDir,'index.html'),'test-html');writeFileSync(join(buildDir,'build-meta.json'),JSON.stringify({sourceSha:identity.sourceSha,bytes:9}));writeFileSync(join(dir,'report.json'),JSON.stringify(r));
 for(const c of r.cases)for(const o of [...c.views,c.victory,c.afterImport].filter(Boolean))writeFileSync(join(dir,o.image.path),png);
 writeFileSync(join(dir,r.cases[1].save.path),saveRaw);writeFileSync(join(dir,'native-import-report.json'),JSON.stringify({sourceSha:identity.sourceSha,status:'passed',attempts:[r.cases[1].save.nativeImport]}));
 assert.equal(inspectCpuEvidence({dir,buildDir,...identity}).files.length,12);
 writeFileSync(join(dir,r.cases[1].save.path),'changed');assert.throws(()=>inspectCpuEvidence({dir,buildDir,...identity}),/own save/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
