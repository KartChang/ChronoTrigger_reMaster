import {signOcclusionIfDeclared} from './helpers/sign-occlusion-baseline.mjs';
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {frameTownActors,townPortrait,TOWN_CAMERA} from '../.test/town-camera.mjs';
import {EarlyCameraMotion} from '../.test/camera-motion.mjs';
import {World,createState} from '../.test/cpu-entry.mjs';
import {World as WWorld} from '../.test/town-camera-baseline-cpu-entry.mjs';
import {townCameraBaseline} from './helpers/town-camera-baseline.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
import {assertTownDetails} from '../scripts/village-detail-evidence.mjs';
const spec=JSON.parse(readFileSync('tests/baselines/vq02x-declared-town-camera-edits.json'));
const hash=s=>createHash('sha256').update(s).digest('hex');
for(const [path,edits] of Object.entries(spec.files))test('X exact W inverse preserves old pins: '+path,()=>{
 const source=signOcclusionIfDeclared(path,readFileSync(path,'utf8'));assert.equal(hash(townCameraBaseline(path,source,false)),spec.originalSha256[path]);
 assert.throws(()=>townCameraBaseline(path,source+edits.at(-1).after,false));
 assert.throws(()=>townCameraBaseline(path,source.replace(edits.at(-1).after,''),false));
 assert.notEqual(hash(townCameraBaseline(path,source+'\n// unrelated mutation\n',false)),spec.originalSha256[path]);
});
const base={x:0,z:5.6,half:18},actor=(id,x,z=4)=>({id,x,z,height:1.85,groundY:.14,halfWidth:.68});
const safe=f=>{assert(f.active);for(const a of f.actors){assert(a.left>=f.bounds.left-1e-8);assert(a.right<=f.bounds.right+1e-8);assert(a.top>=f.bounds.top-1e-8);assert(a.bottom<=f.bounds.bottom+1e-8);}};
for(const chapter of ['bedroom','home','fair','overworld1000','forest','castle','chamber','cathedral','future'])test('X not a new camera policy for '+chapter,()=>{
 const f=frameTownActors(chapter,.46,base,[actor('p0',0)]);assert.deepEqual({x:f.x,z:f.z,half:f.half},base);assert.equal(f.active,false);assert.equal(f.portrait,false);assert.deepEqual(f.actors,[]);
});
test('X finite threshold, invalid/missing human and landscape never activate',()=>{
 for(const ratio of [NaN,Infinity,0,-1,.85,1,2])assert.equal(townPortrait('truce',ratio),false);
 for(const actors of [[],[actor('guest',0)],[{...actor('p0',0),height:NaN}]])assert.equal(frameTownActors('truce',.46,base,actors).active,false);
 assert.equal(TOWN_CAMERA.approved,false);
});
test('X actual subject extents are framed without input mutation or a party-cropping zoom ceiling',()=>{
 const actors=[actor('p0',-9,-5),actor('p1',9,6),actor('guest',0,1)],before=structuredClone(actors);
 const f=frameTownActors('truce',.46,base,actors);safe(f);assert(f.half>base.half);assert.deepEqual(actors,before);
 assert.equal(f.actors.length,3);assert.equal(frameTownActors('truce',.46,base,[actor('p0',0)]).half,7.2);
});
test('X reuses safe fixed-tick response: pause, separation, contraction, resize, reset and reduced motion',()=>{
 const m=new EarlyCameraMotion(),f=frameTownActors('truce',.46,base,[actor('p0',0)]),moved=frameTownActors('truce',.46,base,[actor('p0',1)]);
 const a=m.update(10,'truce',f);assert.deepEqual(m.update(10,'truce',f),a);
 const b=m.update(11,'truce',moved);safe(b);assert(b.x>a.x&&b.x<moved.x);
 const far=frameTownActors('truce',.46,base,[actor('p0',-9),actor('p1',9)]);safe(m.update(12,'truce',far));
 const close=m.update(13,'truce',f);safe(close);assert(close.half>f.half);
 assert.deepEqual(m.update(13,'truce',moved,true),moved);
 assert.deepEqual(m.update(0,'truce',f),f);
 const resized=frameTownActors('truce',.5,base,[actor('p0',0)]);assert.deepEqual(m.update(0,'truce',resized),resized);
});
function pair(width,height,dpr=1){
 const ow=globalThis.window,od=globalThis.document;
 const doc={createElement:tag=>tag==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.document=doc;globalThis.window={devicePixelRatio:dpr,addEventListener(){},removeEventListener(){},navigator:{}};
 const a=cpuTestCanvas(width,height),b=cpuTestCanvas(width,height);a.canvas.ownerDocument=b.canvas.ownerDocument=doc;
 const current=new World(a.canvas),previous=new WWorld(b.canvas);
 return {a,b,current,previous,close(){current.engine.dispose();previous.engine.dispose();globalThis.window=ow;globalThis.document=od;}};
}
const geometry=m=>({name:m.name,position:m.position.asArray(),scaling:m.scaling.asArray(),rotation:m.rotation.asArray(),vertices:m.getTotalVertices(),indices:m.getTotalIndices(),billboard:m.billboardMode,enabled:m.isEnabled(),material:m.material?.name});
const arrival=()=>{const s=createState('truce');s.joined=false;s.players.forEach(p=>{p.x=0;p.z=6.4;});return s;};
for(const dpr of [1,2])test(`X offline CPU projection across tiers/modes DPR${dpr}; not native/device evidence`,()=>{
 const k=pair(390,844,dpr),s=arrival(),before=structuredClone(s);try{
  const inspect=()=>{
   k.current.draw(s,0,false);k.previous.draw(structuredClone(s),0,false);
   const c=k.current.inspect().earlyComfort,old=k.previous.inspect().earlyComfort,r=k.current.inspectRenderer(),vr=k.current.inspect().storyNpcs.kingdom.village;
   safe(c.camera);assert(c.camera.half<old.camera.half*.60);assert.equal(c.townProfile,TOWN_CAMERA.id);
   assertTownDetails(vr.details,r);const p=c.rects.find(a=>a.id==='p0');assert((p.bottom-p.top)*r.height>=30);
   for(const rect of c.rects){assert(rect.left>=.045-1e-5&&rect.right<=.955+1e-5&&rect.top>=.12-1e-5&&rect.bottom<=.8+1e-5);}
   assert.deepEqual(k.current.scene.meshes.map(geometry),k.previous.scene.meshes.map(geometry));assert.deepEqual(s,before);
   assert.equal(k.current.scene.textures.length,k.previous.scene.textures.length);
   assert.deepEqual({width:r.width,height:r.height,level:r.level,mode:r.mode},{width:k.previous.inspectRenderer().width,height:k.previous.inspectRenderer().height,level:k.previous.inspectRenderer().level,mode:k.previous.inspectRenderer().mode});
   const projection=vr.details.sign.projection,inn=c.rects.find(a=>a.id==='inn-sign');assert(Math.abs(inn.left*r.width-projection.rect.x)<.002);
   const again=k.a.pixels().slice();k.current.draw(s,0,false);assert.deepEqual(again,k.a.pixels());const repeated=k.current.inspect().earlyComfort.camera;// Projection arithmetic may differ by a few machine ULPs; actual canvas bytes and game state remain exact.
   for(const key of ['x','z','half','ratio'])assert(Math.abs(c.camera[key]-repeated[key])<=16*Number.EPSILON*Math.max(1,Math.abs(c.camera[key])));
   console.log(JSON.stringify({kind:'offline-X-camera-not-native',dpr,renderer:{width:r.width,height:r.height,mode:r.mode,level:r.level},half:c.camera.half,oldHalf:old.camera.half,playerHeight:(p.bottom-p.top)*r.height,sign:projection.rect}));
  };
  inspect();for(let level=1;level<=3;level++){for(let i=0;i<120;i++){k.current.observeRenderFrame(80,true);k.previous.observeRenderFrame(80,true);}inspect();}
  for(const mode of ['quality','compatibility','auto']){k.current.setRenderMode(mode);k.previous.setRenderMode(mode);inspect();}
 }finally{k.close();}
});
test('X portrait safety follows both real visible meshes; far inn exits subject list; no extra textures on return',()=>{
 const k=pair(195,422),s=arrival();try{
  s.joined=true;for(const [x,z,x2,z2] of [[-6,-5,7,5],[0,6.4,1,6.4],[7,8,8,9]]){
   Object.assign(s.players[0],{x,z});Object.assign(s.players[1],{x:x2,z:z2});const original=structuredClone(s);s.ticks+=10;original.ticks=s.ticks;k.current.draw(s,0,false);
   const c=k.current.inspect().earlyComfort;safe(c.camera);assert(c.rects.some(a=>a.id==='p0'));assert(c.rects.some(a=>a.id==='p1'));assert.deepEqual(s,original);
  }
  assert(!k.current.inspect().earlyComfort.rects.some(a=>a.id==='inn-sign'));
  // First visit material construction is expected; only subsequent return cycles must be stable.
  for(const chapter of ['forest','truce','castle'])k.current.draw(createState(chapter),0,false);
  const n=k.current.scene.textures.length,m=k.current.scene.meshes.length;
  for(let i=0;i<6;i++)for(const chapter of ['forest','truce','castle']){const t=createState(chapter);k.current.draw(t,0,false);assert.equal(k.current.scene.textures.length,n);assert.equal(k.current.scene.meshes.length,m);}
 }finally{k.close();}
});
test('X preserves nine other chapters pixel for pixel and Truce landscape exactly',()=>{
 const k=pair(180,120);try{
  for(const chapter of ['truce','forest','castle','chamber','fair','bedroom','downstairs','overworld','cathedral','future']){
   const s=createState(chapter),before=structuredClone(s);k.current.draw(s,0,false);k.previous.draw(structuredClone(s),0,false);
   assert.deepEqual(s,before);assert.deepEqual(k.a.pixels(),k.b.pixels());assert.deepEqual(k.current.scene.meshes.map(geometry),k.previous.scene.meshes.map(geometry));
  }
 }finally{k.close();}
});
test('X resize round trip is repeatable while simulation state stays frozen',()=>{
 const k=pair(960,640),s=arrival();try{
  const before=structuredClone(s);k.current.draw(s,0,false);const original=k.current.inspect().earlyComfort.camera;
  for(const [width,height] of [[390,844],[844,390],[960,640]]){
   k.a.canvas.clientWidth=width;k.a.canvas.clientHeight=height;k.current.resize();k.current.draw(s,0,false);assert.deepEqual(s,before);
   const c=k.current.inspect().earlyComfort;assert.equal(c.townProfile,width<height?TOWN_CAMERA.id:null);
  }
  assert.deepEqual(k.current.inspect().earlyComfort.camera,original);
 }finally{k.close();}
});
test('X cannot exempt gameplay, held scenery, original quality, or assets from their hashes',()=>{
 for(const path of ['src/main.ts','src/core.ts','src/input.ts','src/prologue-render.ts','src/village-detail-art.ts','src/village-detail.ts','src/cpu-engine.ts','src/render-capability.ts','.github/workflows/ci.yml'])assert.throws(()=>townCameraBaseline(path,'modified'));
 const bytes=readFileSync('src/prologue-render.ts');assert.equal(createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`),bytes])).digest('hex'),'2711a74185aacf3c6bddf9db85ba99a2afbc507a');
});
test('X portrait extension leaves the nine other maps and held home pixels unchanged',()=>{
 const k=pair(156,338);try{
  for(const chapter of ['forest','castle','chamber','fair','bedroom','downstairs','overworld','cathedral','future']){
   const s=createState(chapter),before=structuredClone(s);k.current.draw(s,0,false);k.previous.draw(structuredClone(s),0,false);
   assert.deepEqual(s,before);assert.deepEqual(k.a.pixels(),k.b.pixels());assert.deepEqual(k.current.scene.meshes.map(geometry),k.previous.scene.meshes.map(geometry));
   assert.equal(k.current.inspect().earlyComfort.townProfile,null);
  }
 }finally{k.close();}
});
