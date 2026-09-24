import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NullEngine,Scene,FreeCamera,Camera,Vector3,Matrix} from '@babylonjs/core/index.js';
import {EarlyCameraMotion,constrainCameraResponse} from '../.test/camera-motion.mjs';
import {frameEarlyActors,SCREEN_UP} from '../.test/early-comfort.mjs';
const actor=(id,x,z)=>({id,x,z,halfWidth:.8,height:1.88,groundY:.14});
const desired=(points=[actor('p0',0,0)],base={x:0,z:0,half:9},r=1.5,battle=false)=>frameEarlyActors('fair',r,base,points,battle);
const safe=f=>{for(const a of f.actors)for(const [key,relation] of [['left',1],['right',-1],['top',1],['bottom',-1]])assert.ok(relation*(a[key]-f.bounds[key])>=-1e-9,JSON.stringify(f));};
const near=(a,b)=>{for(const k of ['x','z','half'])assert.ok(Math.abs(a[k]-b[k])<1e-9,`${k}: ${a[k]} vs ${b[k]}`);};
test('camera response pans/contracts without overshoot; no mutation of target extents',()=>{
 const m=new EarlyCameraMotion(),a=desired(),b=desired(undefined,{x:2,z:1,half:7}),original=structuredClone(b);
 m.update(0,'fair/explore',a);const f=m.update(1,'fair/explore',b);assert.ok(f.x>0&&f.x<b.x);assert.ok(f.half>b.half&&f.half<a.half);safe(f);assert.deepEqual(b,original);
 let previous=f;for(let t=2;t<120;t++){const next=m.update(t,'fair/explore',b);assert.ok(next.x>=previous.x&&next.x<=b.x);assert.ok(next.half<=previous.half);safe(next);previous=next;}
});
test('camera response gives the same physical result at 30/60/144Hz for a fixed target and same ticks',()=>{
 const a=desired(),b=desired(undefined,{x:2,z:1,half:7});
 const simulate=hz=>{const m=new EarlyCameraMotion();m.update(0,'fair',a);let f;for(let i=1;i<=hz;i++)f=m.update(Math.floor(i*60/hz),'fair',b);return f;};
 near(simulate(30),simulate(60));near(simulate(144),simulate(60));
});
test('rendering repeatedly at a paused tick cannot move or zoom the camera',()=>{
 const m=new EarlyCameraMotion();m.update(0,'fair',desired());const target=desired(undefined,{x:2,z:1,half:7}),f=m.update(3,'fair',target);
 for(let i=0;i<100;i++)assert.deepEqual(m.update(3,'fair',target),f);
});
test('separated players and living foes expand framing immediately instead of waiting for animation',()=>{
 const m=new EarlyCameraMotion();m.update(0,'fair/battle',desired());
 const target=desired([actor('p0',-11,-7),actor('p1',11,8),{...actor('enemy0',0,9),height:2.4}],{x:0,z:0,half:7},.46,true);
 const f=m.update(1,'fair/battle',target);assert.ok(f.half>=target.half);safe(f);assert.equal(f.actors.length,3);
});
for(const kind of ['chapter','mode','resize','clock-reset','explicit-reset','reduce-on','reduce-off'])test(`${kind} never interpolates from stale camera context`,()=>{
 const m=new EarlyCameraMotion(),old=desired();m.update(100,'fair/explore',old,kind==='reduce-off');
 const target=desired([actor('p0',3,2)],{x:1,z:2,half:7},kind==='resize'?.46:1.5);
 if(kind==='explicit-reset')m.reset();
 const tick=kind==='clock-reset'?0:101,context=kind==='chapter'?'home/explore':kind==='mode'?'fair/battle':'fair/explore';
 near(m.update(tick,context,target,kind==='reduce-on'),target);
});
test('system reduced-motion preference uses direct safe framing, without altering the target or game state',()=>{
 const m=new EarlyCameraMotion();for(let t=0;t<40;t++){const f=desired([actor('p0',t*.1,0)],{x:t*.1,z:0,half:9-t*.03});assert.deepEqual(m.update(t,'fair',f,true),f);}
 assert.equal(m.inspect().reducedMotion,true);assert.equal(m.inspect().approved,false);
});
for(const chapter of ['overworld1000','courtroom','castle','waking'])test(`${chapter} remains outside the early camera easing policy`,()=>{
 const m=new EarlyCameraMotion();m.update(0,'fair',desired());const f=frameEarlyActors(chapter,.46,{x:3,z:2,half:20},[actor('p0',9,9)]);
 assert.deepEqual(m.update(1,chapter,f),f);
});
for(const tick of [NaN,Infinity,-1])test(`invalid simulation tick ${tick} fails rather than retaining corrupt camera state`,()=>{const m=new EarlyCameraMotion();assert.throws(()=>m.update(tick,'fair',desired()));assert.equal(m.inspect().tick,null);});
for(const r of [1.5,650/900,390/844])test(`moving actors remain inside actual Babylon-projected camera safe area at aspect ${r}`,()=>{
 const engine=new NullEngine({renderWidth:1200,renderHeight:800}),scene=new Scene(engine),camera=new FreeCamera('camera',Vector3.Zero(),scene);camera.mode=Camera.ORTHOGRAPHIC_CAMERA;const m=new EarlyCameraMotion();
 try{for(let t=0;t<=90;t++){
  const points=[actor('p0',Math.sin(t/23)*7,Math.cos(t/29)*5),actor('p1',Math.sin(t/23)*7+1.2,Math.cos(t/29)*5-1.1)];
  const target=desired(points,{x:points[0].x*.72,z:points[0].z*.72+1,half:8},r),f=m.update(t,'fair/explore',target);safe(f);
  camera.position.set(f.x,23,f.z-26);camera.setTarget(new Vector3(f.x,0,f.z));camera.orthoLeft=-f.half*r;camera.orthoRight=f.half*r;camera.orthoTop=f.half;camera.orthoBottom=-f.half;
  const transform=camera.getViewMatrix(true).multiply(camera.getProjectionMatrix(true));
  for(const a of points)for(const x of [-a.halfWidth,a.halfWidth])for(const h of [0,a.height]){
   const p=Vector3.Project(new Vector3(a.x+x,a.groundY+SCREEN_UP.y*h,a.z+SCREEN_UP.z*h),Matrix.Identity(),transform,{x:0,y:0,width:1,height:1});
   assert.ok(p.x>=f.bounds.left-.001&&p.x<=f.bounds.right+.001&&p.y>=f.bounds.top-.001&&p.y<=f.bounds.bottom+.001,JSON.stringify({f,p}));
  }
 }}finally{scene.dispose();engine.dispose();}
});
test('returned camera frames are independent; external inspection cannot alter filter state',()=>{const m=new EarlyCameraMotion(),t=desired();const f=m.update(0,'fair',t);f.x=900;f.actors[0].left=900;f.bounds.left=900;assert.deepEqual(m.update(0,'fair',t),t);});
test('runtime consumes safe camera filter and OS preference; tests do not change gameplay framing',()=>{const s=readFileSync(new URL('../src/render.ts',import.meta.url),'utf8');assert.match(s,/this.cameraMotion.update\(s.ticks/);assert.match(s,/prefers-reduced-motion: reduce/);assert.match(s,/motion:this.cameraMotion.inspect\(\)/);assert.doesNotMatch(s,/test.*reducedMotion/);});

// CI77 regression: a paused preference roundtrip must restore the actual eased
// camera, not merely a numerically close target. PNG gates remain exact.
test('same-tick preference roundtrip restores an unfinished eased camera exactly',()=>{
 const m=new EarlyCameraMotion();m.update(0,'fair',desired());const target=desired(undefined,{x:2,z:1,half:7});
 const before=m.update(3,'fair',target);assert.notDeepEqual(before,target);
 for(let cycle=0;cycle<12;cycle++){
  assert.deepEqual(m.update(3,'fair',target,true),target);
  for(let i=0;i<4;i++)assert.deepEqual(m.update(3,'fair',target,true),target);
  assert.deepEqual(m.update(3,'fair',target,false),before);
  for(let i=0;i<4;i++)assert.deepEqual(m.update(3,'fair',target,false),before);
 }
 safe(before);
});
for(const change of ['tick','backward-clock','context','ratio','base','actor','bounds','inactive','reset','temporary-target'])test('frozen camera cache cannot cross '+change,()=>{
 const m=new EarlyCameraMotion();m.update(0,'fair',desired());const target=desired(undefined,{x:2,z:1,half:7});
 m.update(3,'fair',target);m.update(3,'fair',target,true);
 const next=structuredClone(target);let tick=3,context='fair';
 if(change==='tick')tick=4;
 if(change==='backward-clock')tick=2;
 if(change==='context')context='home';
 if(change==='ratio')next.ratio=.6;
 if(change==='base')next.x+=.1;
 if(change==='actor')next.actors[0].id='p1';
 if(change==='bounds')next.bounds.left+=.01;
 if(change==='inactive')next.active=false;
 if(change==='reset')m.reset();
 if(change==='temporary-target')m.update(3,'fair',{...next,x:next.x+.1},true);
 assert.deepEqual(m.update(tick,context,next,false),next);
});
test('roundtrip snapshots are detached; paused restore does not consume normal easing time',()=>{
 const m=new EarlyCameraMotion(),control=new EarlyCameraMotion(),a=desired(),b=desired(undefined,{x:2,z:1,half:7});
 m.update(0,'fair',a);control.update(0,'fair',a);const expected=control.update(3,'fair',b);
 const returned=m.update(3,'fair',b);returned.x=999;returned.bounds.left=999;returned.actors[0].id='mutated';
 const reduced=m.update(3,'fair',b,true);reduced.x=888;reduced.actors[0].left=888;
 assert.deepEqual(m.update(3,'fair',b,false),expected);
 assert.deepEqual(m.update(4,'fair',b,false),control.update(4,'fair',b));
});
test('CI77 recorded released checkpoints: CPU pixels restore exactly after paused preference switch',async()=>{
 const {World}=await import('../.test/cpu-entry.mjs');const {cpuTestCanvas}=await import('./cpu-test-canvas.mjs');
 const fixture=JSON.parse(readFileSync(new URL('./fixtures/ci77-camera-restoration.json',import.meta.url)));
 const old={window:globalThis.window,document:globalThis.document,matchMedia:globalThis.matchMedia};
 const media={matches:false,addEventListener(){},removeEventListener(){}};
 const doc={createElement:t=>t==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.matchMedia=()=>media;globalThis.document=doc;globalThis.window={devicePixelRatio:1,matchMedia:()=>media,addEventListener(){},removeEventListener(){},navigator:{}};let world;
 try{
  const c=cpuTestCanvas(960,640);c.canvas.ownerDocument=doc;world=new World(c.canvas);const state=structuredClone(fixture.frozen);
  for(const point of fixture.released){Object.assign(state,structuredClone(point));world.draw(state,0,false);}
  Object.assign(state,structuredClone(fixture.frozen));world.draw(state,0,false);world.draw(state,0,false);
  const before=Buffer.from(c.pixels()),camera=world.inspect().earlyComfort.camera,sceneCounts=[world.scene.meshes.length,world.scene.textures.length,world.scene.materials.length];
  assert.notEqual(camera.x,.84,'fixture must still contain an eased offset');
  for(let cycle=0;cycle<3;cycle++){
   media.matches=true;world.draw(state,0,false);world.draw(state,0,false);
   media.matches=false;world.draw(state,0,false);world.draw(state,0,false);
   assert.deepEqual(world.inspect().earlyComfort.camera,camera);
   assert.deepEqual(Buffer.from(c.pixels()),before,'unit CPU canvas must be byte-identical');
   assert.deepEqual(state,fixture.frozen);assert.deepEqual([world.scene.meshes.length,world.scene.textures.length,world.scene.materials.length],sceneCounts);
  }
 }finally{world?.engine.dispose();Object.assign(globalThis,old);}
});

test('camera repair inverse preserves the original pin and rejects missing/duplicate/unrelated edits',async()=>{
 const {frozenCameraBaseline}=await import('./helpers/frozen-camera-baseline.mjs');
 const {createHash}=await import('node:crypto');const spec=JSON.parse(readFileSync('tests/baselines/ci77-camera-restoration-edits.json'));
 const source=readFileSync('src/camera-motion.ts','utf8');
 assert.equal(createHash('sha256').update(frozenCameraBaseline(source)).digest('hex'),'204c37b179202f7672aaecc144cdf8ca2524ba307489ac7c5573957bd372ac44');
 for(const edit of spec.edits){assert.throws(()=>frozenCameraBaseline(source.replace(edit.after,'')),/hunk/);assert.throws(()=>frozenCameraBaseline(source+edit.after),/hunk/);}
 assert.throws(()=>frozenCameraBaseline(source+'\n// unrelated'),/Unrelated/);
});
