import {artFIfDeclared,artFFrozenBytes,artFIsNew} from './helpers/production-place-f-baseline.mjs';
/** E current producer and exact D predecessor preservation; no native normalization. */
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,readdirSync} from 'node:fs';import {createHash} from 'node:crypto';
import {artESpec,artEBaseline,artEIfDeclared} from './helpers/production-character-e-baseline.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
for(const [name,e]of Object.entries(artESpec.files))test('E source-only predecessor roundtrip and unrelated/missing/duplicate drift rejection '+name,()=>{
 const raw=artFIfDeclared(name,readFileSync(name,'utf8')),old=artEBaseline(name,raw);assert.equal(sha(old),e.sha256);assert.equal(artEIfDeclared(name,old),old);assert.equal(artEIfDeclared(name,raw+'\n// drift\n'),old+'\n// drift\n');
 for(const h of e.hunks)for(const bad of [raw.replace(h.after,''),raw+h.after,raw+'\n// unrelated\n'])assert.throws(()=>artEBaseline(name,bad));
});
test('E all other program inputs retain original D bytes, including all old pins, native assertions and held prologue',()=>{
 const pin=JSON.parse(readFileSync('tests/baselines/vq04e-unchanged-inputs.json')),names=[...pin.rootFiles];function walk(d){for(const e of readdirSync(d,{withFileTypes:true})){if(e.name==='__pycache__'||e.name.endsWith('.pyc'))continue;assert(!e.isSymbolicLink());const n=d+'/'+e.name;if(e.isDirectory())walk(n);else if(e.isFile())names.push(n);}}for(const root of pin.roots)walk(root);const rows=names.sort().filter(n=>!pin.exclude.includes(n)&&!artFIsNew(n)).map(n=>[n,sha(artFFrozenBytes(n,readFileSync(n)))]);assert.equal(rows.length,pin.expectedCount);assert.equal(sha(JSON.stringify(rows)),pin.sha256);
 for(const n of ['src/core.ts','src/render.ts','src/hd-hero-art.ts','src/prologue-render.ts','tests/party_combat.py','tests/party_reaction.py','tests/trial_browser.py','tests/baselines/vq04d-unchanged-inputs.json','.github/workflows/ci.yml'])assert(rows.some(([p])=>p===n),n);
 const held=readFileSync('src/prologue-render.ts');assert.equal(createHash('sha1').update(Buffer.concat([Buffer.from('blob '+held.length+'\0'),held])).digest('hex'),'2711a74185aacf3c6bddf9db85ba99a2afbc507a');
});
test('E inverse rejects gameplay, native/image payloads, prototype keys and undeclared paths',()=>{
 for(const n of ['native.json','image.png','src/core.ts','src/render.ts','src/prologue-render.ts','tests/party_combat.py','tests/fixtures/party-combat-frames.json','__proto__','constructor'])assert.throws(()=>artEBaseline(n,'{}'));
});
test('E actual source keeps combat staged and gameplay calls/constraints intact',()=>{
 const entry=artFIfDeclared('src/art-directed-world.ts',readFileSync('src/art-directed-world.ts','utf8')),build=artFIfDeclared('scripts/build.mjs',readFileSync('scripts/build.mjs','utf8')),adapter=readFileSync('src/production-story-npc-finish.ts','utf8');assert(entry.includes('this.storyNpcs=installProductionStoryNpcs(scene)'));assert(entry.includes('super.draw(state,dt,animate,frameEffects)'));assert(!entry.includes('production-combat-art'));assert(!/fetch\(|setTimeout|setInterval|Date\.|performance\.|\.ticks|\.hp\b|localStorage|navigator|location/.test(adapter));assert(build.includes("version:'0.9.78',batch:'VQ04E'"));assert(build.includes("exportProductionCharacters('dist/art/production-vq04e')"));
 const old=artEBaseline('scripts/build.mjs',build);assert(old.includes("version:'0.9.77',batch:'VQ04D'"));assert(readFileSync('src/production-combat-art.ts','utf8').includes('runtimeApplied:false'));
});

test('E actual asset register is valid, unapproved and preserves every original required asset',async()=>{
 const {evaluateQuality}=await import('../scripts/quality.mjs'),assets=JSON.parse(artFIfDeclared('assets/manifest.json',readFileSync('assets/manifest.json','utf8'))),review=JSON.parse(readFileSync('quality/scorecard.json'));
 const before=JSON.parse(artEBaseline('assets/manifest.json',readFileSync('assets/manifest.json','utf8')));assert.deepEqual(assets.items.slice(0,before.items.length),before.items);
 const result=evaluateQuality(review,assets,'0'.repeat(64));assert.equal(result.releaseApproved,false);
 for(const id of ['story-npcs-vq04e','party-combat-authored-vq04e']){const a=assets.items.find(a=>a.id===id);assert.equal(a.required,true);assert.equal(a.stage,'review');assert(a.evidence.length);assert(result.blockers.includes('asset:'+id));}
});
