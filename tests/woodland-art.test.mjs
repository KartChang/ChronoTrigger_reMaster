import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {surface,png} from '../scripts/asset-export.mjs';
import {drawWoodlandGround,drawWoodlandOak,drawWoodlandFern,woodlandPath,WOODLAND_ART} from '../.test/woodland-art.mjs';
import {drawSurface,noise,surfaceWorld} from '../.test/world-art.mjs';
import {woodlandBaseline} from './helpers/woodland-baseline.mjs';
import {assertWoodland} from '../scripts/woodland-evidence.mjs';
import {woodlandFixture} from './helpers/woodland-fixture.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
for(const kind of ['forest','truce'])test(kind+' ground is deterministic, opaque and not a enlarged or recolored old texture',()=>{
 const a=surface(384,352),b=surface(384,352);drawWoodlandGround(a.ink,384,352,kind);drawWoodlandGround(b.ink,384,352,kind);
 assert.deepEqual(a.rgba,b.rgba);assert(a.rgba.filter((_,i)=>i%4===3).every(v=>v===255));assert(new Set(a.rgba.filter((_,i)=>i%4===0)).size>4);
 b.ink.fillStyle='#ffffff';b.ink.fillRect(0,0,384,352);drawWoodlandGround(b.ink,384,352,kind);assert.deepEqual(a.rgba,b.rgba);
 assert.throws(()=>drawWoodlandGround(a.ink,385,352,kind));
});
test('forest quiet color masses reduce adjacent high-frequency changes against the actual Q surface generator',()=>{
 const old=surface(384,352),next=surface(384,352);drawSurface(old.ink,384,352,'forest');drawWoodlandGround(next.ink,384,352,'forest');
 const edges=s=>{let n=0;for(let y=0;y<s.height;y++)for(let x=1;x<s.width;x++){const i=(y*s.width+x)*4;n+=Math.abs(s.rgba[i]-s.rgba[i-4])+Math.abs(s.rgba[i+1]-s.rgba[i-3])+Math.abs(s.rgba[i+2]-s.rgba[i-2]);}return n;};
 assert(edges(next)<edges(old)*.4);assert.notDeepEqual(next.rgba,old.rgba);
});
test('every forest and Truce route predicate retains its pre-R mask; no new painted shortcut',()=>{
 for(let y=0;y<352;y+=2)for(let x=0;x<384;x+=2){
  const p=surfaceWorld(x,y,384,352,'forest'),centre=Math.sin(p.z*.43)*.5+Math.sin(p.z*1.7)*.16;
  assert.equal(woodlandPath(x,y,384,352,'forest'),Math.abs(p.x-centre)<.75+noise(Math.floor(y/9),3)*.42||(p.z>-.5&&p.z<1.25&&p.x<1));
  assert.equal(woodlandPath(x,y,384,352,'truce'),(x>=162&&x<222)||(x>=75&&x<213&&y>=93&&y<119)||(x>=80&&x<328&&y>=253&&y<287));
 }
});
for(const [name,width,height,draw] of [['oak',64,80,drawWoodlandOak],['fern',24,32,drawWoodlandFern]])test(name+' cutout has authored connected clusters, binary nearest alpha and stable contact',()=>{
 const a=surface(width,height);draw(a.ink);const first=png(a);draw(a.ink);assert.deepEqual(png(a),first);
 const alpha=a.rgba.filter((_,i)=>i%4===3);assert(alpha.includes(0)&&alpha.includes(255));assert(alpha.every(v=>v===0||v===255));
 assert(a.rgba.subarray((height-1)*width*4).every(v=>v===0));
 if(name==='oak'){assert(a.rgba[(76*width+32)*4+3]===255);assert(a.rgba.subarray(77*width*4).every(v=>v===0));}
});
test('outdoor art never imports the game, uses a timer, downloads art or touches held home art',()=>{
 assert.equal(WOODLAND_ART.approved,false);assert.equal(WOODLAND_ART.romPixels,false);
 assert.throws(()=>drawWoodlandGround(surface(384,352).ink,384,352,'__proto__'));
 assert.doesNotMatch(readFileSync('src/woodland-art.ts','utf8'),/from ['"].*(core|prologue)|Date\.now|Math\.random|setTimeout|fetch\(/);
 const b=readFileSync('src/prologue-render.ts');assert.equal(createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex'),'2711a74185aacf3c6bddf9db85ba99a2afbc507a');
});
const spec=JSON.parse(readFileSync('tests/baselines/vq02r-declared-woodland-edits.json','utf8'));
for(const [name,edits] of Object.entries(spec.files))test(name+': exact CI59 inverse, with all missing/duplicate/outside mutations rejected',()=>{
 const source=readFileSync(name,'utf8');assert.equal(sha(woodlandBaseline(name,source)),spec.originalSha256[name]);
 for(const e of edits){assert.throws(()=>woodlandBaseline(name,source.replace(e.after,'')));assert.throws(()=>woodlandBaseline(name,source+e.after));}
 assert.notEqual(sha(woodlandBaseline(name,source+'\n// changed\n')),spec.originalSha256[name]);
});
test('new pixel expectations describe unit authoring, not a physical or native approval',()=>{
 for(const chapter of ['fair','castle','chamber','canyon','cathedral','bedroom','truce','forest'])assert(assertWoodland(woodlandFixture(chapter),chapter));
 for(const mutate of [v=>v.profile='old',v=>v.approved=true,v=>v.ground.width=383,v=>v.ground.samples[0].rgba[0]++,v=>v.trees.pop(),v=>v.trees[0].alpha=false,v=>v.trees[0].sampling=2,v=>v.trees[0].samples[0].rgba[3]=255,v=>v.trees[0].position[0]=NaN]){
  const v=woodlandFixture('forest');mutate(v);assert.throws(()=>assertWoodland(v,'forest'));
 }
 assert.throws(()=>assertWoodland(woodlandFixture('forest'),'fair'));assert.throws(()=>assertWoodland(null,'truce'));
});
