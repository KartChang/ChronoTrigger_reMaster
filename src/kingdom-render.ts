import {drawSurface} from './world-art';
import {Scene,Mesh,MeshBuilder,TransformNode,Color3,StandardMaterial,DynamicTexture,Texture,Material,ShadowGenerator} from '@babylonjs/core';
import {KINGDOM_SOLIDS,kingdomMap} from './kingdom-data';
import type {KingdomMap} from './kingdom-data';
import type {State} from './core';
import {drawTree,drawAdventureHero,drawLucca,drawResident} from './pixel-art';

/** Lazy map construction. No game state is written here; footprints come from the rule data. */
export function buildKingdom(scene:Scene,shadow:ShadowGenerator){
 type MapView={root:TransformNode;queen?:Mesh;lucca?:Mesh};
 const views=new Map<KingdomMap,MapView>();
 function build(chapter:KingdomMap):MapView{
  const root=new TransformNode('kingdom-'+chapter,scene),mats=new Map<string,StandardMaterial>();
  const mat=(hex:string)=>{let m=mats.get(hex);if(!m){m=new StandardMaterial(chapter+hex,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor=Color3.Black();mats.set(hex,m);}return m;};
  const box=(name:string,x:number,y:number,z:number,w:number,h:number,d:number,m:StandardMaterial)=>{const b=MeshBuilder.CreateBox(chapter+'-'+name,{width:w,height:h,depth:d},scene);b.parent=root;b.position.set(x,y,z);b.material=m;b.receiveShadows=true;if(h>.6)shadow.addShadowCaster(b);return b;};
  const picture=(name:string,x:number,z:number,w:number,h:number,draw:(c:CanvasRenderingContext2D)=>void,width=24,height=32)=>{
   const t=new DynamicTexture(chapter+'-'+name,{width,height},scene,false,Texture.NEAREST_SAMPLINGMODE);t.hasAlpha=true;draw(t.getContext() as CanvasRenderingContext2D);t.update();
   const m=new StandardMaterial(chapter+'-'+name,scene);m.diffuseTexture=t;m.emissiveTexture=t;m.disableLighting=true;m.useAlphaFromDiffuseTexture=true;m.transparencyMode=Material.MATERIAL_ALPHATEST;m.backFaceCulling=false;
   const b=MeshBuilder.CreatePlane(name,{width:w,height:h},scene);b.parent=root;b.material=m;b.billboardMode=Mesh.BILLBOARDMODE_ALL;b.position.set(x,h/2+.1,z);return b;
  };
  const inside=chapter==='castle'||chapter==='chamber';
  const texture=new DynamicTexture(chapter+'-ground',{width:384,height:352},scene,false,Texture.NEAREST_SAMPLINGMODE),ctx=texture.getContext() as CanvasRenderingContext2D;
  let seed=633;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  ctx.fillStyle=inside?'#797b7d':chapter==='forest'?'#34573e':'#718b4e';ctx.fillRect(0,0,384,352);
  for(let i=0;i<5500;i++){ctx.fillStyle=inside?['#888b8e','#70787e','#99999a'][i%3]!:['#8f9f57','#5d7941','#456c3e','#a0aa64'][i%4]!;ctx.fillRect(Math.floor(rand()*384),Math.floor(rand()*352),inside?2:3,2);}
  if(inside){
   for(let y=0;y<352;y+=22)for(let x=-16;x<384;x+=32){ctx.strokeStyle='#525d65';ctx.strokeRect(x+(y%44===0?16:0),y,32,22);}
   ctx.fillStyle='#623e53';ctx.fillRect(153,15,78,320);ctx.fillStyle='#b99d67';ctx.fillRect(157,15,2,320);ctx.fillRect(225,15,2,320);
   for(let y=24;y<328;y+=16){ctx.fillStyle='#8b5a69';ctx.fillRect(182,y,18,6);}
  }else{
   // Organic dirt path, not a perfectly repeating tile stripe.
   for(let y=0;y<352;y++){const centre=192+(chapter==='forest'?Math.sin(y*.025)*14:0);ctx.fillStyle='#a89467';ctx.fillRect(centre-30,y,60,1);}
   if(chapter==='truce'){ctx.fillStyle='#a89467';ctx.fillRect(75,93,138,26);ctx.fillRect(80,253,248,34);}
   for(let i=0;i<1300;i++){const x=162+rand()*58,y=rand()*352;ctx.fillStyle=i%2?'#b8a67b':'#9b895f';ctx.fillRect(x,y,2+rand()*4,1);}
  }
  if(chapter==='forest')drawSurface(ctx,384,352,'forest');
  texture.update();const groundMat=new StandardMaterial(chapter+'-floor-material',scene);groundMat.diffuseTexture=texture;groundMat.specularColor=Color3.Black();
  const floor=MeshBuilder.CreateGround(chapter+'-floor',{width:24,height:22},scene);floor.parent=root;floor.position.set(0,.06,1);floor.material=groundMat;floor.receiveShadows=true;
  box('foundation',0,-.6,1,24,1,22,mat(inside?'#3e4955':'#304b37'));
  const timber=mat('#665042'),stone=mat('#8b908c');
  function house(x:number,z:number,w:number,d:number,inn=false){
   box('stone-plinth',x,.18,z,w+.2,.3,d+.2,stone);box('plaster',x,1.5,z,w,2.7,d,mat('#c4baa0'));
   for(const dx of [-w/2+.1,0,w/2-.1])box('timber',x+dx,1.5,z-d/2-.03,.16,2.8,.12,timber);
   box('crossbeam',x,1.1,z-d/2-.08,w,.14,.1,timber);box('lintel',x,2.6,z-d/2-.08,w,.14,.1,timber);
   const roof=mat(inn?'#876048':'#596879');
   for(const side of [-1,1]){const r=box('pitched-roof',x+side*w*.25,3.35,z,w*.60,.18,d+.7,roof);r.rotation.z=side*-.48;
    for(let i=0;i<4;i++){const tile=box('roof-course',x+side*(.2+i*w*.14),3.93-i*.30,z,.09,.08,d+.72,mat(inn?'#a07a59':'#6d7e8a'));tile.rotation.z=side*-.48;}}
   box('ridge',x,4.02,z,.15,.12,d+.8,timber);box('door',x,.83,z-d/2-.12,.8,1.55,.08,mat('#39413f'));
   for(const side of [-1,1]){const mx=x+side*w*.31;box('window',mx,1.75,z-d/2-.1,.74,.77,.1,timber);const glow=mat('#eac485');glow.emissiveColor=Color3.FromHexString('#64441e');box('glass',mx,1.76,z-d/2-.17,.58,.61,.04,glow);box('mullion',mx,1.76,z-d/2-.21,.08,.62,.05,timber);}
   box('chimney',x+w*.25,3.75,z+.25,.5,1.5,.55,stone);
   if(inn){const sign=picture('inn-sign',x+1.8,z-d/2-.3,1.4,.7,c=>{c.fillStyle='#493c32';c.fillRect(0,0,80,40);c.strokeStyle='#bca274';c.strokeRect(2,2,76,36);c.fillStyle='#eee0b6';c.font='bold 22px serif';c.fillText('INN',16,28);},80,40);sign.position.y=2.4;}
  }
  function tree(x:number,z:number,w=4.2){picture('oak',x,z,w,w*1.25,c=>drawTree(c),64,80);}
  let queen:Mesh|undefined,lucca:Mesh|undefined;
  if(chapter==='truce'){
   KINGDOM_SOLIDS.truce.forEach((s,i)=>house(s.x,s.z,s.w,s.d,i===2));
   for(const [x,z] of [[-10,-7],[10,8],[-10,9],[9,-8]])tree(x!,z!,3.7);
   picture('townsperson',-4.5,1,1.32,1.8,c=>drawResident(c,'resident'));
   picture('innkeeper',-6.5,-3.3,1.32,1.8,c=>drawResident(c,'resident'));
   for(let i=0;i<5;i++)box('flower-box',-9+i*.4,.35,-3.4,.27,.35,.5,mat(i%2?'#c6966c':'#6d854d'));
  }else if(chapter==='forest'){
   for(const r of KINGDOM_SOLIDS.forest){
    const rock=MeshBuilder.CreatePolyhedron('forest-weathered-rock',{type:2,size:1},scene);rock.parent=root;rock.position.set(r.x,.38,r.z);rock.scaling.set(r.w*.42,.65,r.d*.42);rock.material=mat('#687257');rock.receiveShadows=true;shadow.addShadowCaster(rock);
    picture('rock-ferns',r.x,r.z,r.w*.6,.62,c=>{c.fillStyle='#6f8151';for(let i=0;i<7;i++){c.fillRect(3+i*3,10+Math.abs(3-i)*2,1,14);c.fillRect(1+i*3,15+Math.abs(3-i),5,1);}});
   }
   for(const x of [-10.5,10.5])for(const z of [-7,-2,3,8])tree(x,z,4.8);
   for(const [x,z] of [[-7,7],[7,8],[-6,-6],[6,-5]])tree(x!,z!,3.7);
   for(let i=0;i<55;i++){const x=(rand()-.5)*20,z=rand()*19-8;if(Math.abs(x)<3)continue;box('fern',x,.16,z,.16,.23,.09,mat(i%2?'#7f9558':'#9ba779'));}
  }else{
   box('north-wall',0,1.8,11,24,3.6,.4,stone);
   for(const x of [-11.8,11.8])box('side-wall',x,1,1,.35,2,20,mat('#697782'));
   for(let i=-10;i<=10;i+=2){box('wall-stone',i,2.6,10.72,1.95,.05,.06,mat('#bac0b7'));box('wall-base',i,.5,10.72,1.95,.08,.09,mat('#596772'));}
   for(const x of [-7,7]){box('arched-window',x,2.2,10.7,1.5,2.1,.08,mat('#2b4264'));box('window-top',x,3.3,10.66,1.1,.25,.1,mat('#b0b6ac'));box('window-cross',x,2.25,10.55,.08,2,.08,mat('#b0b6ac'));}
   if(chapter==='castle'){
    for(const r of KINGDOM_SOLIDS.castle.slice(0,4)){box('column',r.x,1.7,r.z,r.w,3.4,r.d,mat('#a3a99e'));box('capital',r.x,3.4,r.z,1.4,.24,1.4,stone);}
    box('dais',0,.22,8.6,4,.4,2.6,stone);box('throne-seat',0,.7,8.8,1.5,.55,1.2,mat('#744856'));box('throne-back',0,1.55,9.3,1.6,2,.24,mat('#826143'));
    picture('king',0,7.4,1.4,1.95,c=>drawResident(c,'king'));
    picture('guard',-1.8,-2.5,1.4,1.95,c=>drawResident(c,'guard'));
    for(let i=0;i<6;i++)box('east-stair',8,.12+i*.1,6.4+i*.4,2,.2+i*.2,.5,mat(i%2?'#a4aaa4':'#7e8b8b'));
    for(const x of [-3.8,3.8]){box('banner',x,2.15,10.3,1.3,2.5,.08,mat('#415a7e'));box('banner-crest',x,2.3,10.23,.45,.7,.05,mat('#d6b873'));}
    lucca=picture('lucca',2,-3.2,1.36,1.85,c=>drawLucca(c));
   }else{
    const bed=KINGDOM_SOLIDS.chamber[0]!;box('bed-frame',bed.x,.48,bed.z,bed.w,.7,bed.d,timber);box('quilt',bed.x,.9,bed.z-.4,bed.w-.2,.22,bed.d-1,mat('#647c9b'));box('pillow',bed.x,1.08,bed.z+1.2,2.5,.15,.75,mat('#ded7b7'));
    box('cupboard',6.5,1.1,7,3,2.2,1.5,timber);box('table',6.5,.8,1.5,2,1.6,2,mat('#876d4d'));
    queen=picture('marle-as-queen',0,2,1.36,1.85,c=>drawAdventureHero(c,1,0,0));
   }
  }
  root.setEnabled(false);return {root,queen,lucca};
 }
 return {draw(s:State){
  for(const [id,v] of views)v.root.setEnabled(id===s.chapter);
  if(!kingdomMap(s.chapter))return;
  let view=views.get(s.chapter);if(!view){view=build(s.chapter);views.set(s.chapter,view);}view.root.setEnabled(true);
  if(view.queen){view.queen.setEnabled(s.kingdom.phase==='audience'||s.kingdom.phase==='erasing');const scale=s.kingdom.phase==='erasing'?Math.max(.02,1-s.kingdom.elapsed/2.2):1;view.queen.scaling.set(scale,scale,1);}
  view.lucca?.setEnabled(s.kingdom.phase==='missing');
 }};
}
