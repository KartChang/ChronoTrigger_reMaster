import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,readdirSync} from 'node:fs';import {createHash} from 'node:crypto';
import {artBSpec,artBBaseline,artBIfDeclared} from './helpers/production-art-b-baseline.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
for(const [name,e]of Object.entries(artBSpec.files))test('B declared source '+name+' has exact prior bytes and rejects dropped/duplicate/unrelated content',()=>{
 const current=readFileSync(name,'utf8'),old=artBBaseline(name,current);assert.equal(sha(old),e.sha256);assert.equal(artBIfDeclared(name,old),old);
 for(const bad of [current.slice(1),current+current,current+'\n// unrelated\n'])assert.throws(()=>artBBaseline(name,bad));
});
test('B does not transform actual native sources, reports, frame cells or gameplay',()=>{
 for(const n of ['src/core.ts','src/prologue-render.ts','src/render.ts','tests/trial_browser.py','tests/fixtures/party-combat-frames.json','native.json','screenshot.png'])assert.throws(()=>artBBaseline(n,'{}'));
});
test('B unchanged program map retains every original native input, golden cell, gameplay and held asset hash',()=>{
 const pin=JSON.parse(readFileSync('tests/baselines/vq04b-unchanged-inputs.json')),names=[...pin.rootFiles];
 function walk(d){for(const e of readdirSync(d,{withFileTypes:true})){if(e.name==='__pycache__'||e.name.endsWith('.pyc'))continue;const n=d+'/'+e.name;assert(!e.isSymbolicLink());if(e.isDirectory())walk(n);else if(e.isFile())names.push(n);}}for(const r of pin.roots)walk(r);
 const rows=names.sort().filter(n=>!pin.exclude.includes(n)).map(n=>[n,sha(readFileSync(n))]);assert.equal(rows.length,pin.expectedCount);assert.equal(sha(JSON.stringify(rows)),pin.sha256);
 for(const name of ['tests/trial_browser.py','tests/party_combat.py','tests/party_reaction.py','tests/fixtures/party-combat-frames.json','tests/fixtures/party-reaction-frames.json','src/core.ts','src/render.ts','src/prologue-render.ts','.github/workflows/ci.yml'])assert(rows.some(([n])=>n===name),name);
});
test('new source uses only actual app, no native mode or route relaxation',()=>{
 const entry=readFileSync('src/art-directed-world.ts','utf8'),pass=readFileSync('src/production-actor-finish.ts','utf8');assert(entry.includes('super.draw(state,dt,animate,frameEffects)'));assert(entry.includes('this.actorFinish.begin(state.chapter)'));
 assert(!/setTimeout|setInterval|requestAnimationFrame|location|navigator|fetch\(|localStorage/.test(pass));assert(pass.includes("const enabledChapter='courtroom'"));assert.equal(pass.includes('sourceSha'),false);
 const build=readFileSync('scripts/build.mjs','utf8');assert(build.includes("version:'0.9.75',batch:'VQ04B'"));assert(build.includes("await exportProductionActors('dist/art/production-vq04b');"));
});
