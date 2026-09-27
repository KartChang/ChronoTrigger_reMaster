/** Actual build integration + exact source-only historical compatibility. */
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,readdirSync} from 'node:fs';import {createHash} from 'node:crypto';
import {artASpec,artABaseline,artAIfDeclared} from './helpers/production-art-a-baseline.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
for(const [name,edits]of Object.entries(artASpec.files))test('declared art source preserves old bytes and rejects drift '+name,()=>{
 const raw=readFileSync(name,'utf8'),old=artABaseline(name,raw);assert.equal(sha(old),artASpec.originalSha256[name]);assert.equal(artAIfDeclared(name,old),old);
 for(const {after}of edits)for(const bad of [raw.replace(after,''),raw+after,raw+'\n// unrelated\n'])assert.throws(()=>artABaseline(name,bad));
});
test('native sources, held files, images and game state are not art inverse inputs',()=>{
 for(const name of ['native.json','src/core.ts','src/prologue-render.ts','tests/opening_browser.py','tests/trial_browser.py','foo.png'])assert.throws(()=>artABaseline(name,'{}'));
});
test('actual browser entrypoint installs art for all launch modes without replacing gameplay',()=>{
 const main=readFileSync('src/main.ts','utf8');assert.equal(main.split("import {ArtDirectedWorld as World} from './art-directed-world';").length,2);assert.equal(main.split('new World(').length,2);
 const entry=readFileSync('src/art-directed-world.ts','utf8');assert(entry.includes('extends World'));assert(entry.includes('super(canvas)'));assert(entry.includes('installProductionEnvironment(scene)'));assert(!/querySelector|location|navigator|process\.env/.test(entry));
 const s=readFileSync('src/production-environment.ts','utf8');assert(s.includes("['truce-canyon-600','canyon']"));assert(s.includes("['trial-courtroom','courtroom']"));assert(s.includes("['trial-guardia1000','guardia1000']"));assert(!/fetch\(|setTimeout|setInterval|localStorage|\.step\(|\.effects|\.hp\b|\.ticks\b/.test(s));
 const pixels=readFileSync('src/production-art.ts','utf8');assert(!/fetch\(|Math\.random|Date\.|\.png|\.webp|imagegen|readFile/.test(pixels));
});
test('unchanged art-batch inputs retain all core/native paths, original held blob and thresholds',()=>{
 const pin=JSON.parse(readFileSync('tests/baselines/vq04a-unchanged-inputs.json')),paths=[...pin.rootFiles];
 const scan=dir=>{for(const e of readdirSync(dir,{withFileTypes:true})){if(e.name==='__pycache__'||e.name.endsWith('.pyc'))continue;const p=dir+'/'+e.name;assert(!e.isSymbolicLink());if(e.isDirectory())scan(p);else if(e.isFile())paths.push(p);}};for(const root of pin.roots)scan(root);
 const rows=paths.sort().filter(p=>!pin.exclude.includes(p)).map(p=>[p,sha(readFileSync(p))]);assert.equal(rows.length,pin.expectedCount);assert.equal(sha(JSON.stringify(rows)),pin.sha256);
 for(const path of ['src/core.ts','src/input.ts','src/prologue-render.ts','src/canyon-render.ts','src/trial-render.ts','tests/trial_browser.py','tests/field_enemy_action_browser.py','.github/workflows/ci.yml'])assert(rows.some(([p])=>p===path),path);
 const held=readFileSync('src/prologue-render.ts');assert.equal(createHash('sha1').update(Buffer.concat([Buffer.from('blob '+held.length+'\0'),held])).digest('hex'),'2711a74185aacf3c6bddf9db85ba99a2afbc507a');
});
