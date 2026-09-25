import {sceneryHIfDeclared} from './helpers/scenery-h-baseline.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {audioGBaseline,audioGIfDeclared} from './helpers/audio-g-baseline.mjs';
import {fairTrialBaseline} from './helpers/fair-trial-baseline.mjs';
const spec=JSON.parse(readFileSync('tests/baselines/vq03g-declared-audio-edits.json','utf8'));
const fair=JSON.parse(readFileSync('tests/baselines/vq03f-declared-fair-trial-edits.json','utf8'));
const sha=s=>createHash('sha256').update(s).digest('hex');
for(const [name,edits] of Object.entries(spec.files)){
 test('G inverse preserves the exact CI76 and F-to-E build/test pins: '+name,()=>{
  const raw=sceneryHIfDeclared(name,readFileSync(name,'utf8')),base=audioGBaseline(name,raw);
  assert.equal(sha(base),spec.originalSha256[name]);assert.equal(audioGIfDeclared(name,base),base);
  assert.equal(sha(fairTrialBaseline(name,raw)),fair.originalSha256[name]);
  assert.notEqual(sha(audioGBaseline(name,raw+'\n// unrelated')),spec.originalSha256[name]);
 });
 edits.forEach((e,i)=>test(`G inverse rejects missing/duplicate/altered hunk ${name}/${i}`,()=>{
  const raw=sceneryHIfDeclared(name,readFileSync(name,'utf8'));assert.equal(raw.split(e.after).length,2);
  assert.throws(()=>audioGBaseline(name,raw.replace(e.after,'')));
  assert.throws(()=>audioGBaseline(name,raw+e.after));
  assert.throws(()=>audioGBaseline(name,raw.replace(e.after,e.after.slice(0,-1)+'?')));
 }));
}
test('undeclared files are not silently accepted by the strict G inverse',()=>{
 assert.throws(()=>audioGBaseline('src/main.ts','unchanged'));
 assert.equal(audioGIfDeclared('src/main.ts','unchanged'),'unchanged');
});
