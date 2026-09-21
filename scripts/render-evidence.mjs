import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const sha=b=>createHash('sha256').update(b).digest('hex');
const need=(ok,message)=>{if(!ok)throw Error('Rendering: '+message);};
/** Software test configuration is not evidence of automatic fallback in normal browsers. */
export function assertRenderEvidence(r,identity){
 need(r?.schema==='chrono-render-compatibility-v1'&&r.status==='passed','successful final report missing');
 need(r.sourceSha===identity.sourceSha&&r.runId===identity.runId&&r.runAttempt===identity.runAttempt&&r.htmlSha256===identity.htmlSha256&&r.htmlBytes===identity.htmlBytes,'source/run/HTML mismatch');
 need(r.physicalDevice===false&&r.artApproved===false&&r.canvas2dPlayable===false&&r.browserPolicyBypassedByPage===false,'unsupported quality/backend claim');
 need(Array.isArray(r.errors)&&!r.errors.length,'errors present');
 need(r.cases?.map(c=>c.name).sort().join(',')==='software-webgl1,software-webgl2,webgl-unavailable','three real capability cases required');
 const observed=p=>p?.source==='actual-webgl-canvas'&&Number.isFinite(p.max)&&Number.isFinite(p.min)&&p.max-p.min>16&&p.opaque===576&&p.samples===576&&p.sum>0;
 for(const c of r.cases){
  need(c.status==='passed'&&Array.isArray(c.errors)&&!c.errors.length,'case not completed');
  need(c.image?.bytes>8&&/^[a-f0-9]{64}$/.test(c.image.sha256),'original screenshot missing');
  if(c.name==='webgl-unavailable'){
   need(c.requestedBackend==='webgl','unavailable precondition must explicitly opt out of CPU');
   need(c.caughtFailure===true&&c.focused==='render-reload'&&c.startDisabled===true&&c.testStateUnavailable===true&&c.nativeReloadWorked===true,'no-WebGL UI/reload not observed');continue;
  }
  const v=c.renderer;
  need(v.profile==='vq02b-browser-managed-webgl'&&v.mode==='auto'&&v.backendHint==='software'&&v.webglVersion===(c.name.endsWith('1')?1:2)&&v.scaling>1&&v.browserChoosesBackend===true&&v.forcedSoftware===false,'software WebGL not actually observed');
  need(c.independentP1Movement===true&&c.manualStateUnchanged===true&&c.quality?.mode==='quality'&&c.quality.scaling===1&&c.compatibility?.mode==='compatibility'&&c.compatibility.scaling>1,'input/quality switch not observed');
  need(c.compatibility.width<c.quality.width&&c.compatibility.height<c.quality.height&&observed(c.pixels),'canvas buffer/rendered pixels absent');
  if(c.name==='software-webgl2'){
   const x=c.contextLoss;need(x?.method==='native-WEBGL_lose_context'&&x.frozenStateUnchanged===true&&x.inputCleared===true&&x.savedAutomatically===false&&Number.isSafeInteger(x.heldTick)&&x.resumedTick>x.heldTick&&observed(x.restoredPixels),'native context restoration missing');
   need(c.lostImage?.bytes>8&&c.restoredImage?.bytes>8,'context images absent');
  }
 }
 return true;
}
export function inspectRenderEvidence({dir,buildDir,sourceSha,runId,runAttempt}){
 need(/^[a-f0-9]{40}$/.test(sourceSha??'')&&/^[1-9][0-9]*$/.test(runId??'')&&/^[1-9][0-9]*$/.test(runAttempt??''),'exact CI identity required');
 const html=readFileSync(join(buildDir,'index.html')),meta=JSON.parse(readFileSync(join(buildDir,'build-meta.json')));
 need(meta.sourceSha===sourceSha&&meta.bytes===html.length,'build provenance mismatch');
 const bytes=readFileSync(join(dir,'report.json')),r=JSON.parse(bytes),identity={sourceSha,runId,runAttempt,htmlSha256:sha(html),htmlBytes:html.length};
 assertRenderEvidence(r,identity);
 const files=[{path:'report.json',bytes:bytes.length,sha256:sha(bytes)}];
 for(const c of r.cases)for(const item of [c.image,c.lostImage,c.restoredImage].filter(Boolean)){
  need(/^[a-z0-9-]+\.png$/.test(item.path),'unsafe screenshot path');const b=readFileSync(join(dir,item.path));
  need(b.length===item.bytes&&sha(b)===item.sha256&&b.subarray(0,8).toString('hex')==='89504e470d0a1a0a','screenshot bytes/hash mismatch');files.push({...item});
 }
 return {schema:'chrono-render-source-ledger-v1',status:'passed',...identity,files,physicalDevice:false,artApproved:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const result=inspectRenderEvidence({dir:'test-results/render-compatibility',buildDir:'dist',sourceSha:process.env.GITHUB_SHA,runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT});
  writeFileSync('test-results/render-compatibility/source-ledger.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
 }catch(e){console.error(e);process.exitCode=1;}
}
