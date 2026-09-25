import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
import {IMP_MOTION,impFrame,drawImpFrame} from '../.test/imp-motion.mjs';
import {drawImp} from '../.test/pixel-art.mjs';
import {World as LiveWorld,createState} from '../.test/cpu-entry.mjs';
import {World as PriorWorld} from '../.test/imp-m-prior-world.mjs';
import {surface,png} from '../scripts/asset-export.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
import {impMSpec,impMBaseline,impMIfDeclared} from './helpers/imp-m-baseline.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const texture=t=>Buffer.from(t.getContext().getImageData(0,0,24,32).data);
const World=process.env.CHRONO_M_PRECHANGE==='1'?PriorWorld:LiveWorld;
const frameBytes=f=>{const s=surface(24,32);drawImpFrame(s.ink,f);return s.rgba;};
const samples=[[0,0,[0,0,0,0]],[6,13,[55,125,144,255]],[8,15,[224,209,122,255]],[9,16,[41,43,56,255]],[6,29,[48,45,64,255]]];
function rig(w=192,h=128,Cls=World){
 const doc=globalThis.document,win=globalThis.window,mm=globalThis.matchMedia;
 const media={matches:false};const d={createElement:t=>t==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.document=d;globalThis.window={devicePixelRatio:1,addEventListener(){},removeEventListener(){},navigator:{}};globalThis.matchMedia=()=>media;
 const c=cpuTestCanvas(w,h);c.canvas.ownerDocument=d;const world=new Cls(c.canvas);
 return {world,c,media,close(){world.engine.dispose();globalThis.document=doc;globalThis.window=win;globalThis.matchMedia=mm;}};
}
const resources=w=>[w.scene.meshes.length,w.scene.materials.length,w.scene.textures.length];
const geo=w=>w.scene.meshes.map(m=>[m.name,m.position.asArray(),m.scaling.asArray(),m.rotation.asArray(),m.getTotalVertices(),m.getTotalIndices()]);
function battle(s){s.mode='battle';s.enemies=[{x:-1.8,z:2.4,hp:30,atb:.7,kind:'imp'},{x:1.8,z:3,hp:30,atb:0,kind:'imp'}];return s;}
for(const name of Object.keys(impMSpec.files))test('M exact original source and negative guards: '+name,()=>{
 const s=readFileSync(name,'utf8'),before=impMBaseline(name,s);assert.equal(hash(before),impMSpec.originalSha256[name]);assert.equal(impMIfDeclared(name,before),before);
 for(const e of impMSpec.files[name]){assert.throws(()=>impMBaseline(name,s+e.after));assert.throws(()=>impMBaseline(name,s.replace(e.after,'')));}
 assert.notEqual(hash(impMBaseline(name,s+'\n// unrelated drift\n')),impMSpec.originalSha256[name]);
});
test('M four unique poses keep exact rest image, original palette and every C sample',()=>{
 const base=surface(24,32);drawImp(base.ink);assert.equal(Buffer.compare(base.rgba,frameBytes(0)),0);
 const colors=new Set();for(let n=0;n<base.rgba.length;n+=4)colors.add(base.rgba.subarray(n,n+4).join(','));const hashes=new Set();
 for(let f=0;f<4;f++){const bytes=frameBytes(f);hashes.add(hash(bytes));assert.equal(Buffer.compare(bytes,frameBytes(f)),0);
  for(let n=0;n<bytes.length;n+=4)assert(colors.has(bytes.subarray(n,n+4).join(',')));
  for(const [x,y,v] of samples)assert.deepEqual([...bytes.subarray((y*24+x)*4,(y*24+x)*4+4)],v);
  // Everything outside the authored arm regions remains original, not a whole-image warp.
  for(let y=0;y<32;y++)for(let x=0;x<24;x++)if(!((x>=2&&x<=6&&y>=19&&y<=25)||(x>=18&&x<=21&&y>=19&&y<=25)))assert.equal(Buffer.compare(bytes.subarray((y*24+x)*4,(y*24+x+1)*4),base.rgba.subarray((y*24+x)*4,(y*24+x+1)*4)),0);
 }assert.equal(hashes.size,4);assert.equal(IMP_MOTION.approved,false);
});
test('M fixed-tick ambient and battle phases use no wall-clock/catchup',()=>{
 for(let i=0;i<3;i++)for(const t of [0,1,23,24,75,149,150,179,180,2**31]){
  assert.equal(impFrame(t,i,false,false),((t+i*37)%180>=150?1:0));
  assert.equal(impFrame(t,i,true,false),Math.floor((t+i*11)/24)%4===3?1:2);
  for(const hurt of [null,t,t-1])assert.equal(impFrame(t,i,true,true,hurt),0);
 }
 assert.equal(impFrame(50,0,true,false,50),3);assert.equal(impFrame(67,0,true,false,50),3);assert.notEqual(impFrame(68,0,true,false,50),3);assert.notEqual(impFrame(49,0,true,false,50),3);
});
test('M invalid ticks/slots/poses fail without changing the canvas',()=>{
 for(const t of [-1,NaN,Infinity,.2,Number.MAX_SAFE_INTEGER+1])assert.throws(()=>impFrame(t,0,false,false),RangeError);
 for(const i of [-1,3,.5,NaN])assert.throws(()=>impFrame(0,i,false,false),RangeError);
 const s=surface(24,32);drawImpFrame(s.ink,0);const h=hash(s.rgba);for(const f of [-1,4,NaN,.5]){assert.throws(()=>drawImpFrame(s.ink,f),RangeError);assert.equal(hash(s.rgba),h);}
});
for(const chapter of ['canyon','forest'])test('M current runtime actually changes only foe pose textures in '+chapter,()=>{
 const k=rig();try{const s=createState(chapter);s.ticks=0;k.world.draw(s,0,false);const before=geo(k.world),n=resources(k.world),a=k.world.foes.map(f=>texture(f.texture));s.ticks=155;const frozen=structuredClone(s);k.world.draw(s,0,false);
  assert.equal(Buffer.compare(a[0],texture(k.world.foes[0].texture))===0,false,'pose must change actual authored RGBA');const m=k.world.inspect().fieldEnemyMotion;assert(m,'new observation required');assert.equal(m.actors[0].frame,1);
  assert.deepEqual(geo(k.world),before);assert.deepEqual(resources(k.world),n);assert.deepEqual(s,frozen);
  for(const f of k.world.foes)for(const [x,y,v] of samples)assert.deepEqual([...f.texture.getContext().getImageData(x,y,1,1).data],v);
 }finally{k.close();}
});
for(const [w,h] of [[192,128],[96,160],[160,96]])test('M current CPU '+w+'x'+h+' pause/reduced roundtrip exact pixels and bounded uploads',()=>{
 const k=rig(w,h);try{const s=createState('canyon');s.ticks=155;k.world.draw(s,0,false);const frozen=structuredClone(s),pixels=Buffer.from(k.c.pixels()),m=k.world.inspect().fieldEnemyMotion,n=resources(k.world);
  for(let j=0;j<5;j++)k.world.draw(s,50,false);assert.deepEqual(k.world.inspect().fieldEnemyMotion,m);assert.equal(Buffer.compare(pixels,Buffer.from(k.c.pixels())),0);
  k.media.matches=true;k.world.draw(s,0,false);assert(k.world.inspect().fieldEnemyMotion.actors.every(a=>a.frame===0));k.media.matches=false;k.world.draw(s,0,false);
  assert.equal(Buffer.compare(pixels,Buffer.from(k.c.pixels())),0);assert.deepEqual(s,frozen);assert.deepEqual(resources(k.world),n);
  s.ticks=400;k.world.draw(s,0,false);for(const a of k.world.inspect().fieldEnemyMotion.actors)assert.equal(a.frame,impFrame(400,a.index,false,false));
 }finally{k.close();}
});
test('M ready and hurt use only existing delivered unambiguous incoming effects',()=>{
 const k=rig();try{const s=battle(createState('canyon'));s.ticks=10;k.world.draw(s,0,false);assert.equal(k.world.inspect().fieldEnemyMotion.actors[0].frame,2);
  const effect={kind:'hit',x:-1.8,z:2.4,text:'12',actor:0,origin:{x:0,z:0}};const before=structuredClone(s),copy=structuredClone(effect);k.world.draw(s,0,false,[effect]);assert.equal(k.world.inspect().fieldEnemyMotion.actors[0].frame,3);assert.equal(k.world.inspect().fieldEnemyMotion.actors[1].hurtTick,null);assert.deepEqual(s,before);assert.deepEqual(effect,copy);
  const uploads=k.world.inspect().fieldEnemyMotion.actors[0].uploads;k.world.draw(s,0,false,[effect]);assert.equal(k.world.inspect().fieldEnemyMotion.actors[0].uploads,uploads);
  s.ticks+=18;k.world.draw(s,0,false);assert.notEqual(k.world.inspect().fieldEnemyMotion.actors[0].frame,3);
  // Ordinary enemy hits do not identify a source foe, and healing is not a recoil.
  s.ticks=40;k.world.draw(s,0,false,[{kind:'hit',x:1.8,z:3,text:'9'},{kind:'heal',x:1.8,z:3,text:'5',actor:0}]);assert.equal(k.world.inspect().fieldEnemyMotion.actors[1].hurtTick,null);
  k.world.draw(s,0,false,[{kind:'hit',x:1.8,z:3,text:'7',guest:true}]);assert.equal(k.world.inspect().fieldEnemyMotion.actors[1].frame,3);
 }finally{k.close();}
});
test('M ambiguous targets/dead foes/overworld do not get invented hit poses',()=>{
 const k=rig();try{const s=battle(createState('canyon'));s.enemies[1].x=-1.8;s.enemies[1].z=2.4;k.world.draw(s,0,false,[{kind:'combo',x:-1.8,z:2.4,text:'20'}]);assert(k.world.inspect().fieldEnemyMotion.actors.every(a=>a.hurtTick===null));
  s.enemies[0].hp=0;s.enemies[1].hp=0;k.world.draw(s,0,false,[{kind:'hit',x:-1.8,z:2.4,text:'20',actor:0}]);assert.deepEqual(k.world.inspect().fieldEnemyMotion.actors,[]);
  const other=createState('fair');k.world.draw(other,0,false);assert.equal(k.world.inspect().fieldEnemyMotion.active,false);
 }finally{k.close();}
});
test('M rewind and state replacement clear recoil, preserved tick resumes current phase',()=>{
 const k=rig();try{const s=battle(createState('canyon'));s.ticks=100;k.world.draw(s,0,false,[{kind:'hit',x:-1.8,z:2.4,text:'4',actor:0}]);assert.equal(k.world.inspect().fieldEnemyMotion.actors[0].frame,3);
  s.ticks=90;k.world.draw(s,0,false);assert.equal(k.world.inspect().fieldEnemyMotion.actors[0].hurtTick,null);
  k.world.draw(s,0,false,[{kind:'combo',x:-1.8,z:2.4,text:'10'}]);assert.equal(k.world.inspect().fieldEnemyMotion.actors[0].frame,3);
  const copy=structuredClone(s);k.world.draw(copy,0,false);assert.equal(k.world.inspect().fieldEnemyMotion.actors[0].hurtTick,null);assert.equal(k.world.inspect().fieldEnemyMotion.actors[0].frame,impFrame(90,0,true,false));
 }finally{k.close();}
});
test('M invisible/disposed sprites do not upload and observations are detached',()=>{
 const k=rig();try{const s=createState('canyon');s.ticks=155;k.world.draw(s,0,false);const f=k.world.foes[0],controller=k.world.fieldEnemyMotion;let uploads=0;const update=f.texture.update.bind(f.texture);f.texture.update=(...a)=>{uploads++;return update(...a);};
  f.mesh.isVisible=false;s.ticks=200;controller.begin(s,false);controller.update(f,0);assert.equal(uploads,0);f.mesh.isVisible=true;f.mesh.visibility=0;controller.update(f,0);assert.equal(uploads,0);f.mesh.visibility=1;f.mesh.setEnabled(false);controller.update(f,0);assert.equal(uploads,0);
  f.mesh.setEnabled(true);controller.update(f,0);assert.equal(uploads,1);const m=controller.inspect();m.actors[0].samples[0].rgba[0]=200;m.actors[0].frame=3;assert.equal(controller.inspect().actors[0].frame,0);
  controller.dispose();controller.begin(s,false);controller.update(f,0);controller.receive(s,{kind:'combo',x:0,z:0,text:'1'});assert.equal(uploads,1);assert.deepEqual(controller.inspect().actors,[]);assert.equal(controller.inspect().disposed,true);
 }finally{k.close();}
});
test('M repeated field/lab cycles preserve exact prior lab pixels and bounded resources',()=>{
 const k=rig(),old=rig(192,128,PriorWorld);try{const lab=createState('lab'),oldLab=structuredClone(lab);k.world.draw(lab,0,false);old.world.draw(oldLab,0,false);let stable;
  for(let j=0;j<5;j++){for(const ch of ['canyon','forest']){const s=createState(ch);s.ticks=155;k.world.draw(s,0,false);old.world.draw(structuredClone(s),0,false);}k.world.draw(lab,0,false);old.world.draw(oldLab,0,false);assert.equal(Buffer.compare(Buffer.from(k.c.pixels()),Buffer.from(old.c.pixels())),0);if(stable)assert.deepEqual(resources(k.world),stable);stable=resources(k.world);}
 }finally{old.close();k.close();}
});
for(const chapter of ['canyon','forest'])test('M original native capture script executes new observations read-only on current World (offline)',()=>{
 const k=rig(320,240);try{const s=createState(chapter);s.ticks=155;k.world.draw(s,0,false);const before=structuredClone(s);
  k.c.canvas.toDataURL=()=>{const r=k.world.inspectRenderer();return 'data:image/png;base64,'+png({width:r.width,height:r.height,rgba:Buffer.from(k.c.pixels())}).toString('base64');};
  const script=readFileSync('tests/field_enemy_capture.py','utf8').split("SCRIPT = r'''")[1].split("'''",1)[0];const record=JSON.parse(JSON.stringify(runInNewContext('('+script+')()',{window:{__CHRONO_TEST__:{snapshot:()=>structuredClone(s),view:()=>k.world.inspect()}},document:{getElementById:()=>k.c.canvas}})));
  assert.equal(record.motion.profile,IMP_MOTION.id);assert.equal(record.motion.actors[0].frame,1);assert.deepEqual(s,before);mkdirSync('.test/imp-observer',{recursive:true});writeFileSync('.test/imp-observer/'+chapter+'.json',JSON.stringify(record));
 }finally{k.close();}
});
test('M forbidden core/palette/held changes remain outside the declared inverse',()=>{
 for(const n of ['src/core.ts','src/pixel-art.ts','src/field-enemy-palette.ts','src/prologue-render.ts','.github/workflows/ci.yml','src/canyon-render.ts'])assert.throws(()=>impMBaseline(n,'drift'));
 const b=readFileSync('src/prologue-render.ts');assert.equal(createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${b.length}\0`),b])).digest('hex'),'2711a74185aacf3c6bddf9db85ba99a2afbc507a');
});
test('M actual battle observer reads ready texture from declared offline battle fixture',()=>{
 const k=rig();try{const s=battle(createState('canyon'));s.ticks=10;k.world.draw(s,0,false);const frozen=structuredClone(s);
 const py=readFileSync('tests/field_enemy_motion.py','utf8'),script=py.split("BATTLE_SCRIPT = r'''")[1].split("'''",1)[0];
 const record=JSON.parse(JSON.stringify(runInNewContext('('+script+')()',{window:{__CHRONO_TEST__:{snapshot:()=>structuredClone(s),view:()=>k.world.inspect()}}})));
 assert.equal(record.motion.actors[0].frame,2);assert.deepEqual(s,frozen);mkdirSync('.test/imp-observer',{recursive:true});writeFileSync('.test/imp-observer/battle.json',JSON.stringify(record));
 }finally{k.close();}
});
test('M same-scene rebase never repaints hidden foes or duplicates original scene-entry uploads',()=>{
 const k=rig();try{const s=createState('canyon');s.ticks=155;k.world.draw(s,0,false);let uploads=0;
 for(const f of k.world.foes){const update=f.texture.update.bind(f.texture);f.texture.update=(...a)=>{uploads++;return update(...a);};}
 const hidden=structuredClone(s);hidden.mode='victory';k.world.draw(hidden,0,false);assert.equal(uploads,0);assert.deepEqual(k.world.inspect().fieldEnemyMotion.actors,[]);
 k.world.draw(structuredClone(s),0,false);assert.equal(uploads,0,'physical pose cache survives same-scene rebase without replay');assert.equal(k.world.inspect().fieldEnemyMotion.actors[0].frame,1);
 const fresh=createState('forest');fresh.ticks=0;k.world.draw(fresh,0,false);assert.equal(uploads,3,'only three existing original entry uploads, no additional frame0 repaint');
 }finally{k.close();}
});
