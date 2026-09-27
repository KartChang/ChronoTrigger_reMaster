/** Source integrity only. No report mutation and no native/gameplay acceptance. */
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {nativeBuildYSpec,nativeBuildYBaseline,nativeBuildYIfDeclared} from './helpers/native-build-y-baseline.mjs';
const sha=s=>createHash('sha256').update(s).digest('hex');
for(const name of Object.keys(nativeBuildYSpec.files))test('Y exact source inverse preserves X and rejects drift '+name,()=>{
 const raw=readFileSync(name,'utf8'),old=nativeBuildYBaseline(name,raw);assert.equal(sha(old),nativeBuildYSpec.originalSha256[name]);assert.equal(nativeBuildYIfDeclared(name,old),old);
 for(const e of nativeBuildYSpec.files[name])for(const bad of [raw.replace(e.after,''),raw+e.after,raw+'\n// unrelated\n'])assert.throws(()=>nativeBuildYBaseline(name,bad));
 assert.equal(nativeBuildYIfDeclared(name,raw+'\n// unrelated\n'),old+'\n// unrelated\n');
});
test('Y inverse never accepts native report or arbitrary files',()=>{for(const name of ['native.json','src/core.ts','tests/field_enemy_action.py'])assert.throws(()=>nativeBuildYBaseline(name,'{}'));});
test('Y producer identity is not changed to obsolete W to make the old gate pass',()=>{
 const build=readFileSync('scripts/build.mjs','utf8');assert(build.includes("const buildInfo={version:'0.9.72',batch:'VQ03Y',sourceSha:process.env.GITHUB_SHA??null};"));
 for(const name of ['tests/field_enemy_action_browser.py','tests/rescue_browser.py','tests/trial_browser.py'])assert(readFileSync(name,'utf8').includes('from current_build import EXPECTED_BUILD'));
});
test('Y protected gameplay, held art, native checker assertions and workflow bytes unchanged',()=>{
 for(const[name,h]of Object.entries(JSON.parse(readFileSync('tests/baselines/vq03y-unchanged-inputs.json'))))assert.equal(sha(readFileSync(name)),h,name);
});
