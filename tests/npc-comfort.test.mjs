import {fairTrialIfDeclared} from './helpers/fair-trial-baseline.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {NullEngine,Scene,MeshBuilder,DynamicTexture,StandardMaterial,Texture} from '@babylonjs/core';
import {StoryNpcMotion} from '../.test/story-npc-motion.mjs';
import {drawStoryNpc} from '../.test/story-npc-art.mjs';
import {ambientFrame} from '../.test/actor-motion.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
import {World,createState} from '../.test/cpu-entry.mjs';
import {World as DWorld} from '../.test/npc-comfort-original.mjs';
import {npcComfortBaseline} from './helpers/npc-comfort-baseline.mjs';
function rig(){
 const e=new NullEngine();e.createCanvas=(w,h)=>cpuTestCanvas(w,h).canvas;const s=new Scene(e),motion=new StoryNpcMotion(s);
 const add=(name='npc',kind='resident')=>{const t=new DynamicTexture(name,{width:48,height:64},s,false,Texture.NEAREST_SAMPLINGMODE);drawStoryNpc(t.getContext(),kind,0);t.update();const m=new StandardMaterial(name,s);m.diffuseTexture=m.emissiveTexture=t;m.disableLighting=true;const mesh=MeshBuilder.CreatePlane(name,{width:1.32,height:1.8},s);mesh.material=m;return {mesh,t,bytes:()=>Buffer.from(t.getContext().getImageData(0,0,48,64).data)};};
 return {e,s,motion,add,close(){s.dispose();e.dispose();}};
}
for(const kind of ['resident','innkeeper','guard','king','queen','nun','chancellor'])test('unit '+kind+' returns retained frame0 under reduced motion and restores without catchup',()=>{
 const p=rig();try{const a=p.add('npc',kind);p.motion.add(a.mesh,kind);const zero=a.bytes(),count=p.s.textures.length;
  for(const tick of [90,180,189]){p.motion.draw(tick);const original=a.bytes(),before=p.motion.inspect().actors[0].uploads;assert.notDeepEqual(original,zero);
   p.motion.draw(tick,true);assert.deepEqual(a.bytes(),zero);assert.equal(p.motion.inspect().actors[0].frame,0);
   for(let n=0;n<8;n++)p.motion.draw(tick,true);assert.equal(p.motion.inspect().actors[0].uploads,before+1);
   p.motion.draw(tick,false);assert.deepEqual(a.bytes(),original);assert.equal(p.motion.inspect().actors[0].uploads,before+2);
  }
  assert.equal(p.s.textures.length,count);assert.deepEqual(a.mesh.position.asArray(),[0,0,0]);assert.deepEqual(a.mesh.scaling.asArray(),[1,1,1]);
 }finally{p.close();}
});
test('invisible, zero-visibility and disabled actors perform no texture work, then resume current phase',()=>{
 const p=rig();try{const a=p.add();p.motion.add(a.mesh,'resident');const zero=a.bytes();
  for(const hide of ['visible','zero','disabled']){a.mesh.isVisible=hide!=='visible';a.mesh.visibility=hide==='zero'?0:1;a.mesh.setEnabled(hide!=='disabled');p.motion.draw(180);assert.deepEqual(a.bytes(),zero);assert.equal(p.motion.inspect().actors.length,0);}
  a.mesh.isVisible=true;a.mesh.visibility=1;a.mesh.setEnabled(true);p.motion.draw(189);assert.equal(p.motion.inspect().actors[0].frame,3);assert.equal(p.motion.inspect().actors[0].uploads,1);
 }finally{p.close();}
});
test('disposal removes bindings immediately without shifting live stagger seeds',()=>{
 const p=rig();try{const a=p.add('a'),b=p.add('b','guard');p.motion.add(a.mesh,'resident');p.motion.add(b.mesh,'guard');a.mesh.dispose();assert.equal(p.motion.inspect().motion.bindingCount,1);
  for(let i=0;i<20;i++){const temp=p.add('temp'+i);p.motion.add(temp.mesh,'resident');temp.mesh.dispose();assert.equal(p.motion.inspect().motion.bindingCount,1);}
  p.motion.draw(140);assert.equal(p.motion.inspect().actors[0].seed,1);assert.equal(p.motion.inspect().actors[0].frame,ambientFrame(140,1));p.s.dispose();assert.equal(p.motion.inspect().motion.bindingCount,0);
 }finally{p.e.dispose();}
});
test('disposed/cross-scene actors and shared mutable textures are rejected',()=>{
 const p=rig(),q=rig();try{const a=p.add();p.motion.add(a.mesh,'resident');const b=p.add('other');b.mesh.material=a.mesh.material;assert.throws(()=>p.motion.add(b.mesh,'guard'),/private/);b.mesh.dispose();assert.throws(()=>p.motion.add(b.mesh,'guard'),/ownership/);const x=q.add();assert.throws(()=>p.motion.add(x.mesh,'resident'),/ownership/);}finally{p.close();q.close();}
});
for(const [tick,flag]of [[NaN,false],[Infinity,false],[-1,false],[.5,false],[true,false],[1,'true'],[1,null]])test('invalid NPC presentation input leaves observed state and pixels unchanged: '+String(tick)+'/'+String(flag),()=>{
 const p=rig();try{const a=p.add();p.motion.add(a.mesh,'resident');const before=p.motion.inspect(),bytes=a.bytes();assert.throws(()=>p.motion.draw(tick,flag),/Invalid/);assert.deepEqual(p.motion.inspect(),before);assert.deepEqual(a.bytes(),bytes);}finally{p.close();}
});
test('motion inspection does not expose writable presentation state',()=>{const p=rig();try{const a=p.add();p.motion.add(a.mesh,'resident');p.motion.draw(90,true);const expected=p.motion.inspect(),changed=p.motion.inspect();changed.motion.reducedMotion=false;changed.motion.bindingCount=999;changed.actors[0].seed=5;assert.deepEqual(p.motion.inspect(),expected);}finally{p.close();}});
test('World forwards its existing media preference to kingdom and rescue; normal mode is exact D pixels',()=>{
 const oldWindow=globalThis.window,oldDocument=globalThis.document,oldMatchMedia=globalThis.matchMedia;
 const preference={matches:false,addEventListener(){},removeEventListener(){}};
 const doc={createElement:t=>t==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.matchMedia=()=>preference;globalThis.document=doc;globalThis.window={devicePixelRatio:1,matchMedia:()=>preference,addEventListener(){},removeEventListener(){},navigator:{}};
 let a,b;try{const pa=cpuTestCanvas(192,128),pb=cpuTestCanvas(192,128);pa.canvas.ownerDocument=pb.canvas.ownerDocument=doc;a=new World(pa.canvas);b=new DWorld(pb.canvas);
  for(const chapter of ['truce','castle','cathedral','sanctum']){
   const s=createState(chapter);s.ticks=140;s.mode='explore';if(chapter==='cathedral')s.rescue.stage='entered';const before=structuredClone(s);
   preference.matches=false;a.draw(s,0,false);b.draw(structuredClone(s),0,false);assert.deepEqual(s,before);assert.deepEqual(pa.pixels(),pb.pixels(),chapter+' normal mode exact D');
   const owner=['truce','castle'].includes(chapter)?'kingdom':'rescue',normal=a.inspect().storyNpcs[owner],count=a.scene.textures.length;
   preference.matches=true;a.draw(s,0,false);const reduced=a.inspect().storyNpcs[owner];assert(reduced.motion.reducedMotion);assert(reduced.actors.length>0);assert(reduced.actors.every(n=>n.frame===0));
   for(let i=0;i<3;i++)a.draw(s,0,false);assert.deepEqual(a.inspect().storyNpcs[owner],reduced);assert.deepEqual(s,before);
   preference.matches=false;a.draw(s,0,false);assert.deepEqual(pa.pixels(),pb.pixels());assert.equal(a.scene.textures.length,count);assert.deepEqual(a.inspect().storyNpcs[owner].actors.map(n=>[n.name,n.seed,n.frame]),normal.actors.map(n=>[n.name,n.seed,n.frame]));
  }
 }finally{a?.engine.dispose();b?.engine.dispose();globalThis.window=oldWindow;globalThis.document=oldDocument;globalThis.matchMedia=oldMatchMedia;}
});
const spec=JSON.parse(readFileSync('tests/baselines/vq03e-declared-npc-comfort-edits.json'));
for(const [name,edits] of Object.entries(spec.files))test('strict E inverse matches exact D: '+name,()=>{
 const raw=fairTrialIfDeclared(name,readFileSync(name,'utf8')),restored=npcComfortBaseline(name,raw),hash=s=>createHash('sha256').update(s).digest('hex');assert.equal(hash(restored),spec.originalSha256[name]);
 assert(raw.includes(edits[0].after));assert.throws(()=>npcComfortBaseline(name,raw+edits[0].after));assert.throws(()=>npcComfortBaseline(name,raw.replace(edits[0].after,'')));assert.notEqual(hash(npcComfortBaseline(name,raw+'\n// external change')),spec.originalSha256[name]);
});
test('new gate is additive; original workflow inputs, budgets and retained art are untouched',()=>{
 const workflow=readFileSync('.github/workflows/ci.yml','utf8');assert(workflow.includes('run: node scripts/npc-comfort-evidence.mjs'));assert(workflow.includes('run: node scripts/cpu-adventure-evidence.mjs'));assert(workflow.includes('run: node scripts/cpu-era-evidence.mjs'));assert(workflow.includes('timeout-minutes: 45'));
 const runtime=readFileSync('src/story-npc-motion.ts','utf8');assert.doesNotMatch(runtime,/setTimeout|setInterval|Date\.now|Math\.random|\.position\s*\.|\.scaling\s*\./);
});
