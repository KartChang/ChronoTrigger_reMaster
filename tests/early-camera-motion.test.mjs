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
