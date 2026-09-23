import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {NullEngine,Scene,TransformNode,MeshBuilder,DynamicTexture,StandardMaterial} from '@babylonjs/core';
import {World,createState} from '../.test/sign-baseline-cpu-entry.mjs';
import {World as OriginalWorld} from '../.test/detail-baseline-cpu-entry.mjs';
import {VillageDetail} from '../.test/sign-baseline-village-detail.mjs';
import {DETAIL_KINDS,DETAIL_SIZES,DETAIL_SAMPLE_POINTS,drawTownDetail,TOWN_DETAIL_ART} from '../.test/sign-baseline-village-detail-art.mjs';
import {surface} from '../scripts/asset-export.mjs';import {cpuTestCanvas} from './cpu-test-canvas.mjs';
import {signIfDeclared} from './helpers/sign-baseline.mjs';
import {detailBaseline} from './helpers/detail-baseline.mjs';import {townDetailFixture as currentUnitFixture} from './helpers/village-detail-fixture.mjs';
// Only this in-memory V schema fixture retains V's declared scale. No native record is edited.
const townDetailFixture=(...args)=>{const v=currentUnitFixture(...args);v.sign.scaling=[1.6,1.6,1];return v;};
import {assertTownDetails} from '../.test/sign-baseline-village-detail-evidence.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const expected=JSON.parse(readFileSync('tests/fixtures/village-detail-pixels-unit.json'));
for(const kind of DETAIL_KINDS)test('V '+kind+' is deterministic original opaque pixel art',()=>{
 const size=DETAIL_SIZES[kind],a=surface(size,size);drawTownDetail(a.ink,kind);const before=a.rgba.slice();drawTownDetail(a.ink,kind);
 assert.deepEqual(a.rgba,before);assert(a.rgba.filter((_,i)=>i%4===3).every(x=>x===255));assert(new Set(a.rgba.filter((_,i)=>i%4===0)).size>=8);
 assert.deepEqual(DETAIL_SAMPLE_POINTS.map(([x,y])=>({x,y,rgba:[...a.rgba.subarray((y*size+x)*4,(y*size+x)*4+4)]})),expected.windows[kind]);
 assert.doesNotMatch(readFileSync('src/village-detail-art.ts','utf8'),/fillText|\.font\s*=|Math\.random|Date\.now|fetch\(|from ['"].*(core|prologue)/);
 assert.equal(TOWN_DETAIL_ART.approved,false);assert.equal(TOWN_DETAIL_ART.romPixels,false);assert.throws(()=>drawTownDetail(a.ink,'__proto__'));
});
const spec=JSON.parse(readFileSync('tests/baselines/vq02v-declared-town-detail-edits.json'));
for(const [name,edits] of Object.entries(spec.files))test('V exact U inverse and negative mutations: '+name,()=>{
 const s=signIfDeclared(name,readFileSync(name,'utf8'));assert.equal(sha(detailBaseline(name,s,false)),spec.originalSha256[name]);
 // For overlapping edits, mutation is applied at its reverse stage, not to an
 // already superseded earlier token. Every declared delta remains single-use.
 let stage=s;for(const {before,after} of [...edits].reverse()){
  assert.equal(stage.split(after).length,2);assert.notEqual(stage.replace(after,'').split(after).length,2);assert.notEqual((stage+after).split(after).length,2);
  stage=stage.replace(after,before);
 }
 assert.equal(sha(stage),spec.originalSha256[name]);assert.throws(()=>detailBaseline(name,s+'\n'+edits.at(-1).after,false));
 assert.throws(()=>detailBaseline(name,s.replace(edits.at(-1).after,''),false));
 assert.notEqual(sha(detailBaseline(name,s+'\n// unrelated change\n',false)),spec.originalSha256[name]);
});
test('V does not exempt held home, game rules, scene topology, input, old material pixels or budgets',()=>{
 for(const p of ['src/prologue-render.ts','src/core.ts','src/main.ts','src/kingdom-render.ts','src/input.ts','src/input-boundary.ts','src/village-art.ts','src/village-planter-art.ts','src/cpu-raster.ts','src/cpu-engine.ts','src/render.ts','src/art-profile.ts','.github/workflows/ci.yml'])assert.throws(()=>detailBaseline(p,'change'));
});
test('V actual detail schema has two owners and one readable original sign',()=>assert(assertTownDetails(townDetailFixture(),{width:312,height:675})));
for(const [name,change] of Object.entries({missing:v=>delete v.windows,approved:v=>v.approved=true,wrongOwner:v=>v.owner='bedroom',duplicate:v=>v.windows[1]=structuredClone(v.windows[0]),missingPane:v=>v.windows[1].meshes=7,extraFrame:v=>v.windows[0].meshes=17,linear:v=>v.windows[0].sampling=2,alpha:v=>v.windows[1].alpha=true,wrongSize:v=>v.windows[1].width=64,pixel:v=>v.windows[0].samples[0].rgba[0]++,tiny:v=>v.sign.projection.rect.width=39,moved:v=>v.sign.position[0]++,scale:v=>v.sign.scaling[0]=1,replaceTexture:v=>v.sign.texture='new-sign',replaceMesh:v=>v.sign.name='new-sign',geometry:v=>v.sign.vertices=8,noProjection:v=>v.sign.projection=null,claimOnly:v=>v.sign.projection.inside=false,wrongCanvas:v=>v.sign.projection.viewport.width=311,nan:v=>v.sign.projection.rect.x=NaN,clipped:v=>v.sign.projection.rect.x=310,flattened:v=>v.sign.projection.rect.height=20,forgedSource:v=>v.sign.projection.source='fixture'}))test('V detail gate rejects '+name,()=>{const v=townDetailFixture();change(v);assert.throws(()=>assertTownDetails(v,{width:312,height:675}));});
function ports(){
 const ow=globalThis.window,od=globalThis.document;
 const doc={createElement:tag=>tag==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.document=doc;globalThis.window={devicePixelRatio:1,addEventListener(){},removeEventListener(){},navigator:{}};
 return {doc,close(){globalThis.window=ow;globalThis.document=od;}};
}
function worldPair(width=192,height=128){
 const p=ports(),a=cpuTestCanvas(width,height),b=cpuTestCanvas(width,height);a.canvas.ownerDocument=b.canvas.ownerDocument=p.doc;
 const current=new World(a.canvas),original=new OriginalWorld(b.canvas);
 return {a,b,current,original,close(){current.engine.dispose();original.engine.dispose();p.close();}};
}
const shape=w=>w.scene.meshes.filter(m=>m.isEnabled()).map(m=>({name:m.name,position:m.position.asArray(),scaling:m.scaling.asArray(),rotation:m.rotation.asArray(),vertices:m.getTotalVertices(),indices:m.getTotalIndices(),billboard:m.billboardMode,receiveShadows:m.receiveShadows}));
test('V changes only original sign scale and 24 existing window materials across ten chapters, never state or collision',()=>{
 const k=worldPair();try{
  for(const chapter of ['truce','forest','castle','chamber','fair','bedroom','downstairs','overworld','cathedral','future']){
   const s=createState(chapter),before=structuredClone(s);k.current.draw(s,0,false);k.original.draw(structuredClone(s),0,false);assert.deepEqual(s,before);
   const actual=shape(k.current),old=shape(k.original);
   if(chapter==='truce'){
    const sign=actual.find(m=>m.name==='inn-sign');assert.deepEqual(sign.scaling,[1.6,1.6,1]);sign.scaling=[1,1,1];
    const v=k.current.inspect().storyNpcs.kingdom.village,u=k.original.inspect().storyNpcs.kingdom.village;
    const {details,...oldFinish}=v;assert.deepEqual(oldFinish,u);assert.deepEqual(details.windows.map(w=>w.meshes),[16,8]);assert.notDeepEqual(k.a.pixels(),k.b.pixels());
    assert.equal(k.current.scene.textures.length-k.original.scene.textures.length,2);
    // Compare every active material property/texture byte outside the declared windows.
    const materials=w=>w.scene.meshes.filter(m=>m.isEnabled()&&!['truce-window','truce-glass','truce-mullion'].includes(m.name)).map(m=>{
     const mat=m.material,t=mat?.diffuseTexture;return {name:m.name,color:mat?.diffuseColor?.asArray(),alpha:mat?.alpha,emissive:mat?.emissiveColor?.asArray(),texture:t?{name:t.name,size:t.getSize(),alpha:t.hasAlpha,sampling:t.samplingMode,pixels:t.getContext?sha(t.getContext().getImageData(0,0,t.getSize().width,t.getSize().height).data):null}:null};
    });assert.deepEqual(materials(k.current),materials(k.original));
    const copy=structuredClone(details);details.windows[0].samples[0].rgba[0]=999;details.sign.scaling[0]=9;assert.deepEqual(k.current.inspect().storyNpcs.kingdom.village.details,copy);
   }else{assert.equal(k.current.inspect().storyNpcs.kingdom.village,null);assert.deepEqual(k.a.pixels(),k.b.pixels(),chapter+' pixels');}
   assert.deepEqual(actual,old,chapter+' exact geometry except declared sign scale');const c=k.current.inspectRenderer().cpu;assert.equal(c.unsupportedResources,0);assert(c.textureMemory.bytes<=33554432&&c.textureMemory.entries<=512);
  }
  const meshes=k.current.scene.meshes.length,textures=k.current.scene.textures.length;
  for(let i=0;i<6;i++)for(const chapter of ['truce','forest','castle']){
   const s=createState(chapter);k.current.draw(s,0,false);const first=k.a.pixels().slice();k.current.draw(s,0,false);assert.deepEqual(k.a.pixels(),first);assert.equal(k.current.scene.meshes.length,meshes);assert.equal(k.current.scene.textures.length,textures);
  }
 }finally{k.close();}
});
for(const [width,height] of [[960,640],[390,844],[844,390]])test(`V offline projection ${width}x${height} is 1.6 times U; native acceptance remains CI-only`,()=>{
 const k=worldPair(width,height);try{
  const s=createState('truce'),before=structuredClone(s);k.current.draw(s,0,false);k.original.draw(structuredClone(s),0,false);
  assert.deepEqual(s,before);const v=k.current.inspect().storyNpcs.kingdom.village;assertTownDetails(v.details,k.current.inspectRenderer());
  assert.equal(k.a.canvas.width,k.b.canvas.width);assert.equal(k.a.canvas.height,k.b.canvas.height);
  const sign=k.current.scene.getMeshByName('inn-sign'),old=k.original.scene.getMeshByName('inn-sign');assert(sign&&old);
  assert.equal(sign.getTotalVertices(),old.getTotalVertices());assert.equal(sign.scaling.x/old.scaling.x,1.6);
  const snapshot=structuredClone(v.details);k.current.draw(s,0,false);assert.deepEqual(k.current.inspect().storyNpcs.kingdom.village.details,snapshot);
 }finally{k.close();}
});
function ownerFixture(){
 const p=ports(),engine=new NullEngine(),scene=new Scene(engine),root=new TransformNode('kingdom-truce',scene);
 for(const name of ['truce-window','truce-glass','truce-mullion'])for(let i=0;i<8;i++){const m=MeshBuilder.CreateBox(name,{},scene);m.parent=root;}
 const sign=MeshBuilder.CreatePlane('inn-sign',{width:1.4,height:.7},scene);sign.parent=root;sign.position.set(-4.7,2.4,-3.4);
 const texture=new DynamicTexture('truce-inn-sign',{width:80,height:40},scene,false),material=new StandardMaterial('sign',scene);material.diffuseTexture=texture;sign.material=material;
 return {scene,root,sign,detail:new VillageDetail(scene),close(){engine.dispose();p.close();}};
}
test('V applies once to the original owner and returns null after hiding or disposal',()=>{
 const k=ownerFixture();try{
  k.detail.apply(k.root);const count=k.scene.textures.length,meshes=k.scene.meshes.length;k.detail.apply(k.root);assert.equal(k.scene.textures.length,count);assert.equal(k.scene.meshes.length,meshes);assert.deepEqual(k.sign.scaling.asArray(),[1.6,1.6,1]);
  k.root.setEnabled(false);assert.equal(k.detail.inspect(),null);k.root.setEnabled(true);assert(k.detail.inspect());
  const another=new TransformNode('kingdom-truce',k.scene);assert.throws(()=>k.detail.apply(another));k.root.dispose();assert.equal(k.detail.inspect(),null);
 }finally{k.close();}
});
for(const [name,change] of Object.entries({wrongRoot:k=>k.root.name='prologue-home',missingFrame:k=>k.scene.getMeshByName('truce-window').dispose(),duplicateSign:k=>{const m=MeshBuilder.CreatePlane('inn-sign',{},k.scene);m.parent=k.root;},wrongResource:k=>k.sign.material.diffuseTexture.name='other',wrongScale:k=>k.sign.scaling.x=2,disposed:k=>k.root.dispose()}))test('V rejects '+name+' before allocating textures or changing the owner',()=>{
 const k=ownerFixture();try{change(k);const count=k.scene.textures.length,scale=k.sign.scaling.asArray();assert.throws(()=>k.detail.apply(k.root));assert.equal(k.scene.textures.length,count);assert.deepEqual(k.sign.scaling.asArray(),scale);assert.equal(k.detail.inspect(),null);}finally{k.close();}
});
