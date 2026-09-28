/** Current F identity and unmodified original E program contracts. SOURCE-only. */
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,readdirSync} from 'node:fs';import {createHash} from 'node:crypto';
import {artFSpec,artFBaseline,artFIfDeclared} from './helpers/production-place-f-baseline.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
for(const [name,e]of Object.entries(artFSpec.files))test('F source-only predecessor roundtrip and mutation rejection '+name,()=>{
 const raw=readFileSync(name,'utf8'),old=artFBaseline(name,raw);assert.equal(sha(old),e.sha256);assert.equal(artFIfDeclared(name,old),old);assert.equal(artFIfDeclared(name,raw+'\n// extra\n'),old+'\n// extra\n');
 for(const h of e.hunks)for(const bad of [raw.replace(h.after,''),raw+h.after,raw+'\n// drift\n'])assert.throws(()=>artFBaseline(name,bad));
});
test('F all other E program inputs, including original native routes/goldens and held prologue, remain exact',()=>{
 const pin=JSON.parse(readFileSync('tests/baselines/vq04f-unchanged-inputs.json')),names=[...pin.rootFiles];function walk(d){for(const e of readdirSync(d,{withFileTypes:true})){if(e.name==='__pycache__'||e.name.endsWith('.pyc'))continue;assert(!e.isSymbolicLink());const n=d+'/'+e.name;if(e.isDirectory())walk(n);else if(e.isFile())names.push(n);}}for(const d of pin.roots)walk(d);
 const rows=names.sort().filter(n=>!pin.exclude.includes(n)).map(n=>[n,sha(readFileSync(n))]);assert.equal(rows.length,pin.expectedCount);assert.equal(sha(JSON.stringify(rows)),pin.sha256);
 for(const n of ['src/core.ts','src/render.ts','src/prologue-render.ts','src/production-story-npc-art.ts','src/production-story-npc-finish.ts','src/production-combat-art.ts','tests/party_combat.py','tests/party_reaction.py','tests/trial_browser.py','tests/baselines/vq04e-declared-art-edits.json','tests/baselines/vq04e-unchanged-inputs.json','.github/workflows/ci.yml'])assert(rows.some(([p])=>p===n),n);
 const b=readFileSync('src/prologue-render.ts');assert.equal(createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex'),'2711a74185aacf3c6bddf9db85ba99a2afbc507a');
});
test('F source inverse never accepts native/image/State/golden payloads or undeclared paths',()=>{
 for(const n of ['native.json','image.png','src/core.ts','src/render.ts','src/production-story-npc-art.ts','tests/party_combat.py','tests/fixtures/party-combat-frames.json','__proto__','constructor'])assert.throws(()=>artFBaseline(n,'{}'));
});
test('F actual build and full application entry activate scenery only, without a device/quality bypass',()=>{
 const entry=readFileSync('src/art-directed-world.ts','utf8'),build=readFileSync('scripts/build.mjs','utf8'),pass=readFileSync('src/production-place-finish.ts','utf8');
 assert(entry.includes('this.places=installProductionPlaces(scene)'));assert(entry.includes('places:this.places.inspect()'));assert(entry.includes('super.draw(state,dt,animate,frameEffects)'));assert(!entry.includes('production-combat-art'));
 assert(build.includes("version:'0.9.79',batch:'VQ04F'"));assert(build.includes("exportProductionPlaces('dist/art/production-vq04f')"));assert(artFBaseline('scripts/build.mjs',build).includes("version:'0.9.78',batch:'VQ04E'"));
 assert(!/fetch\(|setTimeout|setInterval|Date\.|performance\.|\.ticks|\.hp\b|localStorage|navigator|location|readPixels|State/.test(pass.replace(/\/\*\*[\s\S]*?\*\//g,'')));
 assert(readFileSync('src/production-combat-art.ts','utf8').includes('runtimeApplied:false'));
});
test('F asset register retains all E assets and keeps new artwork unapproved',async()=>{
 const raw=readFileSync('assets/manifest.json','utf8'),a=JSON.parse(raw),old=JSON.parse(artFBaseline('assets/manifest.json',raw));assert.deepEqual(a.items.slice(0,old.items.length),old.items);
 const item=a.items.find(a=>a.id==='town-court-craft-vq04f');assert.equal(item.required,true);assert.equal(item.stage,'review');assert(item.evidence.length>0);
 const {evaluateQuality}=await import('../scripts/quality.mjs'),result=evaluateQuality(JSON.parse(readFileSync('quality/scorecard.json')),a,'0'.repeat(64));assert.equal(result.releaseApproved,false);assert(result.blockers.includes('asset:town-court-craft-vq04f'));
});
