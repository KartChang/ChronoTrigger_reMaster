import {pauseBaseline} from './helpers/pause-baseline.mjs';
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {World,createState} from '../.test/cpu-entry.mjs';
import {World as OriginalWorld} from '../.test/readability-baseline-cpu-entry.mjs';
import {drawVillagePlanter,PLANTER_SAMPLE_POINTS} from '../.test/village-planter-art.mjs';
import {surface} from '../scripts/asset-export.mjs';import {cpuTestCanvas} from './cpu-test-canvas.mjs';
import {readabilityBaseline} from './helpers/readability-baseline.mjs';
import {assertPlanters} from '../scripts/pause-access-evidence.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const spec=JSON.parse(readFileSync('tests/baselines/vq02t-declared-readability-edits.json'));
for(const [name,edits] of Object.entries(spec.files))test('T inverse retains original S bytes: '+name,()=>{
 const s=readFileSync(name,'utf8');assert.equal(sha(readabilityBaseline(name,s)),spec.originalSha256[name]);
 const originalT=['scripts/build.mjs','scripts/test.mjs'].includes(name)?pauseBaseline(name,s):s;
 for(const {after} of edits){assert.throws(()=>readabilityBaseline(name,originalT.replace(after,''),false));assert.throws(()=>readabilityBaseline(name,originalT+after,false));}
 assert.notEqual(sha(readabilityBaseline(name,s+'\n// undeclared change\n')),spec.originalSha256[name]);
});
test('held home and all game/input boundaries are outside T exemptions',()=>{
 for(const p of ['src/core.ts','src/main.ts','src/input.ts','src/input-boundary.ts','src/prologue-render.ts','src/kingdom-render.ts','src/village-art.ts'])assert.throws(()=>readabilityBaseline(p,'change'));
});
test('authored planter pixels are deterministic, opaque and sampled without fonts or external resources',()=>{
 const a=surface(64,64);drawVillagePlanter(a.ink);const first=a.rgba.slice();drawVillagePlanter(a.ink);assert.deepEqual(a.rgba,first);
 assert(a.rgba.filter((_,i)=>i%4===3).every(n=>n===255));assert(new Set(a.rgba.filter((_,i)=>i%4===0)).size>=10);
 const expected=JSON.parse(readFileSync('tests/fixtures/planter-pixels-unit.json'));assert.deepEqual(PLANTER_SAMPLE_POINTS.map(([x,y])=>({x,y,rgba:[...a.rgba.subarray((y*64+x)*4,(y*64+x)*4+4)]})),expected.samples);
 assert.doesNotMatch(readFileSync('src/village-planter-art.ts','utf8'),/fillText|\.font\s*=|Math\.random|Date\.now|fetch\(|from ['"].*(core|prologue)/);
});
const shape=w=>w.scene.meshes.filter(m=>m.isEnabled()).map(m=>({name:m.name,position:m.position.asArray(),scaling:m.scaling.asArray(),rotation:m.rotation.asArray(),vertices:m.getTotalVertices(),indices:m.getTotalIndices(),billboard:m.billboardMode,receiveShadows:m.receiveShadows}));
test('T only paints five existing planters: exact S geometry, six building materials, sign and other maps stay unchanged',()=>{
 const ow=globalThis.window,od=globalThis.document;const doc={createElement:tag=>tag==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.document=doc;globalThis.window={devicePixelRatio:1,addEventListener(){},removeEventListener(){},navigator:{}};
 const a=cpuTestCanvas(192,128),b=cpuTestCanvas(192,128);a.canvas.ownerDocument=b.canvas.ownerDocument=doc;const cur=new World(a.canvas),old=new OriginalWorld(b.canvas);
 try{
  for(const chapter of ['truce','forest','castle','chamber','fair','bedroom','downstairs','overworld','cathedral','future']){
   const s=createState(chapter),before=structuredClone(s);cur.draw(s,0,false);old.draw(structuredClone(s),0,false);
   assert.deepEqual(s,before);assert.deepEqual(shape(cur),shape(old),chapter);
   const v=cur.inspect().storyNpcs.kingdom.village,o=old.inspect().storyNpcs.kingdom.village;
   if(chapter==='truce'){
    assertPlanters(v.planters);const {planters,...buildings}=v;assert.deepEqual(buildings,o);
    assert.notDeepEqual(a.pixels(),b.pixels());assert.equal(cur.scene.textures.length-old.scene.textures.length,1);
    const copy=structuredClone(planters);planters.samples[0].rgba[0]=999;assert.deepEqual(cur.inspect().storyNpcs.kingdom.village.planters,copy);
   }else{assert.equal(v,null);assert.deepEqual(a.pixels(),b.pixels(),chapter);}
   assert.equal(cur.inspectRenderer().cpu.unsupportedResources,0);
   assert(cur.inspectRenderer().cpu.textureMemory.bytes<=33554432&&cur.inspectRenderer().cpu.textureMemory.entries<=512);
  }
  const meshes=cur.scene.meshes.length,textures=cur.scene.textures.length;
  for(let i=0;i<6;i++)for(const chapter of ['truce','forest','castle']){
   const s=createState(chapter);cur.draw(s,0,false);const first=a.pixels().slice();cur.draw(s,0,false);assert.deepEqual(a.pixels(),first);assert.equal(cur.scene.meshes.length,meshes);assert.equal(cur.scene.textures.length,textures);
  }
 }finally{cur.engine.dispose();old.engine.dispose();globalThis.window=ow;globalThis.document=od;}
});
test('pause markup retains every original control and text; only scoped layout changes',()=>{
 const html=readFileSync('index.html','utf8'),old=readabilityBaseline('index.html',html),part=s=>s.slice(s.indexOf('<div id="pause-screen"'),s.indexOf('<div id="result"'));
 const ids=s=>[...part(s).matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);for(const id of ids(old))assert.equal(ids(html).filter(s=>s===id).length,1);
 for(const text of ['相容解析度','CPU 遠景紋理平滑','像素人物維持清晰','只調整繪圖解析度，不改操作、戰鬥速度或人物大小。'])assert(part(html).includes(text));
 // The legacy HUD styles every header as absolute and pointer-events:none.
 assert.doesNotMatch(part(html),/<header\b/);assert(part(html).includes('<div class="pause-heading">'));
 const css=readFileSync('src/render-status.css','utf8');assert(css.includes('min-height:44px'));assert(css.includes('#cpu-sampling-control[hidden]{display:none}'));assert.doesNotMatch(css.slice(css.indexOf('/* VQ02T')),/#world|\.dialog\s*\{/);
});
