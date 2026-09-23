import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,mkdirSync,rmSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';import {tmpdir} from 'node:os';import {createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';
import {retainCpuEraFailure} from '../scripts/cpu-era-failure.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const raw of ['{"status":"passed","views":[]}\n','{broken json',''])test('W diagnostics retain raw bytes including malformed report '+raw.length,()=>{
 const dir=mkdtempSync(join(tmpdir(),'chrono-failure-'));try{
  writeFileSync(join(dir,'report.json'),raw);writeFileSync(join(dir,'source-ledger.json'),'existing-ledger-must-not-change');
  const first=new Error('first projection error');first.observation={projection:{rect:{width:34,height:17}},required:{width:40,height:20}};
  const r=retainCpuEraFailure(dir,first,{sourceSha:'a'.repeat(40),runId:'7',runAttempt:'1'});
  assert.equal(r.status,'failed');assert.equal(r.accepted,false);assert.equal(r.error.message,first.message);assert.equal(r.error.stack,first.stack);
  assert.deepEqual(r.error.observation,first.observation);assert.equal(r.report.sha256,hash(raw));assert.equal(r.report.bytes,Buffer.byteLength(raw));
  assert.equal(readFileSync(join(dir,'report.json'),'utf8'),raw);assert.equal(readFileSync(join(dir,'source-ledger.json'),'utf8'),'existing-ledger-must-not-change');
  assert.deepEqual(JSON.parse(readFileSync(join(dir,'source-failure.json'))),r);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('W missing report is secondary, cannot replace the original error',()=>{
 const dir=mkdtempSync(join(tmpdir(),'chrono-failure-'));try{
  const r=retainCpuEraFailure(dir,new Error('primary failure'),{sourceSha:'a'.repeat(40),runId:'7',runAttempt:'1'});
  assert.equal(r.error.message,'primary failure');assert.equal(r.report,null);assert.match(r.reportReadError,/ENOENT/);assert.equal(existsSync(join(dir,'source-ledger.json')),false);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('W actual verifier CLI retains a failure and still exits nonzero; no fake passed ledger',()=>{
 const dir=mkdtempSync(join(tmpdir(),'chrono-failure-cli-'));try{
  mkdirSync(join(dir,'test-results/cpu-renderer/era600'),{recursive:true});
  const r=spawnSync(process.execPath,[resolve('scripts/cpu-era-evidence.mjs')],{cwd:dir,encoding:'utf8',env:{...process.env,GITHUB_SHA:'a'.repeat(40),GITHUB_RUN_ID:'7',GITHUB_RUN_ATTEMPT:'1'}});
  assert.equal(r.status,1);const f=JSON.parse(readFileSync(join(dir,'test-results/cpu-renderer/era600/source-failure.json')));
  assert.equal(f.status,'failed');assert.equal(f.accepted,false);assert.match(f.error.message,/ENOENT/);assert.equal(existsSync(join(dir,'test-results/cpu-renderer/era600/source-ledger.json')),false);
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('W failure receipt cannot accept an identity claiming success or replace first error on retention failure',()=>{
 const dir=mkdtempSync(join(tmpdir(),'chrono-failure-'));try{
  const e=new Error('first error');const r=retainCpuEraFailure(dir,e,{sourceSha:'a'.repeat(40),runId:'7',runAttempt:'1',status:'passed',accepted:true});
  assert.equal(r.status,'failed');assert.equal(r.accepted,false);assert.equal(r.error.message,'first error');
  assert.throws(()=>retainCpuEraFailure(join(dir,'missing-parent'),e,{}),/ENOENT/);assert.equal(e.message,'first error');
 }finally{rmSync(dir,{recursive:true,force:true});}
});
