import {drawHDHero,HD_ART} from './hd-hero-art';
import {Scene,Mesh,MeshBuilder,TransformNode,Color3,StandardMaterial,DynamicTexture,Texture,Material,ShadowGenerator} from '@babylonjs/core';
import {RESCUE_SOLIDS,rescueMap} from './rescue-data';
import type {RescueMap} from './rescue-data';
import type {State} from './core';
import {drawRescueNpc,drawCathedralFloor,drawGlass} from './rescue-art';

/** Lazy authored sets. Shared solid footprints drive benches, pillars, organ and crates. */
export function buildRescue(scene:Scene,shadow:ShadowGenerator){
 type View={root:TransformNode;nuns:Mesh[];crest?:Mesh;frog?:Mesh;door?:Mesh;queen?:Mesh;fake?:Mesh;prisoner?:Mesh;lid?:Mesh};
 const views=new Map<RescueMap,View>();
 function build(map:RescueMap):View{
  const root=new TransformNode(map+'-set',scene),mats=new Map<string,StandardMaterial>();
  const mat=(hex:string,glow=false)=>{const key=hex+glow;let m=mats.get(key);if(!m){m=new StandardMaterial(map+key,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor=Color3.Black();if(glow)m.emissiveColor=Color3.FromHexString(hex).scale(.6);mats.set(key,m);}return m;};
  const stone=mat('#625e49'),dark=mat('#3d3b32'),wood=mat('#674b36'),gold=mat('#b49b63');
  const box=(name:string,x:number,y:number,z:number,w:number,h:number,d:number,m=stone)=>{const b=MeshBuilder.CreateBox(map+'-'+name,{width:w,height:h,depth:d},scene);b.position.set(x,y,z);b.parent=root;b.material=m;b.receiveShadows=true;if(h>.5)shadow.addShadowCaster(b);return b;};
  const picture=(name:string,x:number,y:number,z:number,w:number,h:number,draw:(c:CanvasRenderingContext2D)=>void,tw=24,th=32,billboard=true)=>{
   const t=new DynamicTexture(map+name,{width:tw,height:th},scene,false,Texture.NEAREST_SAMPLINGMODE);t.hasAlpha=true;draw(t.getContext() as CanvasRenderingContext2D);t.update();
   const m=new StandardMaterial(map+name,scene);m.diffuseTexture=t;m.emissiveTexture=t;m.disableLighting=true;m.useAlphaFromDiffuseTexture=true;m.transparencyMode=Material.MATERIAL_ALPHATEST;m.backFaceCulling=false;
   const b=MeshBuilder.CreatePlane(name,{width:w,height:h},scene);b.position.set(x,y,z);b.parent=root;b.material=m;if(billboard)b.billboardMode=Mesh.BILLBOARDMODE_ALL;return b;
  };
  const tex=new DynamicTexture(map+'-mosaic',{width:384,height:352},scene,false,Texture.NEAREST_SAMPLINGMODE);drawCathedralFloor(tex.getContext() as CanvasRenderingContext2D,384,352,map==='passage');tex.update(true);
  const floorMat=new StandardMaterial(map+'-floor',scene);floorMat.diffuseTexture=tex;floorMat.specularColor=Color3.Black();
  const floor=MeshBuilder.CreateGround(map+'-floor',{width:24,height:22},scene);floor.parent=root;floor.position.set(0,.03,1);floor.material=floorMat;floor.receiveShadows=true;
  box('foundation',0,-.42,1,24,.8,22,dark);box('back-wall',0,2.2,10.8,24,4.4,.6,dark);
  for(const x of [-11.6,11.6])box('side-wall',x,.6,1,.4,1.2,20,dark);
  // Horizontal courses give the back wall depth without procedural noise everywhere.
  for(let z=0;z<6;z++)for(let x=-11;x<12;x+=2)box('stone-course',x+(z%2)*.2,.3+z*.67,10.44,1.86,.58,.15,mat(z%2?'#595848':'#4d5042'));
  function column(x:number,z:number,h=4.5){
   box('plinth',x,.2,z,1.25,.35,1.25,dark);
   const shaft=MeshBuilder.CreateCylinder('fluted-column',{height:h,diameter:.85,tessellation:10},scene);shaft.position.set(x,h/2+.25,z);shaft.parent=root;shaft.material=stone;shadow.addShadowCaster(shaft);shaft.receiveShadows=true;
   for(const y of [.46,h+.2]){box('capital',x,y,z,1.26,.22,1.26,gold);box('cornice',x,y+.14,z,1.05,.1,1.05,stone);}
  }
  function candle(x:number,z:number){box('candle-stand',x,.52,z,.15,1,.15,gold);box('wax',x,1.15,z,.11,.45,.11,mat('#e0d4ac'));const flame=MeshBuilder.CreateSphere('candle-flame',{diameter:.13,segments:5},scene);flame.parent=root;flame.position.set(x,1.46,z);flame.scaling.y=1.5;flame.material=mat('#f4cf7c',true);}
  const v:View={root,nuns:[]};
  if(map==='cathedral'){
   for(const b of RESCUE_SOLIDS.cathedral.slice(0,6)){
    box('pew-seat',b.x,.43,b.z,b.w,.22,b.d,wood);box('pew-back',b.x,.85,b.z+.36,b.w,.8,.15,wood);
    for(const x of [b.x-b.w/2+.17,b.x+b.w/2-.17])box('pew-end',x,.62,b.z,.2,1.1,b.d,mat('#806044'));
   }
   for(const x of [-9,9])for(const z of [-5,1,7])column(x,z);
   box('altar-base',0,.2,8.5,4.2,.35,2.3,stone);box('altar',0,.86,8.5,3.8,1.2,1.8,mat('#85816a'));box('altar-top',0,1.5,8.5,4.1,.17,2,mat('#b1a487'));
   for(const x of [-3,3])candle(x,8.6);
   picture('stained-glass',0,3.3,10.15,2.6,4.1,drawGlass,40,64,false);
   // Western pipe organ, exactly aligned with its collision footprint and interact point.
   box('organ-case',-6.8,1.1,7.6,2.8,2.2,2.4,wood);
   for(let i=0;i<9;i++){const h=1.2+(4-Math.abs(i-4))*.31;const pipe=MeshBuilder.CreateCylinder('organ-pipe',{height:h,diameter:.16,tessellation:8},scene);pipe.parent=root;pipe.position.set(-7.9+i*.27,1.8+h/2,8.35);pipe.material=mat('#afa581');}
   box('organ-keys',-6.8,1.04,6.27,2.5,.13,.46,mat('#eee3bb'));
   for(let i=0;i<15;i++)if(i%7!==2&&i%7!==6)box('black-key',-7.94+i*.16,1.13,6.38,.075,.08,.22,dark);
   for(const [x,z] of [[-2.8,-2],[2.8,1],[-2.8,4]])v.nuns.push(picture('disguised-nun',x!,1.03,z!,1.3,1.85,c=>drawRescueNpc(c,'nun')));
   v.frog=picture('frog-arrival',1.2,1.03,4.8,1.4,1.85,c=>drawHDHero(c,'frog',0,0),HD_ART.width,HD_ART.height);
   v.crest=box('royal-crest',0,.12,1.8,.27,.06,.27,gold);
   v.door=box('secret-stone-door',4,1.65,10.02,2.3,3.3,.35,stone);
   box('door-shadow',4,1.55,10.22,2.3,3.1,.08,mat('#111b20'));
  }else if(map==='passage'){
   for(const b of RESCUE_SOLIDS.passage.slice(0,2)){
    box('side-vault',b.x,1.25,b.z,b.w,2.5,b.d,dark);
    for(let z=-1;z<6;z+=1.4){box('stone-seam',b.x,1.2,z,b.w+.06,.08,.06,stone);}
   }
   for(const x of [-2.8,2.8])for(const z of [-5,2,8])candle(x,z);
   box('supply-box',-7,.5,-5,2.2,.9,1.4,wood);v.lid=box('supply-lid',-7,1.03,-5,2.3,.16,1.5,mat('#937047'));
   for(const x of [-7.8,-6.2])box('box-band',x,.56,-5.74,.14,.9,.06,gold);
   box('north-door',0,1.3,10,2.7,2.6,.18,mat('#202e2d'));
  }else{
   for(const b of RESCUE_SOLIDS.sanctum.slice(0,6))column(b.x,b.z,3.7);
   box('raised-floor',0,.2,9,3.4,.35,1.3,stone);box('captivity-box',7.8,.6,7.7,2,1.2,1.7,wood);
   for(const x of [-3.8,3.8])candle(x,8.4);
   picture('faded-window',0,3.1,10.1,2.1,3.4,drawGlass,40,64,false);
   v.fake=picture('false-chancellor',0,1.03,4.5,1.32,1.85,c=>drawRescueNpc(c,'chancellor'));
   v.queen=picture('queen-leene',-2.5,1.03,7.4,1.32,1.85,c=>drawRescueNpc(c,'queen'));
   v.prisoner=picture('true-chancellor',7.8,1.03,6.1,1.32,1.85,c=>drawRescueNpc(c,'chancellor'));
  }
  root.setEnabled(false);return v;
 }
 return {draw(s:State){
  for(const [map,v] of views)v.root.setEnabled(map===s.chapter);
  if(!rescueMap(s.chapter))return;
  let v=views.get(s.chapter);if(!v){v=build(s.chapter);views.set(s.chapter,v);}v.root.setEnabled(true);
  const r=s.rescue;v.nuns.forEach(n=>n.setEnabled(r.stage==='entered'&&s.mode==='explore'));v.crest?.setEnabled(r.stage==='entered'&&s.mode==='explore');v.frog?.setEnabled(r.stage==='cleared'&&s.mode==='explore');v.door?.setEnabled(!r.organOpen);
  v.fake?.setEnabled(!r.yakraWon&&s.mode==='explore');v.queen?.setEnabled(s.mode!=='battle');v.prisoner?.setEnabled(r.chancellorFreed&&s.mode==='explore');
  if(v.lid)v.lid.rotation.x=r.chestOpened?-.8:0;
 },inspect(){return [...views.keys()];}};
}
