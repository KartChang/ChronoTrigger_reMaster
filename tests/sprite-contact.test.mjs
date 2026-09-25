import {FieldEnemyMotion} from '../.test/field-enemy-motion.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {NullEngine,Scene,FreeCamera,Vector3,Mesh,MeshBuilder,TransformNode} from '@babylonjs/core/index.js';
import {World} from '../.test/render.mjs';
import {createState} from '../.test/core.mjs';
import {placeSpriteContact,inspectSpriteContacts} from '../.test/sprite-contact.mjs';
function setup(){
 const engine=new NullEngine(),scene=new Scene(engine),camera=new FreeCamera('camera',new Vector3(0,23,-26),scene);camera.setTarget(Vector3.Zero());scene.activeCamera=camera;
 const plane=name=>{const m=MeshBuilder.CreatePlane(name,{width:1.36,height:1.85},scene);m.billboardMode=Mesh.BILLBOARDMODE_ALL;return m;};
 const shadow=name=>{const m=MeshBuilder.CreateDisc(name,{radius:.43,tessellation:24},scene);m.rotation.x=Math.PI/2;return m;};
 return {engine,scene,camera,plane,shadow,dispose(){scene.dispose();engine.dispose();}};
}
const pointError=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
for(const scale of [1,.46,.5,.05,1.3])test(`texture-foot placement uses actual sprite scale ${scale} and keeps its contact shadow`,()=>{
 const k=setup();try{
  const mesh=k.plane('hero'),shadow=k.shadow('shadow'),foot={x:2.6,y:.14,z:-3.2};mesh.scaling.set(scale,scale,1);
  placeSpriteContact(mesh,shadow,foot,k.camera.getDirection(Vector3.Up()),1.85);
  const v=inspectSpriteContacts([{id:'p0',mesh,shadow,foot,pivotY:62,cellHeight:64}])[0];
  assert(v.footError<1e-5,JSON.stringify(v));assert(pointError(v.shadow,foot)<1e-5);assert(v.shadow.visible);
  assert.equal(mesh.scaling.y,scale);assert.equal(shadow.scaling.x,scale);
 }finally{k.dispose();}
});
test('contact can use a translated identity-scale root without relocating the gameplay anchor',()=>{
 const k=setup();try{
  const root=new TransformNode('witness-root',k.scene);root.position.set(4,0,-2);const mesh=k.plane('npc'),shadow=k.shadow('contact');mesh.parent=root;shadow.parent=root;
  const foot={x:-6.8,y:.14,z:-.4};const before={...foot};placeSpriteContact(mesh,shadow,foot,k.camera.getDirection(Vector3.Up()),1.85);
  const v=inspectSpriteContacts([{id:'npc',mesh,shadow,foot,pivotY:62,cellHeight:64}])[0];assert(v.footError<1e-5);assert(pointError(v.shadow,foot)<1e-5);assert.deepEqual(foot,before);
 }finally{k.dispose();}
});
test('contact inspection excludes inactive actors and returns copies rather than writable anchors',()=>{
 const k=setup();try{const mesh=k.plane('hero'),shadow=k.shadow('shadow'),foot={x:0,y:.14,z:0};placeSpriteContact(mesh,shadow,foot,k.camera.getDirection(Vector3.Up()),1.85);
  const c=[{id:'p0',mesh,shadow,foot,pivotY:62,cellHeight:64}],first=inspectSpriteContacts(c);first[0].foot.x=99;first[0].actualFoot.z=99;first[0].shadow.y=99;assert.equal(foot.x,0);assert(inspectSpriteContacts(c)[0].footError<1e-5);
  mesh.setEnabled(false);assert.deepEqual(inspectSpriteContacts(c),[]);
 }finally{k.dispose();}
});
const end=Symbol('after-production-grounding');
function drawContact(s,lunge={time:1,dx:0,dz:0}){
 const k=setup(),idle=()=>({pose:'idle',frame:0});
 const port={fieldEnemyMotion:new FieldEnemyMotion(),scene:k.scene,camera:k.camera,chapter:s.chapter,presentationState:s,era:s.era,flag:s.flags.repaired,time:0,
  prologueWorld:{draw(){}},fairWorld:{draw(){}},kingdomWorld:{draw(){}},rescueWorld:{draw(){}},trialWorld:{draw(){}},
  heroes:[{mesh:k.plane('player-0')},{mesh:k.plane('player-1')}],guest:{mesh:k.plane('guest')},actorShadows:[0,1,2].map(i=>k.shadow('shadow-'+i)),
  markers:[k.plane('marker0'),k.plane('marker1')],labels:[k.plane('label0'),k.plane('label1')],targetMarkers:[k.plane('target0'),k.plane('target1')],
  posePlayers:[{sample:idle},{sample:idle}],poseViews:[idle(),idle()],poseHistory:[],guestPose:{sample:idle},guestView:idle(),
  foes:[],rescueFoes:[],yakra:{mesh:k.plane('yakra')},lunges:[{...lunge},{time:1,dx:0,dz:0}],contacts:[],contactHistory:[],drawHero(){},
  frameEarlyScene(){throw end;},engine:k.engine,
  groundActors(state){return World.prototype.groundActors.call(this,state);}};
 const before=structuredClone(s);assert.throws(()=>World.prototype.draw.call(port,s,0,false),e=>e===end);assert.deepEqual(s,before);
 return {k,port};
}
test('production attack lunge carries the shadow with the visible foot, without moving logical actors',()=>{
 const s=createState('fair'),lunge={time:.21,dx:.6,dz:.4},{k,port}=drawContact(s,lunge);try{
  const p=s.players[0],foot={x:p.x+.6,y:.14,z:p.z+.4};
  const v=inspectSpriteContacts([{id:'p0',mesh:port.heroes[0].mesh,shadow:port.actorShadows[0],foot,pivotY:62,cellHeight:64}])[0];
  assert(v.footError<1e-5);assert(pointError(v.shadow,foot)<1e-5,JSON.stringify(v));
 }finally{k.dispose();}
});
test('production resonance scales the actual sprite around the foot rather than lifting it from ground',()=>{
 const s=createState('fair');s.opening.phase='resonance';s.opening.elapsed=1;
 const {k,port}=drawContact(s);try{const p=s.players[1],foot={x:p.x,y:.14,z:p.z};const mesh=port.heroes[1].mesh;
  assert.equal(mesh.scaling.y,.5);assert(mesh.isEnabled());const v=inspectSpriteContacts([{id:'p1',mesh,shadow:port.actorShadows[1],foot,pivotY:62,cellHeight:64}])[0];assert(v.footError<1e-5,JSON.stringify(v));
 }finally{k.dispose();}
});
for(const chapter of ['fair','overworld1000'])test(`production ${chapter} preserves stationary foot, expected scale and full state`,()=>{
 const s=createState(chapter),{k,port}=drawContact(s);try{const p=s.players[0],foot={x:p.x,y:.14,z:p.z};const v=inspectSpriteContacts([{id:'p0',mesh:port.heroes[0].mesh,shadow:port.actorShadows[0],foot,pivotY:62,cellHeight:64}])[0];assert(v.footError<1e-5);assert(pointError(v.shadow,foot)<1e-5);
 }finally{k.dispose();}
});
test('production waking preserves the bed pose with no upright contact shadow',()=>{
 const s=createState('bedroom'),{k,port}=drawContact(s);try{assert.deepEqual(port.heroes[0].mesh.position.asArray(),[3.6,1.35,1.6]);assert(!port.actorShadows[0].isEnabled());}finally{k.dispose();}
});
