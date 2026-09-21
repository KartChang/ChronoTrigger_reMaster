import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const sha=b=>createHash('sha256').update(b).digest('hex');
const need=(ok,message)=>{if(!ok)throw Error('CPU rendering: '+message);};
const finite=(n)=>typeof n==='number'&&Number.isFinite(n);
const image=i=>i&&/^[a-z0-9-]+\.png$/.test(i.path)&&i.bytes>8&&/^[a-f0-9]{64}$/.test(i.sha256);
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
/** Validates actual report structure. Unit fixtures never become positive CI reports. */
export function assertCpuEvidence(r,identity){
 need(r?.schema==='chrono-cpu-renderer-v1'&&r.status==='passed','successful final report missing');
 for(const k of ['sourceSha','runId','runAttempt','htmlSha256','htmlBytes'])need(r[k]===identity[k],'source/run/HTML mismatch');
 need(r.physicalDevice===false&&r.artApproved===false&&r.wholeGameAccepted===false,'unsupported acceptance claim');
 need(Array.isArray(r.errors)&&r.errors.length===0,'runtime errors');
 need(equal(r.launchArgs,['--no-sandbox','--disable-webgl'])&&r.backendPreference==='auto','default no-WebGL precondition missing');
 need(r.cases?.length===2&&r.cases[0].name==='fresh-home-to-fair'&&r.cases[1].name==='fair-coop-combat-save','required native journeys missing');
 const observation=o=>{
  const v=o?.renderer,p=o?.pixels,c=v?.cpu;
  need(v?.backend==='cpu-canvas2d'&&v.webglVersion===0&&v.canvas2dFallback===true&&v.browserChoosesBackend===false&&v.forcedSoftware===false,'actual CPU backend absent');
  need(c?.profile==='vq02d-existing-scene-cpu-raster'&&c.draws>0&&c.fragments>0&&c.triangles>0&&c.meshes>0&&c.unsupportedResources===0,'scene did not rasterize');
  need(finite(c.frameMs)&&c.frameMs>=0&&c.textureMemory?.bytes>=0&&c.textureMemory.bytes<=33554432&&c.textureMemory.budget===33554432&&c.textureMemory.entries<=512,'invalid resource bounds');
  need(p?.source==='actual-cpu-canvas'&&p.context2d===true&&p.webgl1===true&&p.webgl2===true,'native canvas APIs not checked');
  need(Number.isInteger(p.width)&&Number.isInteger(p.height)&&p.width>0&&p.height>0&&p.width*p.height<=640*480&&p.opaque===p.width*p.height&&p.width===v.width&&p.height===v.height,'invalid actual canvas dimensions');
  need(finite(p.min)&&finite(p.max)&&p.min>=0&&p.max<=255&&p.max-p.min>16&&p.sum>0,'blank or invalid canvas');
  need(image(o.image),'original image receipt missing');
  const w=c.work;
  need(w?.profile==='vq02e-conservative-cpu-work'&&['consideredSubmeshes','culledSubmeshes','shadedVertices','submittedTriangles','fastAccepted','trivialRejected','clipped'].every(k=>Number.isSafeInteger(w[k])&&w[k]>=0),'CPU work counters missing or invalid');
  need(w.consideredSubmeshes>0&&w.culledSubmeshes<=w.consideredSubmeshes&&w.shadedVertices>0&&w.fastAccepted>0&&w.submittedTriangles===w.fastAccepted+w.trivialRejected+w.clipped,'CPU work accounting inconsistent');
  need(o.ui?.cpuNotePresent===true&&o.ui.help.includes('預設嘗試 CPU 相容繪圖'),'CPU explanation absent');
 };
 for(const c of r.cases){need(c.status==='passed'&&finite(c.loadMs)&&c.loadMs>=0&&c.loadMs<30000,'case failed or load exceeded unchanged 30s bound');for(const o of c.views??[])observation(o);}
 const h=r.cases[0],f=r.cases[1];
 need(equal(h.views.map(o=>o.chapter),['bedroom','home','overworld1000','fair'])&&h.actualStairs===true&&h.motherTalked===true&&h.originalMapTransitions===true,'fresh route incomplete');
 need(equal(f.views.map(o=>o.viewport),['desktop','portrait','short-landscape'])&&f.pauseStateUnchanged===true,'responsive/pause evidence missing');
 const owner=f.ownership,b=owner?.before,a=owner?.afterP1,c=owner?.afterP2;
 need(b?.joined===true&&a?.joined===true&&c?.joined===true&&a.players[0].x>b.players[0].x+.3&&a.players[1].x===b.players[1].x&&a.players[1].z===b.players[1].z&&c.players[1].x>a.players[1].x+.3&&c.players[0].x===a.players[0].x&&c.players[0].z===a.players[0].z,'independent native P1/P2 not observed');
 observation(f.victory);observation(f.afterImport);
 need(f.victory.state?.mode==='victory'&&f.victory.state.fair.gatoWon===true&&f.victory.state.enemies?.length>0&&f.victory.state.enemies.every(e=>e.hp<=0),'real combat completion missing');
 const save=f.save,n=save?.nativeImport;
 need(save?.sameRunExport===true&&save.indexedDbReload===true&&save.version===2&&save.path==='cpu-own-fair-save.json'&&save.bytes>0&&/^[a-f0-9]{64}$/.test(save.sha256),'original player export missing');
 need(n?.status==='passed'&&n.expected==='imported'&&n.stage==='completed'&&n.terminal?.event==='imported'&&n.frozenWhileSelecting===true&&n.freezeComparison?.equal===true&&n.selection?.bytes===save.bytes&&n.selection.sha256===save.sha256,'native import not proven');
 need(save.before.chapter==='fair'&&save.after.chapter==='fair'&&save.after.joined===true&&save.after.fair.gatoWon===true&&save.before.players.every((p,i)=>p.x===save.after.players[i].x&&p.z===save.after.players[i].z),'own export state not preserved');
 return true;
}
export function inspectCpuEvidence({dir,buildDir,sourceSha,runId,runAttempt}){
 need(/^[a-f0-9]{40}$/.test(sourceSha??'')&&/^[1-9][0-9]*$/.test(runId??'')&&/^[1-9][0-9]*$/.test(runAttempt??''),'exact CI identity missing');
 const html=readFileSync(join(buildDir,'index.html')),meta=JSON.parse(readFileSync(join(buildDir,'build-meta.json')));
 need(meta.sourceSha===sourceSha&&meta.bytes===html.length,'build identity mismatch');
 const identity={sourceSha,runId,runAttempt,htmlSha256:sha(html),htmlBytes:html.length},raw=readFileSync(join(dir,'report.json')),r=JSON.parse(raw);
 assertCpuEvidence(r,identity);
 const files=[{path:'report.json',bytes:raw.length,sha256:sha(raw)}];
 for(const c of r.cases)for(const o of [...c.views,c.victory,c.afterImport].filter(Boolean)){
  const item=o.image,b=readFileSync(join(dir,item.path));need(b.length===item.bytes&&sha(b)===item.sha256&&b.subarray(0,8).toString('hex')==='89504e470d0a1a0a','original PNG mismatch');files.push({...item});
 }
 const save=r.cases[1].save,b=readFileSync(join(dir,save.path));need(b.length===save.bytes&&sha(b)===save.sha256&&JSON.parse(b).version===2,'unmodified own save mismatch');files.push({path:save.path,bytes:b.length,sha256:sha(b)});
 const native=readFileSync(join(dir,'native-import-report.json')),n=JSON.parse(native);
 need(n.sourceSha===sourceSha&&n.status==='passed'&&n.attempts?.length===1&&equal(n.attempts[0],save.nativeImport),'final native record mismatch');files.push({path:'native-import-report.json',bytes:native.length,sha256:sha(native)});
 return {schema:'chrono-cpu-source-ledger-v1',status:'passed',...identity,files,physicalDevice:false,artApproved:false,wholeGameAccepted:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const result=inspectCpuEvidence({dir:'test-results/cpu-renderer',buildDir:'dist',sourceSha:process.env.GITHUB_SHA,runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT});writeFileSync('test-results/cpu-renderer/source-ledger.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));}
 catch(e){console.error(e);process.exitCode=1;}
}
