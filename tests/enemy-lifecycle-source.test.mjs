import {artAIfDeclared} from './helpers/production-art-a-baseline.mjs';
/** No native data normalization: only exact declared source edits are reversible. */
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {lifecycleZSpec,lifecycleZBaseline,lifecycleZIfDeclared,unchangedZEntries} from './helpers/enemy-lifecycle-z-baseline.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
for(const name of Object.keys(lifecycleZSpec.files))test('Z exact source inverse rejects missing/duplicate/unrelated drift '+name,()=>{
 const raw=artAIfDeclared(name,readFileSync(name,'utf8')),old=lifecycleZBaseline(name,raw);assert.equal(sha(old),lifecycleZSpec.originalSha256[name]);assert.equal(lifecycleZIfDeclared(name,old),old);
 for(const e of lifecycleZSpec.files[name])for(const bad of [raw.replace(e.after,''),raw+e.after,raw+'\n// unrelated\n'])assert.throws(()=>lifecycleZBaseline(name,bad));
 assert.equal(lifecycleZIfDeclared(name,raw+'\n// unrelated\n'),old+'\n// unrelated\n');
});
test('Z never accepts native evidence or undeclared files as inverse inputs',()=>{for(const name of ['native.json','src/core.ts','tests/field_enemy_action.py'])assert.throws(()=>lifecycleZBaseline(name,'{}'));});
test('Z current producer, fixed-time and held gameplay/native inputs are explicit',()=>{
 assert(artAIfDeclared('scripts/build.mjs',readFileSync('scripts/build.mjs','utf8')).includes("const buildInfo={version:'0.9.73',batch:'VQ03Z',sourceSha:process.env.GITHUB_SHA??null};"));
 const pin=JSON.parse(readFileSync('tests/baselines/vq03z-unchanged-inputs.json')),rows=unchangedZEntries(pin);assert.equal(rows.length,pin.expectedCount);assert.equal(sha(JSON.stringify(rows)),pin.sha256);
 assert.notEqual(sha(JSON.stringify(rows.slice(1))),pin.sha256,'missing input fails');const altered=structuredClone(rows);altered[0][1]='0'.repeat(64);assert.notEqual(sha(JSON.stringify(altered)),pin.sha256,'changed input fails');
});
