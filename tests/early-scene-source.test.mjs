import {artDFrozenBytes,artDIsNew,artDIfDeclared} from './helpers/production-party-d-baseline.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,readdirSync} from 'node:fs';import {createHash} from 'node:crypto';
import {artCSpec,artCBaseline,artCIfDeclared} from './helpers/early-scene-c-baseline.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
for(const [name,e]of Object.entries(artCSpec.files))test('C source-only declaration roundtrips '+name+' and rejects unrelated/drop/duplicate changes',()=>{
 const s=readFileSync(name,'utf8');assert.equal(sha(artCBaseline(name,s)),e.sha256);assert.equal(artCIfDeclared(name,artCBaseline(name,s)),artCBaseline(name,s));for(const bad of [s.slice(1),s+s,s+'\n// unrelated\n'])assert.throws(()=>artCBaseline(name,bad));
});
test('C retains all unchanged inputs including original golden cells, core, held prologue, native routes/waits/captures/assertions/workflows',()=>{
 const pin=JSON.parse(readFileSync('tests/baselines/vq04c-unchanged-inputs.json')),names=[...pin.rootFiles];function walk(d){for(const e of readdirSync(d,{withFileTypes:true})){if(e.name==='__pycache__'||e.name.endsWith('.pyc'))continue;assert(!e.isSymbolicLink());const n=d+'/'+e.name;if(e.isDirectory())walk(n);else if(e.isFile())names.push(n);}}for(const r of pin.roots)walk(r);
 const rows=names.sort().filter(n=>!pin.exclude.includes(n)&&!artDIsNew(n)).map(n=>[n,sha(artDFrozenBytes(n,readFileSync(n)))]);assert.equal(rows.length,pin.expectedCount);assert.equal(sha(JSON.stringify(rows)),pin.sha256);
 for(const n of ['src/core.ts','src/render.ts','src/prologue-render.ts','src/hd-hero-art.ts','src/imp-action.ts','tests/trial_browser.py','tests/field_enemy_action_browser.py','tests/fixtures/party-combat-frames.json','.github/workflows/ci.yml'])assert(rows.some(([name])=>name===n));
});
test('C runtime is connected to the only application entry without native/device-specific paths or gameplay/camera writes',()=>{
 const main=readFileSync('src/main.ts','utf8'),entry=readFileSync('src/art-directed-world.ts','utf8'),runtime=readFileSync('src/early-scene-finish.ts','utf8');assert(main.includes("{ArtDirectedWorld as World} from './art-directed-world'"));assert(entry.includes('this.earlySceneFinish=installEarlySceneFinish(scene)'));assert(entry.includes('super.draw(state,dt,animate,frameEffects)'));
 assert(!/setTimeout|setInterval|requestAnimationFrame|localStorage|location|navigator|fetch\(|State|activeCamera|takeFrameEffects/.test(runtime));assert(runtime.includes('No material-owned NPC or enemy picture'));
 assert(artDIfDeclared('scripts/build.mjs',readFileSync('scripts/build.mjs','utf8')).includes("version:'0.9.76',batch:'VQ04C'"));assert(readFileSync('scripts/build.mjs','utf8').includes("await exportEarlyScenes('dist/art/production-vq04c');"));
});
test('C source inverses reject native/game/image/golden inputs',()=>{for(const n of ['src/core.ts','src/prologue-render.ts','tests/trial_browser.py','tests/fixtures/party-combat-frames.json','native.json','image.png'])assert.throws(()=>artCBaseline(n,'{}'));});
