import {actorPlaybackFixture} from './helpers/actor-playback-fixture.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,mkdirSync,readFileSync,rmSync,writeFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {LANE_REPORTS,NATIVE_REPORTS,inspectLane,writeLedger} from '../scripts/ci-evidence.mjs';
const workflow=readFileSync(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
const pavingExpected=JSON.parse(readFileSync(new URL('./fixtures/fair-paving-unit.json',import.meta.url),'utf8'));
const audioFixture=JSON.parse(readFileSync(new URL('./fixtures/scene-audio-evidence-unit.json',import.meta.url),'utf8')).report;
const handoff={status:'passed',contextsBefore:1,pagesBefore:1,contextsAfter:0,pagesAfter:0,desktopClosed:true};
const sha='a'.repeat(40),html=Buffer.from('unit-only report fixture, not a playable or browser observation');
function fixture(t,lane='validate'){
  const root=mkdtempSync(join(tmpdir(),'chrono-ci-unit-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
  const resultsDir=join(root,'test-results'),buildDir=join(root,'dist');mkdirSync(buildDir,{recursive:true});
  writeFileSync(join(buildDir,'index.html'),html);writeFileSync(join(buildDir,'build-meta.json'),JSON.stringify({sourceSha:sha,version:'unit',bytes:html.length,bundled:true}));
  const put=(path,report)=>{const f=join(resultsDir,path);mkdirSync(dirname(f),{recursive:true});writeFileSync(f,JSON.stringify(report));};
  for(const p of LANE_REPORTS[lane])put(p,{status:'passed',passed:['unit-only fixture'],errors:[]});
  if(lane==='validate'){
    put('reference/reference-report.json',{status:'passed',passed:['unit-only fixture'],errors:[],playback:actorPlaybackFixture()});
    for(const name of ['02-walk-1.png','02-walk-2.png','02-walk-3.png','08-reduced-victory.png'])writeFileSync(join(resultsDir,'reference',name),Buffer.from('89504e470d0a1a0a','hex')); // Signature-only unit fixtures, not screenshots.
  }
  for(const p of NATIVE_REPORTS[lane])put(p+'/native-import-report.json',{status:'passed',sourceSha:sha,attempts:[{status:'unit-only fixture'}]});
  if(lane==='good'){
    const sceneryCases=['desktop','portrait','short-landscape'].map(name=>({name,status:'passed',before:{tick:0,scenery:{reducedMotion:false}},later:{tick:12},pause:{fullStateUnchanged:true},reduced:{before:{tick:20,scenery:{reducedMotion:true}},after:{tick:32,scenery:{reducedMotion:true}}}}));
    for(const c of sceneryCases)c.finish=Object.fromEntries(['before','paused','reduced'].map(p=>[p,{profile:'vq01w-fair-light-and-contact',approved:false,fill:{onlyFair:true,enabled:true,intensity:.28},key:{receivesKey:true},contacts:Array.from({length:6},()=>({footError:0,shadow:{visible:true}})),softShadows:{count:8,dynamic:false,alphaMin:0}}])); // Synthetic checker fixtures only.
    for(const c of sceneryCases)c.paving=Object.fromEntries(['before','paused','reduced'].map(p=>[p,{profile:'vq01x-retained-plaza-composition',source:'actual-fair-paving-canvas',approved:false,texture:'fair-ground-reference',width:512,height:512,samples:structuredClone(pavingExpected.samples)}])); // Unit-only source-pixel expectations.
    put('equipment/00-cloth-canopy-occlusion-motion-report.json',{status:'passed',physicalDevice:false,artApproved:false,sourceSha:sha,htmlSha256:createHash('sha256').update(html).digest('hex'),runId:'123',runAttempt:'1',cases:sceneryCases});
    for(const c of sceneryCases)for(const phase of ['moving','paused','reduced'])writeFileSync(join(resultsDir,`equipment/00-cloth-canopy-occlusion-motion-${c.name}-${phase}.png`),Buffer.from('89504e470d0a1a0a','hex')); // Signature-only unit fixtures, not browser screenshots.
    put('equipment/equipment-report.json',{status:'passed',checks:['unit-only fixture'],errors:[],audio:structuredClone(audioFixture),contextHandoff:handoff});
    put('equipment/equipment-merchant-v8.json',{fixture:'unit only, not a player save'});
    writeFileSync(join(resultsDir,'equipment/inventory-touch-trace.zip'),Buffer.from([0x50,0x4b,3,4,0])); // Unit signature only; not browser evidence.
    put('equipment/inventory-touch-report.json',{status:'passed',phase:'complete',closeFocus:'world',physicalDevice:false,
      sourceSha:sha,htmlSha256:createHash('sha256').update(html).digest('hex'),runId:'123',runAttempt:'1',
      browserBeforeTouch:{contexts:0,pages:0},navigation:{status:'loaded',waitUntil:'load',timeoutMs:30000,httpStatus:200,failed:[]},
      navigationState:{readyState:'complete'},errors:[],observations:[1,2].map(()=>({disclosureTapPassed:true,stateUnchanged:true})),
      sourceSave:'equipment-merchant-v8.json',sourceSaveSha256:createHash('sha256').update(readFileSync(join(resultsDir,'equipment/equipment-merchant-v8.json'))).digest('hex'),trace:'inventory-touch-trace.zip'});
  }
  return {root,put,args:{lane,resultsDir,buildDir,sourceSha:sha,runId:'123',runAttempt:'1'}};
}
test('all thirteen existing browser journeys have exactly one evidence owner',()=>{
  const paths=Object.values(LANE_REPORTS).flat();assert.equal(paths.length,13);assert.equal(new Set(paths).size,13);
  assert.deepEqual(LANE_REPORTS.validate.slice(-2),['rescue/rescue-report.json','trial/trial-report.json']);
  assert.deepEqual(LANE_REPORTS.good.slice(-2),['prologue/prologue-report.json','equipment/equipment-report.json']);
});
test('CI retains three jobs, 45-minute budgets, no soft failures or parallel browser workers',()=>{
  assert.match(workflow,/route: \[good, bad\]/);assert.equal((workflow.split("\njobs:\n")[1].match(/^  [\w-]+:\n/gm)||[]).length,2);
  assert.deepEqual(workflow.match(/timeout-minutes: \d+/g),['timeout-minutes: 45','timeout-minutes: 45']);
  assert.doesNotMatch(workflow,/continue-on-error|timeout-minutes: (?:60|90)|fail-fast: true|\|\| true/);
});
test('same-run exported save dependencies remain ordered and runner-local',()=>{
  const [validate,witness]=workflow.split('  fair-witness-journey:');
  const chain=['opening','kingdom','rescue','trial'];
  for(let i=0;i<chain.length;i++){
    const pos=validate.indexOf(`run: python tests/${chain[i]}_browser.py`);assert.ok(pos>=0);
    if(i)assert.ok(pos>validate.indexOf(`run: python tests/${chain[i-1]}_browser.py`));
  }
  assert.doesNotMatch(validate,/run: python tests\/(keyboard|prologue|equipment)_browser.py/);
  for(const name of ['prologue','equipment'])assert.match(witness,new RegExp(`if: matrix.route == 'good'\n        run: python tests/${name}_browser.py`));
  assert.ok(witness.indexOf('tests/prologue_browser.py')<witness.indexOf('tests/equipment_browser.py'));
  assert.match(witness,/if: matrix.route == 'bad'\n        run: python tests\/keyboard_browser.py/);
});
test('every original command remains once; both witness matrix paths remain',()=>{
  for(const file of ['keyboard_browser','prologue_browser','equipment_browser','browser_smoke','fair_browser','opening_browser','kingdom_browser','reference_browser','navigation_browser','rescue_browser','trial_browser','witness_browser'])
    assert.equal(workflow.split(`run: python tests/${file}.py`).length-1,1,file);
});
test('lane verification always runs and complete moved evidence is uploaded on failure',()=>{
  assert.match(workflow,/if: always\(\)\n        run: node scripts\/ci-evidence.mjs validate/);
  assert.match(workflow,/if: always\(\)\n        run: node scripts\/ci-evidence.mjs \$\{\{ matrix.route \}\}/);
  const witness=workflow.split('  fair-witness-journey:')[1];
  assert.match(witness,/name: chrono-witness-\$\{\{ matrix.route \}\}-evidence[\s\S]*path: \|\n            test-results\/\n            dist\/build-meta.json/);
  assert.match(witness,/if-no-files-found: error/);
  const pages=readFileSync(new URL('../.github/workflows/pages.yml',import.meta.url),'utf8');
  assert.match(pages,/github.event.workflow_run.conclusion == 'success'/);
});
for(const lane of ['validate','good','bad'])test(`unit ${lane}: complete reports produce a source-bound ledger, not art or device acceptance`,t=>{
  const {args}=fixture(t,lane),r=inspectLane(args);assert.equal(r.status,'passed');assert.equal(r.expectedJourneys,LANE_REPORTS[lane].length);
  assert.ok(r.reports.every(x=>/^[a-f0-9]{64}$/.test(x.sha256)));assert.equal(r.artApproved,false);assert.equal(r.physicalDeviceApproved,false);assert.equal(r.fullGameAccepted,false);
});
test('missing trial final report fails even when an incomplete progress checkpoint exists',t=>{
  const f=fixture(t);rmSync(join(f.args.resultsDir,'trial/trial-report.json'));f.put('trial/trial-progress.json',{status:'incomplete',passedChecks:['some unit checks'],acceptance:false});
  const r=inspectLane(f.args);assert.equal(r.status,'failed');assert.equal(r.errors[0].path,'trial/trial-report.json');
});
test('failed, empty or console-error reports fail closed',t=>{
  const f=fixture(t);for(const report of [{status:'failed',passed:['x']},{status:'passed',passed:[]},{status:'passed',checks:['x'],errors:['error']}] ){
    f.put('trial/trial-report.json',report);assert.equal(inspectLane(f.args).status,'failed');
  }
});
test('wrong report source or HTML digest cannot satisfy provenance',t=>{
  const f=fixture(t,'good');for(const wrong of [{sourceSha:'b'.repeat(40)},{htmlSha256:'0'.repeat(64)}]){
    f.put('equipment/equipment-report.json',{status:'passed',checks:['unit'],errors:[],audio:structuredClone(audioFixture),...wrong});assert.equal(inspectLane(f.args).status,'failed');
  }
  f.put('equipment/equipment-report.json',{status:'passed',checks:['unit'],audio:structuredClone(audioFixture),contextHandoff:handoff,sourceSha:sha,htmlSha256:createHash('sha256').update(html).digest('hex')});assert.equal(inspectLane(f.args).status,'passed');
});
test('missing native observations fail even with all main reports green',t=>{
  const f=fixture(t,'bad');f.put('keyboard/native-import-report.json',{status:'passed',sourceSha:sha,attempts:[]});assert.equal(inspectLane(f.args).status,'failed');
});
test('invalid identity, lane or build provenance is rejected before accepting results',t=>{
  const f=fixture(t);for(const override of [{lane:'__proto__'},{lane:'../validate'},{sourceSha:'main'},{runId:'0'},{runAttempt:undefined},{sourceSha:'b'.repeat(40)}])assert.throws(()=>inspectLane({...f.args,...override}));
  writeFileSync(join(f.args.buildDir,'index.html'),'truncated');assert.throws(()=>inspectLane(f.args),/provenance/);
});
test('failed CLI emits a durable failed ledger and nonzero exit without invoking browser code',t=>{
  const f=fixture(t);rmSync(join(f.args.resultsDir,'trial/trial-report.json'));
  const script=fileURLToPath(new URL('../scripts/ci-evidence.mjs',import.meta.url));
  const r=spawnSync(process.execPath,[script,'validate'],{cwd:f.root,env:{...process.env,GITHUB_SHA:sha,GITHUB_RUN_ID:'123',GITHUB_RUN_ATTEMPT:'1'},encoding:'utf8'});
  assert.equal(r.status,1);assert.equal(JSON.parse(readFileSync(join(f.args.resultsDir,'ci/validate.json'),'utf8')).status,'failed');
});
test('ledger publication replaces complete bytes without leaving a temporary file',t=>{
  const f=fixture(t),path=join(f.root,'ledger/result.json');writeLedger(path,{status:'failed'});writeLedger(path,{status:'passed',fixture:true});
  assert.deepEqual(JSON.parse(readFileSync(path,'utf8')),{status:'passed',fixture:true});assert.equal(existsSync(path+'.tmp'),false);
});

for(const defect of ['missing','overlap','timeout','wrong-run','cleanup','changed-export','trace'])test(`touch receipt fails closed: ${defect}`,t=>{
  const f=fixture(t,'good'),path='equipment/inventory-touch-report.json';
  const r=JSON.parse(readFileSync(join(f.args.resultsDir,path),'utf8'));
  if(defect==='missing')rmSync(join(f.args.resultsDir,path));
  else if(defect==='changed-export')f.put('equipment/equipment-merchant-v8.json',{tampered:true});
  else if(defect==='trace')rmSync(join(f.args.resultsDir,'equipment/inventory-touch-trace.zip'));
  else{
    if(defect==='overlap')r.browserBeforeTouch.contexts=1;
    if(defect==='timeout')r.navigation.status='failed';
    if(defect==='wrong-run')r.runId='999';
    if(defect==='cleanup')r.cleanupError='context did not close';
    f.put(path,r);
  }
  const result=inspectLane(f.args);assert.equal(result.status,'failed');assert.ok(result.errors.some(e=>e.path===path));
});
test('green touch report cannot conceal a missing desktop retirement',t=>{
  const f=fixture(t,'good');f.put('equipment/equipment-report.json',{status:'passed',checks:['unit']});
  assert.equal(inspectLane(f.args).status,'failed');
});

for(const defect of ['missing','stalled','missing-tick','wrong-source','missing-image','cleanup'])test(`scenery receipt fails closed: ${defect}`,t=>{
 const f=fixture(t,'good'),path='equipment/00-cloth-canopy-occlusion-motion-report.json';
 const r=JSON.parse(readFileSync(join(f.args.resultsDir,path),'utf8'));
 if(defect==='missing')rmSync(join(f.args.resultsDir,path));
 else if(defect==='missing-image')rmSync(join(f.args.resultsDir,'equipment/00-cloth-canopy-occlusion-motion-portrait-reduced.png'));
 else{if(defect==='stalled')r.cases[0].later.tick=0;if(defect==='missing-tick')delete r.cases[0].later.tick;if(defect==='wrong-source')r.sourceSha='b'.repeat(40);if(defect==='cleanup')r.cleanupErrors=['unit error'];f.put(path,r);}
 const result=inspectLane(f.args);assert.equal(result.status,'failed');assert(result.errors.some(e=>e.path===path));
});

for(const defect of ['missing-finish','leaking-light','floating-tree','dynamic-shadow'])test(`fair finish ledger rejects ${defect}`,t=>{
 const f=fixture(t,'good'),path='equipment/00-cloth-canopy-occlusion-motion-report.json',r=JSON.parse(readFileSync(join(f.args.resultsDir,path),'utf8'));
 if(defect==='missing-finish')delete r.cases[0].finish;
 if(defect==='leaking-light')r.cases[0].finish.before.fill.onlyFair=false;
 if(defect==='floating-tree')r.cases[0].finish.before.contacts[0].footError=.1;
 if(defect==='dynamic-shadow')r.cases[0].finish.paused.softShadows.dynamic=true;
 f.put(path,r);const result=inspectLane(f.args);assert.equal(result.status,'failed');assert(result.errors.some(e=>e.path===path));
});

for(const defect of ['missing','stale','pixel','paused','approval'])test(`paving observations fail closed: ${defect}`,t=>{
 const f=fixture(t,'good'),path='equipment/00-cloth-canopy-occlusion-motion-report.json';const r=JSON.parse(readFileSync(join(f.args.resultsDir,path),'utf8'));const c=r.cases[0];
 if(defect==='missing')delete c.paving;else if(defect==='stale')c.paving.before.profile='old';else if(defect==='pixel')c.paving.before.samples[0].rgba[0]^=1;else if(defect==='paused')delete c.paving.paused;else c.paving.reduced.approved=true;
 f.put(path,r);const result=inspectLane(f.args);assert.equal(result.status,'failed');assert.ok(result.errors.some(e=>e.path===path));
});
