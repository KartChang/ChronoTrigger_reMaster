import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,renameSync,writeFileSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// Existing journeys, exactly once across the existing three jobs. The v3 -> v4
// -> v5 -> v7 and v6 -> v8 native-export chains stay on their original runner.
export const LANE_REPORTS=Object.freeze({
  validate:['browser-report.json','fair/fair-report.json','opening/opening-report.json','kingdom/kingdom-report.json','reference/reference-report.json','navigation/navigation-report.json','rescue/rescue-report.json','trial/trial-report.json'],
  good:['witness-good/witness-report.json','prologue/prologue-report.json','equipment/equipment-report.json'],
  bad:['witness-bad/witness-report.json','keyboard/keyboard-report.json'],
});
export const NATIVE_REPORTS=Object.freeze({
  validate:['fair','opening','kingdom','rescue','trial'],
  good:['witness-good','prologue'],
  bad:['witness-bad','keyboard'],
});
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=path=>JSON.parse(readFileSync(path,'utf8'));

/** Read-only result aggregation. It never drives a browser or writes a game save. */
export function inspectLane({lane,resultsDir,buildDir,sourceSha,runId,runAttempt}){
  if(!Object.hasOwn(LANE_REPORTS,lane))throw new Error('Unknown CI evidence lane');
  if(!/^[a-f0-9]{40}$/.test(sourceSha??''))throw new Error('Exact GITHUB_SHA is required');
  if(!/^[1-9][0-9]*$/.test(String(runId??''))||!/^[1-9][0-9]*$/.test(String(runAttempt??'')))throw new Error('Run and attempt are required');
  const meta=json(join(buildDir,'build-meta.json')),html=readFileSync(join(buildDir,'index.html'));
  if(meta.sourceSha!==sourceSha||meta.bytes!==html.length||meta.bundled!==true)throw new Error('Build/source/HTML provenance mismatch');
  const htmlSha256=sha256(html),reports=[],errors=[];
  const check=(path,native=false)=>{
    try{
      const bytes=readFileSync(join(resultsDir,path)),r=JSON.parse(bytes.toString('utf8'));
      if(!r||r.status!=='passed')throw new Error('Missing successful completion status');
      if(r.errors!==undefined&&(!Array.isArray(r.errors)||r.errors.length))throw new Error('Report contains errors');
      const checks=r.passed??r.checks;
      if(!native&&(!Array.isArray(checks)||checks.length===0))throw new Error('Completed journey has no checks');
      if(native&&(!Array.isArray(r.attempts)||r.attempts.length===0))throw new Error('Native chooser observations missing');
      if(Object.hasOwn(r,'sourceSha')&&r.sourceSha!==sourceSha)throw new Error('Report source mismatch');
      if(Object.hasOwn(r,'htmlSha256')&&r.htmlSha256!==htmlSha256)throw new Error('Report HTML mismatch');
      reports.push({path,bytes:bytes.length,sha256:sha256(bytes),kind:native?'native-chooser':'journey'});
    }catch(e){errors.push({path,message:e.message});}
  };
  for(const path of LANE_REPORTS[lane])check(path);
  for(const folder of NATIVE_REPORTS[lane])check(folder+'/native-import-report.json',true);
  if(lane==='good'){
    const path='equipment/inventory-touch-report.json';
    try{
      const bytes=readFileSync(join(resultsDir,path)),r=JSON.parse(bytes),desktop=json(join(resultsDir,'equipment/equipment-report.json'));
      const h=desktop.contextHandoff;
      if(!h||h.status!=='passed'||h.contextsBefore!==1||h.pagesBefore!==1||h.contextsAfter!==0||h.pagesAfter!==0||h.desktopClosed!==true)throw new Error('Desktop context retirement not certified');
      if(r.status!=='passed'||r.phase!=='complete'||r.closeFocus!=='world'||r.physicalDevice!==false)throw new Error('Touch journey incomplete');
      if(r.sourceSha!==sourceSha||r.htmlSha256!==htmlSha256||r.runId!==String(runId)||r.runAttempt!==String(runAttempt))throw new Error('Touch source/run/HTML mismatch');
      if(r.browserBeforeTouch?.contexts!==0||r.browserBeforeTouch?.pages!==0)throw new Error('Overlapping desktop/touch contexts');
      if(r.navigation?.status!=='loaded'||r.navigation.waitUntil!=='load'||r.navigation.timeoutMs!==30000||r.navigation.httpStatus!==200||r.navigationState?.readyState!=='complete')throw new Error('Full touch document load not certified');
      if(!Array.isArray(r.errors)||r.errors.length||r.navigation.failed?.length||r.traceError||r.cleanupError)throw new Error('Touch diagnostics contain errors');
      if(!Array.isArray(r.observations)||r.observations.length!==2||!r.observations.every(o=>o.disclosureTapPassed===true&&o.stateUnchanged===true))throw new Error('Both touch viewport observations required');
      if(r.sourceSave!=='equipment-merchant-v8.json'||sha256(readFileSync(join(resultsDir,'equipment',r.sourceSave)))!==r.sourceSaveSha256)throw new Error('Touch input is not the retained own merchant export');
      if(r.trace!=='inventory-touch-trace.zip')throw new Error('Touch trace missing');
      const trace=readFileSync(join(resultsDir,'equipment',r.trace));
      if(trace.length<4||trace.readUInt32LE(0)!==0x04034b50)throw new Error('Touch trace archive missing');
      reports.push({path,bytes:bytes.length,sha256:sha256(bytes),kind:'touch-lifecycle'});
      reports.push({path:'equipment/'+r.trace,bytes:trace.length,sha256:sha256(trace),kind:'touch-trace'});
    }catch(e){errors.push({path,message:e.message});}
  }
  return {schema:'chrono-ci-lane-evidence-v1',lane,status:errors.length?'failed':'passed',sourceSha,runId:String(runId),runAttempt:String(runAttempt),version:meta.version,htmlSha256,htmlBytes:html.length,expectedJourneys:LANE_REPORTS[lane].length,reports,errors,physicalDeviceApproved:false,artApproved:false,fullGameAccepted:false};
}

export function writeLedger(path,data){
  mkdirSync(dirname(path),{recursive:true});
  const temporary=path+'.tmp';
  writeFileSync(temporary,JSON.stringify(data,null,2)+'\n');
  renameSync(temporary,path);
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const lane=process.argv[2];
  if(!Object.hasOwn(LANE_REPORTS,lane)){console.error('Usage: node scripts/ci-evidence.mjs validate|good|bad');process.exitCode=1;}
  else{
    let result;
    try{result=inspectLane({lane,resultsDir:resolve('test-results'),buildDir:resolve('dist'),sourceSha:process.env.GITHUB_SHA,runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT});}
    catch(e){result={schema:'chrono-ci-lane-evidence-v1',lane,status:'failed',sourceSha:process.env.GITHUB_SHA??null,errors:[{message:e.message}],fullGameAccepted:false};}
    writeLedger(resolve('test-results/ci/'+lane+'.json'),result);
    console.log(JSON.stringify(result));
    if(result.status!=='passed')process.exitCode=1;
  }
}
