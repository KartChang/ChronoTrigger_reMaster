import test from 'node:test';
import assert from 'node:assert/strict';
import {assertRenderEvidence,inspectRenderEvidence} from '../scripts/render-evidence.mjs';
import {createHash} from 'node:crypto';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
const hash=b=>createHash('sha256').update(b).digest('hex');
// Synthetic validator fixture only; never a browser report or a game save.
const identity={sourceSha:'a'.repeat(40),runId:'123',runAttempt:'1',htmlSha256:hash('test-html'),htmlBytes:9};
const bytes=Buffer.from('89504e470d0a1a0a00010203','hex');
const image=name=>({path:name+'.png',bytes:bytes.length,sha256:hash(bytes)});
const pixel={source:'actual-webgl-canvas',width:960,height:640,min:10,max:190,sum:80000,opaque:576,samples:576};
function fixture(){return {schema:'chrono-render-compatibility-v1',status:'passed',...identity,errors:[],physicalDevice:false,artApproved:false,canvas2dPlayable:false,browserPolicyBypassedByPage:false,
 cases:[2,1].map(version=>({name:'software-webgl'+version,status:'passed',errors:[],renderer:{profile:'vq02b-browser-managed-webgl',mode:'auto',backendHint:'software',webglVersion:version,scaling:1.5,browserChoosesBackend:true,forcedSoftware:false},independentP1Movement:true,manualStateUnchanged:true,
 quality:{mode:'quality',width:1365,height:900,scaling:1},compatibility:{mode:'compatibility',width:960,height:640,scaling:1.5},pixels:{...pixel},image:image('software-webgl'+version),
 ...(version===2?{contextLoss:{method:'native-WEBGL_lose_context',frozenStateUnchanged:true,inputCleared:true,savedAutomatically:false,heldTick:10,resumedTick:11,restoredPixels:{...pixel}},lostImage:image('context-lost'),restoredImage:image('context-restored')}:{})
 })).concat([{name:'webgl-unavailable',requestedBackend:'webgl',status:'passed',errors:[],caughtFailure:true,focused:'render-reload',startDisabled:true,testStateUnavailable:true,nativeReloadWorked:true,image:image('webgl-unavailable')}])};}
test('synthetic validator fixture is internally complete, not emitted as browser evidence',()=>assert.equal(assertRenderEvidence(fixture(),identity),true));
for(const [name,mutate] of Object.entries({
 failed:r=>r.status='failed',staleSource:r=>r.sourceSha='b'.repeat(40),staleRun:r=>r.runId='124',staleAttempt:r=>r.runAttempt='2',wrongHtml:r=>r.htmlSha256='0'.repeat(64),wrongBytes:r=>r.htmlBytes++,
 missingCase:r=>r.cases.pop(),duplicateCase:r=>r.cases[1]=r.cases[0],errors:r=>r.errors.push('failure'),caseErrors:r=>r.cases[0].errors.push('failure'),
 fakeHardware:r=>r.cases[0].renderer.backendHint='unverified',wrongApi:r=>r.cases[1].renderer.webglVersion=2,
 unchangedBuffer:r=>r.cases[0].compatibility.width=1365,blackCanvas:r=>r.cases[0].pixels.max=10,
 gameAdvanced:r=>r.cases[0].manualStateUnchanged=false,inputUnproven:r=>r.cases[0].independentP1Movement=false,
 noRestoration:r=>r.cases[0].contextLoss.resumedTick=10,syntheticLoss:r=>r.cases[0].contextLoss.method='dispatchEvent',
 staleInput:r=>r.cases[0].contextLoss.inputCleared=false,overwriteSave:r=>r.cases[0].contextLoss.savedAutomatically=true,
 ambiguousNoWebgl:r=>delete r.cases[2].requestedBackend,noErrorFocus:r=>r.cases[2].focused='world',noReload:r=>r.cases[2].nativeReloadWorked=false,
 noImage:r=>r.cases[0].image=null,deviceClaim:r=>r.physicalDevice=true,artClaim:r=>r.artApproved=true,
 fakeCanvas2d:r=>r.canvas2dPlayable=true,forcedDriver:r=>r.browserPolicyBypassedByPage=true
}))test('rejects '+name,()=>{const r=fixture();mutate(r);assert.throws(()=>assertRenderEvidence(r,identity));});
test('read-only ledger checks exact screenshot bytes and safe paths',()=>{
 const root=mkdtempSync(join(tmpdir(),'chrono-render-unit-')),dir=join(root,'reports'),buildDir=join(root,'dist');mkdirSync(dir);mkdirSync(buildDir);
 const r=fixture();const save=()=>writeFileSync(join(dir,'report.json'),JSON.stringify(r));
 try{
  writeFileSync(join(buildDir,'index.html'),'test-html');writeFileSync(join(buildDir,'build-meta.json'),JSON.stringify({sourceSha:identity.sourceSha,bytes:9}));
  for(const c of r.cases)for(const i of [c.image,c.lostImage,c.restoredImage].filter(Boolean))writeFileSync(join(dir,i.path),bytes);
  save();const ledger=inspectRenderEvidence({dir,buildDir,...identity});assert.equal(ledger.files.length,6);
  writeFileSync(join(dir,r.cases[0].image.path),'changed');assert.throws(()=>inspectRenderEvidence({dir,buildDir,...identity}),/bytes\/hash/);
  r.cases[0].image.path='../outside.png';save();assert.throws(()=>inspectRenderEvidence({dir,buildDir,...identity}),/unsafe/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
