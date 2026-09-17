import {Scene,Mesh,MeshBuilder,TransformNode,Color3,StandardMaterial,DynamicTexture,Texture,Material,ShadowGenerator} from '@babylonjs/core';
import {prologueMap,HOME_SOLIDS,MARLE_MEETING,DROPPED_PENDANT,WORLD_HOME} from './prologue-data';
import type {PrologueMap} from './prologue-data';
import type {State} from './core';
import {drawAdventureHero,drawResident,drawTree} from './pixel-art';
import {drawRoomFloor,drawRegionalMap} from './prologue-art';
/** Three cached scene roots; rendering never changes progression or writes a save. */
export function buildPrologue(scene:Scene,shadow:ShadowGenerator){
 type View={root:TransformNode;curtains:Mesh[];mother?:Mesh};
 const views=new Map<PrologueMap,View>();
 function builder(id:string){
  const root=new TransformNode(id,scene),mats=new Map<string,StandardMaterial>();
  const mat=(hex:string)=>{let m=mats.get(hex);if(!m){m=new StandardMaterial(id+hex,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor=Color3.Black();mats.set(hex,m);}return m;};
  const box=(n:string,x:number,y:number,z:number,w:number,h:number,d:number,hex:string)=>{const b=MeshBuilder.CreateBox(id+'-'+n,{width:w,height:h,depth:d},scene);b.parent=root;b.position.set(x,y,z);b.material=mat(hex);b.receiveShadows=true;if(h>.45)shadow.addShadowCaster(b);return b;};
  const picture=(n:string,x:number,z:number,w:number,h:number,draw:(c:CanvasRenderingContext2D)=>void,tw=24,th=32)=>{
   const t=new DynamicTexture(id+'-'+n,{width:tw,height:th},scene,false,Texture.NEAREST_SAMPLINGMODE);t.hasAlpha=true;draw(t.getContext() as CanvasRenderingContext2D);t.update();const m=new StandardMaterial(id+'-'+n,scene);m.diffuseTexture=t;m.emissiveTexture=t;m.disableLighting=true;m.useAlphaFromDiffuseTexture=true;m.transparencyMode=Material.MATERIAL_ALPHATEST;m.backFaceCulling=false;
   const p=MeshBuilder.CreatePlane(id+'-'+n,{width:w,height:h},scene);p.parent=root;p.material=m;p.billboardMode=Mesh.BILLBOARDMODE_ALL;p.position.set(x,h/2+.1,z);return p;
  };
  const floor=(n:string,w:number,d:number,draw:(c:CanvasRenderingContext2D)=>void)=>{
   const t=new DynamicTexture(id+n,{width:384,height:352},scene,false,Texture.NEAREST_SAMPLINGMODE);draw(t.getContext() as CanvasRenderingContext2D);t.update();const m=mat('#ffffff');m.diffuseTexture=t;const f=MeshBuilder.CreateGround(id+n,{width:w,height:d},scene);f.parent=root;f.position.y=.035;f.material=m;f.receiveShadows=true;return f;
  };
  return {root,mat,box,picture,floor};
 }
 function build(map:PrologueMap):View{
  const b=builder('prologue-'+map),{root,box,picture,floor}=b,curtains:Mesh[]=[];let mother:Mesh|undefined;
  if(map==='overworld1000'){
   box('ocean',0,-.3,0,40,.5,36,'#204a69');floor('regional-land',24,22,c=>drawRegionalMap(c));
   function smallHouse(x:number,z:number,tint='#945e43'){
    box('tiny-foundation',x,.09,z,1.65,.14,1.35,'#7b7960');box('tiny-plaster',x,.41,z,1.35,.65,1.1,'#dbce9c');
    for(const sign of [-1,1]){const roof=box('tiny-roof',x+sign*.4,.89,z,.97,.13,1.5,tint);roof.rotation.z=sign*-.48;}
    box('tiny-ridge',x,1.08,z,.10,.10,1.55,'#613f32');box('tiny-door',x,.33,z-.58,.28,.52,.05,'#423f33');
    box('tiny-window',x+.4,.52,z-.59,.22,.24,.04,'#f4d891');box('tiny-window',x-.4,.52,z-.59,.22,.24,.04,'#f4d891');
   }
   smallHouse(WORLD_HOME.x,WORLD_HOME.z+.8);smallHouse(-2.3,-1.1);smallHouse(-4.1,1.6,'#667a83');smallHouse(4.3,-4.5);
   for(const [x,z] of [[-8,6],[-7,6],[-6,6],[-8,7],[-6,7],[-7,8],[6,2],[6,3],[7,2],[7,3],[-6,-2],[-7,-1],[-5,-4]])picture('small-tree',x!,z!,1.35,1.65,c=>drawTree(c),64,80);
   // Fair enclosure reads as a destination icon, not a full-sized town dropped on the map.
   box('square',2,.09,6.9,3.4,.12,2.5,'#c6b783');
   for(const [x,tint] of [[.8,'#ac5261'],[3.2,'#4e718a']] as const){box('tiny-tent',x,.38,7,1,.55,1.1,tint);box('tent-stripe',x,.68,7,.16,.04,1.15,'#e5d3a4');}
   for(const x of [1.4,2.6])box('square-post',x,.42,5.8,.15,.8,.15,'#ddd6b6');box('square-arch',2,.86,5.8,1.4,.16,.22,'#d2c797');
   box('distant-mountain',-6.7,.7,4.9,4.6,1.4,.5,'#758073');
  }else{
   floor('wood-floor',12,10,c=>drawRoomFloor(c,384,352));box('plinth',0,-.3,0,12.3,.6,10.3,'#3c352b');
   box('north-wall',0,1.5,4.85,12,3,.25,'#74664a');
   for(let z=.3;z<3;z+=.32)box('wall-planks',0,z,4.7,12,.035,.07,z%1>.5?'#9b8960':'#554d3c');
   for(const x of [-5.85,5.85])box('low-cutaway-wall',x,.3,0,.2,.6,9.6,'#706047');
   for(const x of [-5.7,-2.9,3,5.7])box('vertical-beam',x,1.45,4.65,.18,2.9,.14,'#463b2e');
   box('window-frame',0,1.93,4.54,2.8,2.25,.18,'#b4a57a');box('morning-window',0,1.93,4.42,2.48,2.05,.04,'#f3df9a');
   for(const x of [-.6,.6])box('window-mullion',x,1.93,4.35,.1,2.02,.06,'#9d8857');box('window-transom',0,2,4.34,2.42,.12,.08,'#9d8857');
   for(const side of [-1,1]){const curtain=box('curtain',side*1.1,1.93,4.2,.64,2.25,.12,'#c8bc9e');curtains.push(curtain);for(let i=0;i<4;i++)box('curtain-pleat',side*(1.04+i*.12),1.93,4.10,.04,2.1,.04,'#dfcfaa');}
   for(const x of [-.6,0,.6]){box('pot',x,.68,4.15,.28,.36,.30,'#955947');picture('plant',x,4.1,.54,.6,c=>{c.fillStyle='#467149';for(let i=0;i<7;i++)c.fillRect(4+i*2,5+Math.abs(i-3)*2,5,14);},24,32).position.y=1.05;}
   if(map==='bedroom'){
    const bed=HOME_SOLIDS.bedroom[0]!;box('bed-frame',bed.x,.38,bed.z,bed.w,.7,bed.d,'#76513a');box('headboard',bed.x,.86,bed.z+1.7,2.4,1.2,.2,'#8c6344');box('blanket',bed.x,.82,bed.z-.35,2.12,.20,2.5,'#dbceb0');box('pillow',bed.x,.95,bed.z+1.06,1.65,.25,.66,'#eee4c5');
    for(const x of [2.58,4.61])box('blanket-edge',x,.93,1.2,.07,.03,2.4,'#b56c63');
    box('desk',-3.7,.72,3.4,3.1,1.4,1.8,'#876645');box('desktop',-3.7,1.45,3.4,3.25,.16,1.92,'#a27d51');
    box('book',-4.2,1.59,3.3,.82,.13,.69,'#722f46');box('open-page',-4.12,1.68,3.3,.59,.03,.55,'#e4d7ae');box('chair-seat',-3.6,.46,1.7,.85,.18,.8,'#785537');box('chair-back',-3.6,.86,1.35,.88,.95,.16,'#77563b');
    box('shelf',3.8,1.6,4.3,3.3,2.5,.6,'#644333');for(let row=0;row<3;row++){box('shelf-board',3.8,.7+row*.7,3.96,3.3,.09,.42,'#a07e51');for(let i=0;i<10;i++)box('books',2.34+i*.30,.96+row*.7,4.03,.17,.43+(i%2)*.1,.27,['#894556','#4e6868','#b7914b'][i%3]!);}
    const clock=picture('wall-clock',-4.7,4.25,.75,.85,c=>{c.fillStyle='#ded1a5';c.beginPath();c.arc(12,14,10,0,Math.PI*2);c.fill();c.fillStyle='#5b4431';c.fillRect(11,5,2,10);c.fillRect(12,13,7,2);});clock.position.y=2.7;
    for(let i=0;i<4;i++)box('down-stair',0,-.08-i*.05,-3.6-i*.22,1.35,.09,.24,'#453c30');
    mother=picture('mother',-.2,1.9,1.36,1.85,c=>drawResident(c,'resident'));
   }else{
    box('woven-rug',-2.4,.09,.2,3.8,.04,3.6,'#927556');box('table',-2.4,.63,.2,2.5,1.2,2.5,'#936f46');box('tablecloth',-2.4,1.26,.2,2.54,.03,2.54,'#c6bb98');
    box('cup',-2.1,1.4,.5,.25,.28,.25,'#eee3c1');box('bread',-2.8,1.38,.0,.52,.18,.34,'#bc9157');
    box('cupboard',-4.7,1.1,3.6,2,2.2,1.7,'#967448');for(const x of [-5.2,-4.2])box('cabinet-door',x,1.1,2.72,.86,1.75,.10,'#82623f');
    for(let i=0;i<7;i++)box('up-stair',4.7,.08+i*.12,2.65+i*.24,1.42,.16+i*.22,.26,i%2?'#b39865':'#8e754f');
    box('doormat',0,.08,-4.1,1.5,.07,.85,'#876542');mother=picture('mother',0,2,1.36,1.85,c=>drawResident(c,'resident'));
   }
  }
  root.setEnabled(false);return {root,curtains,mother};
 }
 const meeting=builder('prologue-meeting');
 const marle=meeting.picture('marle',MARLE_MEETING.x,MARLE_MEETING.z,1.36,1.85,c=>drawAdventureHero(c,1,0,0));
 const pendant=meeting.picture('pendant',DROPPED_PENDANT.x,DROPPED_PENDANT.z,.48,.55,c=>{c.strokeStyle='#cfb46c';c.lineWidth=2;c.beginPath();c.arc(12,9,6,0,Math.PI*1.7);c.stroke();c.fillStyle='#86cbd0';c.fillRect(9,15,7,10);c.fillStyle='#fcf0b7';c.fillRect(11,16,2,5);});
 let marlePose='';
 return {inspect:()=>({maps:[...views.keys()],meeting:meeting.root.isEnabled(),marle:marle.isEnabled(),pendant:pendant.isEnabled()}),draw(s:State){
  for(const [id,v] of views)v.root.setEnabled(id===s.chapter);
  if(prologueMap(s.chapter)){let v=views.get(s.chapter);if(!v){v=build(s.chapter);views.set(s.chapter,v);}v.root.setEnabled(true);if(s.chapter==='bedroom'){v.mother?.setEnabled(s.prologue.stage==='waking');v.curtains.forEach((c,i)=>{c.position.x=(i===0?-1:1)*(.34+Math.min(1,s.prologue.elapsed/.9)*.78);if(s.prologue.stage!=='waking')c.position.x=(i===0?-1:1)*1.12;});}}
  const atMeeting=s.chapter==='fair'&&['fair','collision'].includes(s.prologue.stage);meeting.root.setEnabled(atMeeting);marle.setEnabled(atMeeting);const pose=s.prologue.stage==='collision'&&s.prologue.elapsed<.6?'down':'idle';if(atMeeting&&pose!==marlePose){marlePose=pose;const t=(marle.material as StandardMaterial).diffuseTexture as DynamicTexture;drawAdventureHero(t.getContext() as CanvasRenderingContext2D,1,0,0,pose);t.update();}pendant.setEnabled(atMeeting&&s.prologue.stage==='collision'&&!s.prologue.pendantPicked);
 }};
}
