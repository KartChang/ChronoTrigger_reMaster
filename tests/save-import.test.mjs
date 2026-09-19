import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {bindSaveImport} from '../.test/save-import.mjs';

// Unit-only event port: these results do not claim an OS chooser or physical keyboard was exercised.
function harness(){
 const listeners={},events=[],applied=[];
 let allowed=true,busy=false,read,releaseCount=0;
 const input={value:'prior-path',files:[],dataset:{},addEventListener:(name,fn)=>listeners[name]=fn,click(){events.push(['activate',busy,input.dataset.picker]);}};
 const hooks={canStart:()=>allowed,busy:value=>{busy=value;events.push(['busy',value]);},apply:raw=>applied.push(raw),notice:message=>events.push(['notice',message]),released:()=>releaseCount++};
 const port=bindSaveImport(input,hooks);
 return {input,hooks,port,events,applied,listeners,allowed:value=>allowed=value,busy:()=>busy,releases:()=>releaseCount,
  choose(file){input.files=file?[file]:[];listeners.change();},cancel:()=>listeners.cancel(),
  pendingFile(){return {size:20,text:()=>new Promise(resolve=>{read=resolve;})};},resolve:raw=>read(raw)};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('unit import: a single synchronous native-input activation begins behind paused input',()=>{
 const h=harness();assert.equal(h.port.request(),true);assert.deepEqual(h.events.slice(0,2),[['busy',true],['activate',true,'open']]);
 assert.equal(h.input.value,'');assert.equal(h.port.inspect().phase,'open');assert.equal(h.releases(),0);
 assert.equal(h.port.request(),false);assert.equal(h.events.filter(e=>e[0]==='activate').length,1);
});
test('unit import: unavailable contexts never call native activation or pause the game',()=>{
 const h=harness();h.allowed(false);assert.equal(h.port.request(),false);assert.equal(h.busy(),false);assert.equal(h.port.inspect().phase,'closed');assert(!h.events.some(e=>e[0]==='activate'));
});
test('unit import: native cancel returns ownership once without applying any data',()=>{
 const h=harness();h.port.request();h.cancel();assert.equal(h.busy(),false);assert.equal(h.input.dataset.picker,'closed');assert.equal(h.input.value,'');assert.equal(h.releases(),1);assert.deepEqual(h.applied,[]);
 h.cancel();assert.equal(h.releases(),1);assert.equal(h.port.inspect().events.at(-1).event,'late-cancel-ignored');
 assert.equal(h.port.request(),true);assert.equal(h.events.filter(e=>e[0]==='activate').length,2);
});
test('unit import: empty-selection change is a no-op cancellation, not a fake import',async()=>{
 const h=harness();h.port.request();h.choose(null);await flush();assert.equal(h.port.inspect().phase,'closed');assert.deepEqual(h.applied,[]);assert.equal(h.releases(),1);
});
test('unit import: reading is atomic; repeat activation and late cancel cannot resume early',async()=>{
 const h=harness();h.port.request();h.choose(h.pendingFile());assert.equal(h.port.inspect().phase,'reading');assert(h.busy());
 h.cancel();assert(h.busy());assert.equal(h.port.request(),false);assert.equal(h.releases(),0);
 h.resolve('the exact selected text');await flush();assert.deepEqual(h.applied,['the exact selected text']);assert(!h.busy());assert.equal(h.releases(),1);assert.equal(h.port.inspect().phase,'closed');
});
test('unit import: empty or unsolicited events while closed do not apply data',async()=>{
 const h=harness();h.choose({size:1,text:async()=>'not-selected'});await flush();assert.deepEqual(h.applied,[]);assert.equal(h.releases(),0);
});
test('unit import: activation error is visible and never retries another picker route',()=>{
 const h=harness();let calls=0;h.input.click=()=>{calls++;throw new Error('blocked');};assert.equal(h.port.request(),false);assert.equal(calls,1);assert(!h.busy());assert.equal(h.port.inspect().phase,'error');assert.equal(h.releases(),1);assert(h.events.some(e=>e[0]==='notice'&&e[1].includes('blocked')));
});
test('unit import: over-limit file is rejected before any read or state replacement',async()=>{
 const h=harness();let reads=0;h.port.request();h.choose({size:65537,text:async()=>{reads++;return 'oversized';}});await flush();assert.equal(reads,0);assert.deepEqual(h.applied,[]);assert.equal(h.input.dataset.picker,'error');assert(!h.busy());assert.equal(h.releases(),1);
});
test('unit import: read rejection preserves existing state and releases controls',async()=>{
 const h=harness();h.port.request();h.choose({size:2,text:async()=>{throw new Error('read failed');}});await flush();assert.deepEqual(h.applied,[]);assert.equal(h.port.inspect().phase,'error');assert(!h.busy());assert.equal(h.releases(),1);
});
test('unit import: parse rejection preserves existing state and allows another explicit request',async()=>{
 const h=harness();h.hooks.apply=()=>{throw new Error('invalid JSON');};h.port.request();h.choose({size:2,text:async()=>'{}'});await flush();assert.deepEqual(h.applied,[]);assert.equal(h.port.inspect().phase,'error');assert(!h.busy());assert.equal(h.releases(),1);assert.equal(h.port.request(),true);
});
test('unit import: diagnostic ring is bounded, copied, and excludes file contents/names',()=>{
 const h=harness();for(let i=0;i<20;i++){h.port.request();h.cancel();}const snapshot=h.port.inspect();assert.equal(snapshot.events.length,24);snapshot.events[0].event='overwrite';assert.notEqual(h.port.inspect().events[0].event,'overwrite');assert.deepEqual(Object.keys(snapshot.events[0]).sort(),['event','phase','sequence']);
});
test('production import remains read-only in diagnostics and shields commands while busy',()=>{
 const main=readFileSync('src/main.ts','utf8'),browser=readFileSync('tests/equipment_browser.py','utf8');
 assert.match(main,/function command\(slot:Slot,cmd:Command\):void\{\s*if\(filePickerOpen\)return/);
 assert.match(main,/if\(filePickerOpen\)return 'native'/);assert.match(main,/apply:raw=>\{replaceState\(deserialize\(raw\)\)/);
 assert.match(main,/inputBoundary.rebase\(state\);last=performance.now\(\);accumulator=0/);
 assert.match(browser,/page.expect_file_chooser\(\)/);assert.match(browser,/activation='Space'/);assert.doesNotMatch(browser,/\.set_input_files\(/);
});

// Unit event-order regression, using actual CI23 exports without rewriting flags.
// This reconstructs the cancelled->late-change failure mode, not an observed OS trace.
import {createHash} from 'node:crypto';
import {deserialize} from '../.test/core.mjs';
const provenance=JSON.parse(readFileSync('tests/fixtures/ci23-import/provenance.json','utf8'));
for(const entry of provenance.entries){
 test(`actual CI23 ${entry.file}: parses, late unowned assignment is rejected, explicit request imports`,async()=>{
  const raw=readFileSync(`tests/fixtures/ci23-import/${entry.file}`);
  assert.equal(createHash('sha256').update(raw).digest('hex'),entry.sha256);assert.equal(raw.length,entry.bytes);
  const expected=deserialize(raw.toString('utf8'));assert.equal(expected.chapter,'fair');assert(expected.prologue.conduct);
  const h=harness();let current=null;h.hooks.apply=text=>{current=deserialize(text);};
  h.port.request();h.cancel();h.choose({size:raw.length,text:async()=>raw.toString('utf8')});await flush();
  assert.equal(current,null);assert.equal(h.port.inspect().events.at(-1).event,'unexpected-change-ignored');
  h.port.request();h.choose({size:raw.length,text:async()=>raw.toString('utf8')});await flush();
  assert.deepEqual(current,expected);assert.equal(h.port.inspect().events.at(-1).event,'imported');
  assert.equal(createHash('sha256').update(readFileSync(`tests/fixtures/ci23-import/${entry.file}`)).digest('hex'),entry.sha256);
 });
}
test('unit import: a duplicated change cannot apply twice or release a pending read',async()=>{
 const h=harness();h.port.request();const file=h.pendingFile();h.choose(file);h.choose(file);
 assert.equal(h.port.inspect().events.at(-1).event,'unexpected-change-ignored');assert(h.busy());assert.equal(h.releases(),0);
 h.resolve('once');await flush();assert.deepEqual(h.applied,['once']);assert.equal(h.releases(),1);
});
test('unit import: reselecting identical bytes is allowed only after a fresh user request',async()=>{
 const h=harness(),file={size:4,text:async()=>'same'};
 for(let i=0;i<2;i++){assert(h.port.request());assert.equal(h.input.value,'');h.choose(file);await flush();}
 assert.deepEqual(h.applied,['same','same']);assert.equal(h.releases(),2);
});
