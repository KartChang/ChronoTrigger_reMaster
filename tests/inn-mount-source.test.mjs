import {groveLIfDeclared,groveLFrozenBytes,groveLIsNew} from './helpers/grove-l-baseline.mjs';
/** K -> J SOURCE-only preservation and test admission. No native/golden rewrite. */
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,readdirSync} from 'node:fs';import {createHash} from 'node:crypto';
import {innKSpec,innKBaseline,innKIfDeclared} from './helpers/inn-mount-k-baseline.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
for(const [n,e]of Object.entries(innKSpec.files))test('K exact J source and strict duplicate/drift rejection '+n,()=>{
 const raw=groveLIfDeclared(n,readFileSync(n,'utf8')),old=innKBaseline(n,raw);assert.equal(sha(old),e.sha256);assert.equal(innKIfDeclared(n,old),old);
 for(const h of e.hunks)for(const bad of[raw.replace(h.after,''),raw+h.after,raw+'\n// unrelated\n'])assert.throws(()=>innKBaseline(n,bad));
});
test('K original J inputs, native gates, routes, actor pixels and held prologue are pinned',()=>{
 const pin=JSON.parse(readFileSync('tests/baselines/vq04k-unchanged-inputs.json')),names=[...pin.rootFiles];
 function walk(d){for(const e of readdirSync(d,{withFileTypes:true})){if(e.name==='__pycache__'||e.name.endsWith('.pyc'))continue;assert(!e.isSymbolicLink());const n=d+'/'+e.name;if(e.isDirectory())walk(n);else if(e.isFile())names.push(n);}}
 for(const d of pin.roots)walk(d);const rows=names.sort().filter(n=>!pin.exclude.includes(n)&&!groveLIsNew(n)).map(n=>[n,sha(groveLFrozenBytes(n,readFileSync(n)))]);assert.equal(rows.length,pin.expectedCount);assert.equal(sha(JSON.stringify(rows)),pin.sha256);
 for(const n of['src/core.ts','src/render.ts','src/town-sign-occlusion.ts','scripts/town-route-evidence.mjs','tests/town_route_capture.py','src/prologue-render.ts'])assert(rows.some(([p])=>p===n),n);
});
test('K no source inverse accepts native reports, images, State or preserved routes',()=>{
 for(const n of['report.json','image.png','src/core.ts','src/render.ts','src/town-sign-occlusion.ts','scripts/town-route-evidence.mjs','__proto__','constructor'])assert.throws(()=>innKBaseline(n,'{}'));
});
test('K production build is real K; only explicitly frozen J component tests use the inverse',()=>{
 const b=groveLIfDeclared('scripts/build.mjs',readFileSync('scripts/build.mjs','utf8'));assert(b.includes("version:'0.9.84',batch:'VQ04K'"));assert(innKBaseline('scripts/build.mjs',b).includes("version:'0.9.83',batch:'VQ04J'"));assert(!b.includes('innKEntryPlugin'));
 const s=readFileSync('src/production-sightline-art.ts','utf8');assert(!/readPixels|putImageData|\.players|\.ticks|localStorage|sourceSha|process\.env|fetch\(/.test(s));
 const fixture=JSON.parse(readFileSync('tests/fixtures/ci107-inn-stops.json'));assert(fixture.offlineOnly);assert.equal(fixture.sourceSha,'2b5fbc384188eb18ed2d76d9da14e01d90aec08b');
 assert.deepEqual(fixture.stops.map(s=>s.name),['entry','resident','inn','exit']);const raw=readFileSync('src/prologue-render.ts');assert.equal(createHash('sha1').update(Buffer.concat([Buffer.from('blob '+raw.length+'\0'),raw])).digest('hex'),'2711a74185aacf3c6bddf9db85ba99a2afbc507a');
});
