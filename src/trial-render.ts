import {NpcMotion} from './npc-motion';
import {drawWitness,drawFairProp,WITNESS_SIZE} from './witness-art';
import {witnessScenes,jailGift} from './trial-hearing';
import {drawHDHero,HD_ART} from './hd-hero-art';
import {materialSet,boxTextureUV} from './material-runtime';
import {ART_PROFILE,tankVisualFrame} from './art-profile';
import {Scene,Mesh,MeshBuilder,TransformNode,Color3,Vector3,Matrix,StandardMaterial,DynamicTexture,Texture,Material,ShadowGenerator} from '@babylonjs/core';
import type {State} from './core';
import {TRIAL_SOLIDS,trialMap} from './trial-data';
import type {TrialMap} from './trial-data';
import {drawWoodlandOak} from './woodland-art';
import {bindCourtStaging} from './court-staging';
import {drawTrialSceneryFloor,courtFixtureDetails} from './trial-scenery-art';
import {drawTrialFloor,drawCourtWindow,drawTankPart} from './trial-art';
/** Cached, distinct interior/field sets; camera and game rules stay outside this renderer. */
export function buildTrial(scene:Scene,shadow:ShadowGenerator){
 type View={root:TransformNode;guards:Mesh[];enemies:Mesh[];tank:Mesh[];jurors:Mesh[];tankFrame:number;witnesses:Mesh[];npcs:Mesh[];window?:Mesh;parcel?:Mesh;gate?:Mesh;fritz?:Mesh;marle?:Mesh;lid?:Mesh;staging?:ReturnType<typeof bindCourtStaging>};
 const views=new Map<TrialMap,View>();const motion=new NpcMotion(scene);
 function build(map:TrialMap):View{
  const root=new TransformNode('trial-'+map,scene),mats=new Map<string,StandardMaterial>(),surface=materialSet(scene,map);
  const mat=(hex:string)=>{let m=mats.get(hex);if(!m){m=new StandardMaterial(map+hex,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor=Color3.Black();mats.set(hex,m);}return m;};
  const box=(n:string,x:number,y:number,z:number,w:number,h:number,d:number,color='#6e7777')=>{const m=MeshBuilder.CreateBox(map+'-'+n,{width:w,height:h,depth:d,faceUV:boxTextureUV(w,h,d)},scene);m.parent=root;m.position.set(x,y,z);m.material=surface(n,color);m.receiveShadows=true;if(h>.5)shadow.addShadowCaster(m);return m;};
  const picture=(n:string,x:number,z:number,w:number,h:number,draw:(c:CanvasRenderingContext2D)=>void,tw=24,th=32,y=h/2+.08,billboard=true)=>{
   const t=new DynamicTexture(map+n,{width:tw,height:th},scene,false,Texture.NEAREST_SAMPLINGMODE);t.hasAlpha=true;draw(t.getContext() as CanvasRenderingContext2D);t.update();const m=new StandardMaterial(map+n,scene);m.diffuseTexture=t;m.emissiveTexture=t;m.disableLighting=true;m.useAlphaFromDiffuseTexture=true;m.transparencyMode=Material.MATERIAL_ALPHATEST;m.backFaceCulling=false;
   const b=MeshBuilder.CreatePlane(map+n,{width:w,height:h},scene);b.parent=root;b.position.set(x,y,z);b.material=m;if(billboard)b.billboardMode=Mesh.BILLBOARDMODE_ALL;if(tw===48&&th===64)v.npcs.push(b);return b;
  };
  const v:View={root,guards:[],enemies:[],tank:[],jurors:[],witnesses:[],npcs:[],tankFrame:-1};
  const floorTexture=new DynamicTexture(map+'-floor',{width:384,height:352},scene,false,Texture.NEAREST_SAMPLINGMODE);
  const c=floorTexture.getContext() as CanvasRenderingContext2D;
  if(map==='guardia1000'||map==='courtroom')drawTrialSceneryFloor(c,384,352,map);else drawTrialFloor(c,384,352,map==='prisonbridge'?'bridge':map==='futuregate'?'future':'prison');floorTexture.update();
  const fm=new StandardMaterial(map+'-ground-material',scene);fm.diffuseTexture=floorTexture;fm.specularColor=Color3.Black();
  const f=MeshBuilder.CreateGround(map+'-ground',{width:ART_PROFILE.bridge.width,height:ART_PROFILE.bridge.depth},scene);f.parent=root;f.position.y=.02;f.material=fm;f.receiveShadows=true;
  if(map!=='prisonbridge'&&map!=='guardia1000'){
   box('back-wall',0,1.5,7.1,16,3,.5,'#3f4a52');
   for(let row=0;row<4;row++)for(let x=-7.8;x<8;x+=1.6)box('wall-course',x+(row%2)*.15,.4+row*.67,6.79,1.48,.56,.12,row%2?'#57656b':'#667276');
   for(const x of [-7.8,7.8])box('cutaway-side-wall',x,.47,0,.35,.95,14,'#525f67');
   for(const x of [-5.8,5.8]){box('torch-arm',x,1.1,6.4,.13,.6,.3,'#9a855d');const flame=box('torch-flame',x,1.65,6.4,.16,.25,.12,'#ecbe73');(flame.material as StandardMaterial).emissiveColor=Color3.FromHexString('#d5a85c');}
  }
  const door=(x:number,z:number,n='door')=>{box(n+'-left',x-1,1,z,.28,2,.45,'#a29d83');box(n+'-right',x+1,1,z,.28,2,.45,'#a29d83');box(n+'-arch',x,2.08,z,2.4,.22,.48,'#b9b197');};
  const guard=(x:number,z:number)=>motion.add(picture('guard',x,z,1.2,1.7,ctx=>drawWitness(ctx,'guard'),48,64),'guard');
  if(map==='courtroom'){
   for(const p of courtFixtureDetails())box(p.name,p.x,p.y,p.z,p.w,p.h,p.d,p.color);
   for(let i=0;i<3;i++){
    const platform=MeshBuilder.CreateCylinder('court-curved-dais',{diameter:10-i*.8,height:.24,tessellation:28},scene);platform.parent=root;platform.position.set(0,.14+i*.23,4);platform.material=mat(i%2?'#817957':'#55594e');
   }
   v.window=picture('royal-stained-glass',0,6.65,4,2.6,drawCourtWindow,64,80,2.8,false);
   for(const side of [-1,1])for(let i=0;i<4;i++){box('velvet-curtain',side*(4.3+i*.26),2.65,6.45,.34,4.2-i*.35,.16,i%2?'#7d393c':'#9b4b46');box('curtain-gold-edge',side*(4.3+i*.26),.42+i*.18,6.39,.35,.09,.1,'#c9ac65');}
   box('judge-rostrum',0,1.02,4.2,1.7,.85,1.2,'#9e8c56');motion.add(picture('judge',0,4.9,1.2,1.7,ctx=>drawWitness(ctx,'judge'),48,64,1.9),'judge');
   motion.add(picture('defender',-3.1,3.4,1.1,1.7,ctx=>drawWitness(ctx,'defender'),48,64),'defender');motion.add(picture('prosecutor',3.1,3.4,1.1,1.7,ctx=>drawWitness(ctx,'prosecutor'),48,64),'prosecutor');
   for(const kind of ['girl','elder','merchant','shopper'] as const)v.witnesses.push(motion.add(picture('testimony-'+kind,2.6,.4,1.36,1.85,ctx=>drawWitness(ctx,kind),48,64),kind));
   box('defendant-stand',0,.43,-1.2,1.5,.7,.7,'#a3854b');
   for(let i=0;i<7;i++){const side=i<4?-1:1,z=1+(i%4)*1.28;box('jury-tier',side*5.5,.3,z,2.3,.5,1.2,'#817c64');v.jurors.push(picture('juror-'+i,side*5.4,z,1,1.4,ctx=>drawWitness(ctx,i%2?'merchant':'defender'),48,64,1.05));}
  }else if(map==='guardia1000'){
   for(const side of [-1,1])for(let z=-6;z<=6;z+=2){if(side===1&&z>=2)continue;picture('tree',side*(4.5+(z%3)*.2),z,3.6,4.5,drawWoodlandOak,64,80);}
   for(const x of [-6,-3,2,7])picture('canopy',x,6.8,3.6,4.6,drawWoodlandOak,64,80);
   const gate=MeshBuilder.CreateTorus('forest-time-gate',{diameter:1.7,thickness:.18,tessellation:32},scene);gate.parent=root;gate.position.set(5.5,1.35,4);gate.rotation.x=Math.PI/2;const gm=mat('#739dc1');gm.emissiveColor=Color3.FromHexString('#628ed0');gate.material=gm;v.gate=gate;
   for(const x of [-1.3,0,1.3])v.guards.push(guard(x,-4.5));door(0,6.7,'castle-path');
  }else if(map==='hall1000'){
   for(const x of [-5,5])for(const z of [-3,2]){box('pillar-base',x,.16,z,1.3,.32,1.3,'#b2b198');box('pillar',x,1.5,z,.75,2.6,.75,'#8d958a');box('pillar-capital',x,2.9,z,1.35,.22,1.35,'#b8b18e');}
   box('royal-carpet',0,.06,1,3.3,.05,10,'#7c3e45');v.marle=picture('marle-waits',0,1,1.25,1.8,ctx=>drawHDHero(ctx,'marle',0,0),HD_ART.width,HD_ART.height);
   for(const x of [-2.2,2.2])v.guards.push(guard(x,.2));motion.add(picture('chancellor',2.5,4,1.3,1.8,ctx=>drawWitness(ctx,'prosecutor'),48,64),'prosecutor');door(0,-6.9,'city-gate');
  }else if(map==='cellblock'){
   v.parcel=picture('supporters-parcel',3,-4,1,.9,ctx=>drawFairProp(ctx,'parcel'),32,32);
   box('storage-locker',-5,.6,4,2.3,1.2,2.4,'#4b5050');
   box('cot-frame',-4.8,.23,-4,2,.4,2.6,'#554638');box('cot-straw',-4.8,.48,-4,1.8,.16,2.4,'#b19b68');box('pillow',-4.8,.62,-3.2,1.5,.2,.55,'#c7c2a3');
   for(const side of [-1,1])for(let x=1.3;x<7.6;x+=.44)box('cell-bars',side*x,1.2,-.4,.09,2.4,.1,'#3a4752');
   const gate=box('locked-gate',0,1.2,-.4,2.2,2.4,.08,'#52606a');(gate.material as StandardMaterial).alpha=.42;v.gate=gate;
   const bowl=MeshBuilder.CreateCylinder('water-bowl',{diameter:.65,height:.18,tessellation:14},scene);bowl.parent=root;bowl.position.set(-3.4,.13,-1.7);bowl.material=mat('#abc1be');
   door(0,6.8,'stairs');door(6,2.5,'execution-door');v.guards.push(guard(2,2));
  }else if(map==='execution'){
   for(const x of [3,4.6])box('guillotine-upright',x,1.4,2,.23,2.8,.28,'#655540');box('guillotine-crossbar',3.8,2.85,2,1.95,.22,.3,'#877258');box('guillotine-blade',3.8,2.14,2,1.3,.52,.09,'#bac2b8');box('restraint',3.8,.65,2,1.5,.26,1.8,'#675644');
   v.fritz=motion.add(picture('fritz',2.1,2,1.2,1.7,ctx=>drawWitness(ctx,'defender'),48,64),'defender');door(0,-6.8);
  }else if(map==='prisonstairs'){
   for(let i=0;i<9;i++){box('stone-stair',0,.05+i*.03,3.5+i*.26,6.4,.12,.27,i%2?'#84918f':'#636f75');}
   for(const side of [-1,1])box('tower-masonry',side*5.6,.68,0,4.4,1.35,4.5,'#4d5c68');door(0,6.8);door(0,-6.8);
  }else if(map==='warden'){
   box('warden-desk',3.7,.6,2,2.4,1.1,1.5,'#776047');box('manual-paper',3.25,1.17,1.8,.9,.04,.7,'#d3cead');box('supplies',-4,.38,2,1.25,.72,.95,'#685539');v.lid=box('supplies-lid',-4,.84,2,1.3,.2,1,'#b2945e');door(0,6.8);door(0,-6.8);
  }else if(map==='prisonbridge'){
   for(const z of [-ART_PROFILE.bridge.railZ,ART_PROFILE.bridge.railZ]){box('bridge-rail',0,.58,z,16,.12,.12,'#8a9187');for(let x=-7.5;x<8;x+=1.2)box('bridge-post',x,.35,z,.1,.7,.14,'#616e72');}
   for(const x of [-7.7,7.7]){box('tower-sill',x,.32,0,.75,.7,4.1,'#5d6c77');box('tower-back',x,1.8,1.8,.65,3.6,.5,'#435361');}
   v.tank=[picture('tank-head',-1.6,.4,3.2,3.7,ctx=>drawTankPart(ctx,'head'),64,64,2.1),picture('tank-body',-4,.4,3.8,3.4,ctx=>drawTankPart(ctx,'body'),64,64,1.6),picture('tank-wheel',-3.8,-.55,2.2,2.2,ctx=>drawTankPart(ctx,'wheel'),64,64,1)];
  }else if(map==='futuregate'){
   for(const b of TRIAL_SOLIDS.futuregate??[])box('rusted-machinery',b.x,.7,b.z,b.w,1.4,b.d,'#697776');
   for(const x of [-5.5,5.5])box('broken-rib',x,2.5,5.5,.35,5,.4,'#8b9286');box('sealed-door',0,1.4,6.7,3,2.8,.25,'#63747a');box('red-indicator',1.3,1.7,6.5,.14,.2,.05,'#b06957');
  }
  if(map==='cellblock'||map==='prisonstairs'){for(let i=0;i<2;i++)v.enemies.push(guard(i?1.4:-1.4,map==='cellblock'?-1.6:1.5));}
  if(map==='courtroom')v.staging=bindCourtStaging(root);
  root.setEnabled(false);return v;
 }
 function windowBounds(){
  const windowMesh=views.get('courtroom')?.window,camera=scene.activeCamera;if(!windowMesh?.isEnabled()||!camera)return null;
  windowMesh.computeWorldMatrix(true);const e=scene.getEngine(),viewport=camera.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight());
  const points=windowMesh.getBoundingInfo().boundingBox.vectorsWorld.map(v=>Vector3.Project(v,Matrix.Identity(),scene.getTransformMatrix(),viewport));
  return {left:Math.min(...points.map(v=>v.x))/e.getRenderWidth(),right:Math.max(...points.map(v=>v.x))/e.getRenderWidth(),top:Math.min(...points.map(v=>v.y))/e.getRenderHeight(),bottom:Math.max(...points.map(v=>v.y))/e.getRenderHeight()};
 }
 return {inspect:()=>({motion:motion.inspect(),courtStaging:views.get('courtroom')?.staging?.inspect()??null,forestGate:(()=>{const g=views.get('guardia1000')?.gate;return g?{name:g.name,visible:g.isEnabled()&&g.isVisible&&g.visibility>0,position:g.position.asArray(),rotation:g.rotation.asArray()}:null;})(),built:[...views.keys()],visible:[...views.entries()].filter(([,v])=>v.root.isEnabled()).map(([k])=>k),assetProfile:ART_PROFILE.id,tankFrame:views.get('prisonbridge')?.tankFrame??null,windowBounds:windowBounds(),npcTextureSize:WITNESS_SIZE,npcTextures:[...views.values()].filter(v=>v.root.isEnabled()).flatMap(v=>v.npcs).map(m=>({name:m.name,...((m.material as StandardMaterial).diffuseTexture?.getSize())}))}),draw(s:State,reducedMotion=false){
  if(trialMap(s.chapter)&&!views.has(s.chapter))views.set(s.chapter,build(s.chapter));
  for(const [map,v] of views){const on=map===s.chapter;v.root.setEnabled(on);if(!on)continue;
   v.enemies.forEach((m,i)=>{const e=s.enemies[i];m.setEnabled(s.mode==='battle'&&!!e&&e.hp>0);if(e)m.position.set(e.x,.95,e.z);});
   const tankFrame=tankVisualFrame(s.ticks,s.mode==='battle');
   v.tank.forEach((m,i)=>{const e=s.enemies[i];m.setEnabled(!s.trial.tankWon&&(s.mode!=='battle'||!!e&&e.hp>0));if(v.tankFrame!==tankFrame){const t=(m.material as StandardMaterial).diffuseTexture as DynamicTexture;drawTankPart(t.getContext() as CanvasRenderingContext2D,['head','body','wheel'][i] as 'head'|'body'|'wheel',tankFrame);t.update();}});v.tankFrame=tankFrame;
   v.guards.forEach(m=>m.setEnabled(map==='guardia1000'?s.trial.stage==='flight':map==='cellblock'?!s.trial.cellOpen:true));
   if(v.gate){v.gate.setEnabled(map==='guardia1000'?s.trial.stage==='flight':!s.trial.cellOpen);if(map==='guardia1000')v.gate.rotation.z=reducedMotion?0:s.ticks/180;}
   if(v.fritz)v.fritz.setEnabled(!s.trial.fritzFreed);
   if(v.marle)v.marle.setEnabled(s.trial.stage==='flight'&&!s.trial.marleJoined);
   const currentWitness=s.trial.hearing&&(s.trial.question===1||s.trial.question===2)?witnessScenes(s)[s.trial.hearing.heard-1]?.kind:null;
   v.witnesses.forEach((m,i)=>m.setEnabled(['girl','elder','merchant','shopper'][i]===currentWitness));
   if(v.parcel)v.parcel.setEnabled(jailGift(s)>0&&!s.trial.hearing?.giftTaken);
   if(v.lid)v.lid.rotation.z=s.trial.suppliesTaken?-.6:0;
  }
  motion.draw(s.ticks,reducedMotion);
  views.get('courtroom')?.staging?.draw();
 }};
}
