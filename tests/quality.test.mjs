import test from 'node:test';import assert from 'node:assert/strict';
import {WEIGHTS,GATES,evaluateQuality} from '../scripts/quality.mjs';
// Synthetic records test the gate; never emitted as a project review.
const make=()=>({schemaVersion:1,scope:'whole-remake',reviewedSourceSha:'a'.repeat(40),runtimeDigest:'b'.repeat(64),dimensions:Object.entries(WEIGHTS).map(([id,weight])=>({id,weight,score:weight,reason:'test fixture',evidence:['fixture-only']})),gates:Object.fromEntries(GATES.map(id=>[id,{status:'pass',evidence:['fixture-only']}])),blockers:[]});
const assets=()=>({schemaVersion:1,items:[{id:'fixture',required:true,stage:'approved',evidence:['fixture-only']}]});const evaluate=(r,a=assets(),d='b'.repeat(64))=>evaluateQuality(r,a,d);
test('complete, current fixture can pass the mechanical gate',()=>assert.equal(evaluate(make()).releaseApproved,true));
test('a score above 90 never overrides a failed browser gate',()=>{const r=make();r.gates.browser.status='fail';assert.equal(evaluate(r).releaseApproved,false);});
test('unknown hardware evidence blocks release',()=>{const r=make();r.gates.hardware={status:'unverified',evidence:[]};assert.equal(evaluate(r).releaseApproved,false);});
test('placeholder assets cannot pass despite a score of 100',()=>{const a=assets();a.items[0].stage='prototype';assert.equal(evaluate(make(),a).releaseApproved,false);});
test('changing code makes a prior high score stale',()=>assert.equal(evaluate(make(),assets(),'c'.repeat(64)).releaseApproved,false));
test('omitting or narrowing scope cannot raise the average',()=>{const r=make();r.dimensions.pop();assert.throws(()=>evaluate(r));const s=make();s.scope='demo';assert.throws(()=>evaluate(s));});
test('unsupported positive ratings and NaN are rejected',()=>{const r=make();r.dimensions[0].evidence=[];assert.throws(()=>evaluate(r));r.dimensions[0].evidence=['x'];r.dimensions[0].score=NaN;assert.throws(()=>evaluate(r));});
test('a major deficient category cannot hide behind a high total',()=>{const r=make();r.dimensions.find(x=>x.id==='audio').score=0;const out=evaluate(r);assert.equal(out.score,90);assert.equal(out.releaseApproved,false);});
test('a remaining critical defect blocks otherwise complete ratings',()=>{const r=make();r.blockers=['progress softlock'];assert.equal(evaluate(r).releaseApproved,false);});
test('under 90 remains a development candidate',()=>{const r=make();r.dimensions[0].score=13;assert.equal(evaluate(r).releaseApproved,false);});
