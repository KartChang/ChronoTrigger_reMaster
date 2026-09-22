import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {surface} from '../scripts/asset-export.mjs';
import {drawVillageSurface,drawVillageSign,VILLAGE_SURFACES,VILLAGE_ART} from '../.test/village-art.mjs';
import {villageBaseline} from './helpers/village-baseline.mjs';
import {villageFixture} from './helpers/village-fixture.mjs';
import {assertVillage} from '../scripts/village-evidence.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const expected=JSON.parse(readFileSync('tests/fixtures/village-pixels-unit.json'));
const samples=s=>[[0,0],[7,12],[23,41],[48,32],[62,62]].map(([x,y])=>({x,y,rgba:Array.from(s.rgba.subarray((y*64+x)*4,(y*64+x)*4+4))}));
for(const kind of VILLAGE_SURFACES)test(kind+' is opaque, repeatable authored pixels with non-flat material detail',()=>{
 const a=surface(64,64);drawVillageSurface(a.ink,kind);const first=a.rgba.slice();assert(a.rgba.filter((_,i)=>i%4===3).every(v=>v===255));assert(new Set(a.rgba.filter((_,i)=>i%4===0)).size>=4);assert.deepEqual(samples(a),expected.surfaces[kind]);
 a.ink.fillStyle='#ffffff';a.ink.fillRect(0,0,64,64);drawVillageSurface(a.ink,kind);assert.deepEqual(a.rgba,first);
});
test('inn sign uses deterministic binary-alpha bed and pixel letters, without fonts or network art',()=>{
 const a=surface(80,40);drawVillageSign(a.ink);const first=a.rgba.slice();drawVillageSign(a.ink);assert.deepEqual(a.rgba,first);const alpha=a.rgba.filter((_,i)=>i%4===3);assert(alpha.includes(0)&&alpha.includes(255));assert(alpha.every(n=>n===0||n===255));
 for(const {x,y,rgba} of expected.sign)assert.deepEqual(Array.from(a.rgba.subarray((y*80+x)*4,(y*80+x)*4+4)),rgba);
 assert.doesNotMatch(readFileSync('src/village-art.ts','utf8'),/fillText|\.font\s*=|Date\.now|Math\.random|fetch\(|setTimeout|from ['"].*(core|prologue)/);assert.equal(VILLAGE_ART.approved,false);assert.equal(VILLAGE_ART.romPixels,false);assert.throws(()=>drawVillageSurface(a.ink,'__proto__'));
});
const spec=JSON.parse(readFileSync('tests/baselines/vq02s-declared-village-edits.json'));
for(const [name,edits] of Object.entries(spec.files))test(name+' retains exact pre-S source after enumerated inverse, not relaxed hashes',()=>{
 const s=readFileSync(name,'utf8');assert.equal(sha(villageBaseline(name,s)),spec.originalSha256[name]);
 for(const e of edits){assert.throws(()=>villageBaseline(name,s.replace(e.after,'')));assert.throws(()=>villageBaseline(name,s+e.after));}assert.notEqual(sha(villageBaseline(name,s+'\n// unrelated change\n')),spec.originalSha256[name]);
});
test('actual surface verifier rejects missing textures, wrong use, filtered pixels and approval claims',()=>{
 assert(assertVillage(villageFixture('truce'),'truce'));assert(assertVillage(null,'forest'));assert.throws(()=>assertVillage(null,'truce'));
 for(const change of [v=>v.profile='old',v=>v.approved=true,v=>v.surfaces.pop(),v=>v.surfaces[0].meshes--,v=>v.surfaces[0].sampling=2,v=>v.surfaces[0].width=32,v=>v.surfaces[0].alpha=true,v=>v.surfaces[0].samples[0].rgba[0]++,v=>v.sign.samples[0].rgba[3]=255,v=>v.sign.name='replacement',v=>v.sign=null]){const v=villageFixture('truce');change(v);assert.throws(()=>assertVillage(v,'truce'));}
});
