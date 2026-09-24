import {TownLandmark} from '../.test/town-landmark.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NullEngine,Scene,FreeCamera,Vector3,Camera,MeshBuilder,Mesh} from '@babylonjs/core/index.js';
import {World} from '../.test/render.mjs';
import {createState,step,IDLE} from '../.test/core.mjs';
import {EarlyCameraMotion} from '../.test/camera-motion.mjs';
import {frameEarlyActors,SCREEN_UP} from '../.test/early-comfort.mjs';
import {cameraHalf} from '../.test/art-profile.mjs';
import {observeCameraSubjects,projectCameraSubjects} from '../.test/early-camera-view.mjs';
function setup(){
 const engine=new NullEngine({renderWidth:1200,renderHeight:800}),scene=new Scene(engine),camera=new FreeCamera('camera',new Vector3(0,23,-26),scene);
 camera.mode=Camera.ORTHOGRAPHIC_CAMERA;camera.setTarget(Vector3.Zero());scene.activeCamera=camera;
 const make=(name,x,z,w=1.36,h=1.85)=>{const mesh=MeshBuilder.CreatePlane(name,{width:w,height:h},scene);mesh.billboardMode=Mesh.BILLBOARDMODE_ALL;mesh.position.set(x,.14+SCREEN_UP.y*h*(62/64-.5),z+SCREEN_UP.z*h*(62/64-.5));return mesh;};
 const port={scene,camera,cameraMotion:new EarlyCameraMotion(),townLandmark:new TownLandmark(),cameraState:null,comfortFrame:null,cameraSubjects:[],reducedMotion:{matches:false},heroes:[{mesh:make('player-0',1.5,1.8)},{mesh:make('player-1',2.4,1.8)}],guest:{mesh:make('guest',0,0)}};
 const apply=(s,r=390/844,base={x:0,z:0,half:cameraHalf(s.chapter,r)})=>{World.prototype.frameEarlyScene.call(port,s,r,base);return port.comfortFrame;};
 return {engine,scene,camera,make,port,apply,dispose(){scene.dispose();engine.dispose();}};
}
const safe=(p)=>{const f=p.comfortFrame;for(const r of projectCameraSubjects(p.cameraSubjects,p.camera))for(const [k,sign] of [['left',1],['right',-1],['top',1],['bottom',-1]])assert.ok(sign*(r[k]-f.bounds[k])>=-.002,JSON.stringify({r,f}));};
for(const chapter of ['bedroom','home','fair'])test(`production ${chapter} camera frames actual planes in portrait without editing game/mesh data`,()=>{
 const k=setup();try{
  const s=createState(chapter);if(chapter!=='fair')for(let i=0;i<160;i++)step(s,IDLE,1/60);
  const before=structuredClone(s),positions=k.port.heroes.map(x=>x.mesh.position.asArray()),f=k.apply(s);safe(k.port);
  assert(f.portrait);assert(f.half<cameraHalf(chapter,390/844)*.7);assert.deepEqual(s,before);assert.deepEqual(k.port.heroes.map(x=>x.mesh.position.asArray()),positions);
 }finally{k.dispose();}
});
test('actual sprite scale, lunge and changed pivot contribute to observed extents',()=>{
 const k=setup();try{const mesh=k.port.heroes[0].mesh;mesh.scaling.set(1.2,1.5,1);mesh.position.x+=.6;const before=mesh.position.asArray();
  const subjects=[{id:'p0',mesh}],actors=observeCameraSubjects(subjects);assert.equal(actors.length,1);assert(actors[0].halfWidth>.8);assert(actors[0].height>2.7);
  const f=frameEarlyActors('fair',.46,{x:0,z:0,half:7.2},actors);k.camera.position.set(f.x,23,f.z-26);k.camera.setTarget(new Vector3(f.x,0,f.z));
  k.camera.orthoLeft=-f.half*.46;k.camera.orthoRight=f.half*.46;k.camera.orthoTop=f.half;k.camera.orthoBottom=-f.half;k.port.comfortFrame=f;k.port.cameraSubjects=subjects;safe(k.port);assert.deepEqual(mesh.position.asArray(),before);
 }finally{k.dispose();}
});
test('nearby existing conversation partners are included, hidden and distant subjects are not revealed',()=>{
 const k=setup();try{const s=createState('fair');k.make('prologue-meeting-marle',s.players[0].x+.5,s.players[0].z+.5);const far=k.make('lucca-handdrawn',100,100);k.make('prologue-meeting-pendant',0,0).setEnabled(false);
  const before=structuredClone(s);k.apply(s);const ids=k.port.cameraSubjects.map(x=>x.id);assert(ids.includes('prologue-meeting-marle'));assert(!ids.includes('lucca-handdrawn'));assert(!ids.includes('prologue-meeting-pendant'));assert(far.isEnabled());safe(k.port);assert.deepEqual(s,before);
 }finally{k.dispose();}
});
test('real Gato plane, both human sprites and reserved battle HUD region are framed together',()=>{
 const k=setup();try{const s=createState('fair');s.mode='battle';s.enemies=[{x:-7,z:4.8,hp:150}];k.make('gato-handdrawn',-7,4.8,2.8,2.8);k.port.heroes[0].mesh.position.x=-10;k.port.heroes[1].mesh.position.x=7;
  const before=structuredClone(s),f=k.apply(s);assert.equal(f.bounds.bottom,.64);assert.deepEqual(k.port.cameraSubjects.map(x=>x.id),['p0','p1','gato']);safe(k.port);assert.deepEqual(s,before);
 }finally{k.dispose();}
});
test('same-map state replacement snaps from old camera rather than carrying interpolation across load',()=>{
 const k=setup();try{const s=createState('fair');k.apply(s);s.ticks=10;k.port.heroes[0].mesh.position.x+=3;k.apply(s);
  const next=structuredClone(s),f=k.apply(next),target=frameEarlyActors('fair',390/844,{x:0,z:0,half:cameraHalf('fair',390/844)},observeCameraSubjects(k.port.cameraSubjects));
  assert.deepEqual(f,target);assert.equal(k.port.cameraState,next);assert.equal(k.port.cameraMotion.inspect().reason,'context-or-viewport');
 }finally{k.dispose();}
});
test('paused rendered frames and OS reduced-motion change do not advance simulation or replay old camera travel',()=>{
 const k=setup();try{const s=createState('fair');k.apply(s);s.ticks=1;k.port.heroes[0].mesh.position.x+=2;const f=k.apply(s),before=structuredClone(s);
  for(let i=0;i<20;i++){const n=k.apply(s);for(const key of ['x','z','half'])assert(Math.abs(n[key]-f[key])<1e-9);}
  k.port.reducedMotion.matches=true;const reduced=k.apply(s);assert.equal(k.port.cameraMotion.inspect().reason,'reduced-motion');safe(k.port);assert.deepEqual(s,before);assert(reduced.half>0);
 }finally{k.dispose();}
});
for(const chapter of ['overworld1000','courtroom','canyon'])test(`${chapter} retains the existing base camera policy`,()=>{
 const k=setup();try{const s=createState(chapter),base={x:2,z:3,half:19},f=k.apply(s,.46,base);assert(!f.active);assert.equal(f.half,19);assert.equal(f.x,2);assert.equal(f.z,3);assert.equal(k.port.cameraSubjects.length,0);}finally{k.dispose();}
});
test('waking shot is preserved until its genuine story transition',()=>{
 const k=setup();try{const s=createState('bedroom'),f=k.apply(s);assert.equal(s.prologue.stage,'waking');assert(!f.active);assert.equal(f.half,cameraHalf('bedroom',390/844));}finally{k.dispose();}
});
test('missing, hidden, zero-scale and invalid mesh observations are excluded without changing visibility',()=>{
 const k=setup();try{const hidden=k.make('hidden',0,0);hidden.isVisible=false;const zero=k.make('zero',0,0);zero.scaling.x=0;const disabled=k.make('disabled',0,0);disabled.setEnabled(false);
  assert.deepEqual(observeCameraSubjects([{id:'hidden',mesh:hidden},{id:'zero',mesh:zero},{id:'disabled',mesh:disabled}]),[]);assert(!hidden.isVisible);assert(!disabled.isEnabled());
 }finally{k.dispose();}
});
test('independent camera keeps the accepted source renderer and paused effect contract',()=>{
 const r=readFileSync('src/render.ts','utf8');assert.match(r,/frameEarlyScene\(s,ratio/);assert.match(r,/cameraState!==s/);assert.doesNotMatch(r,/s\.effects\.(shift|splice|pop|push)\(/);
 assert.doesNotMatch(r,/EarlyOcclusion|home-interior|festival-kit/);
});

test('production camera inspection cannot alter camera/filter/subject geometry',()=>{
 const k=setup();try{const s=createState('fair');k.apply(s);const before=structuredClone(k.port.comfortFrame);
  const v=World.prototype.inspectEarlyCamera.call(k.port);v.camera.x=900;v.camera.bounds.left=900;v.camera.actors[0].left=900;v.rects[0].left=900;v.motion.reason='forged';
  assert.deepEqual(k.port.comfortFrame,before);const after=World.prototype.inspectEarlyCamera.call(k.port);assert.notEqual(after.motion.reason,'forged');assert(after.rects[0].left<1);safe(k.port);
 }finally{k.dispose();}
});

// These are existing visible NPC planes, never newly created game characters.
test('nearby grounded merchant joins the early framing without moving him or exposing distant witnesses',()=>{
 const k=setup();try{const s=createState('fair'),p=s.players[0];const merchant=k.make('fair-melchior',p.x+.5,p.z),owner=k.make('fair-cat-owner',100,100),before=merchant.position.asArray();k.apply(s);
 assert(k.port.cameraSubjects.some(x=>x.id==='fair-melchior'));assert(!k.port.cameraSubjects.some(x=>x.id==='fair-cat-owner'));assert.deepEqual(merchant.position.asArray(),before);assert(owner.isEnabled());safe(k.port);
 }finally{k.dispose();}
});
