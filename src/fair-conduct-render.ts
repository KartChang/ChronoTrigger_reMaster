import {NpcMotion} from './npc-motion';
import {Scene,Mesh,MeshBuilder,TransformNode,StandardMaterial,DynamicTexture,Texture,Material} from '@babylonjs/core';
import type {State} from './core';
import {conductActive} from './fair-conduct';
import {CONDUCT_POINTS} from './fair-conduct-data';
import {drawWitness,drawFairProp,WITNESS_SIZE} from './witness-art';
/** Visual witnesses read real conduct state; rendering never grants quest completion. */
export function buildFairConduct(scene:Scene,parent:TransformNode){
 const motion=new NpcMotion();
 const root=new TransformNode('fair-conduct',scene);root.parent=parent;
 const sprite=(id:string,x:number,z:number,w:number,h:number,pixels:number,draw:(c:CanvasRenderingContext2D)=>void)=>{
  const t=new DynamicTexture(id,{width:pixels,height:pixels===48?64:32},scene,false,Texture.NEAREST_SAMPLINGMODE);t.hasAlpha=true;draw(t.getContext() as CanvasRenderingContext2D);t.update();
  const m=new StandardMaterial(id,scene);m.diffuseTexture=t;m.emissiveTexture=t;m.disableLighting=true;m.backFaceCulling=false;m.useAlphaFromDiffuseTexture=true;m.transparencyMode=Material.MATERIAL_ALPHATEST;
  const mesh=MeshBuilder.CreatePlane(id,{width:w,height:h},scene);mesh.parent=root;mesh.material=m;mesh.billboardMode=Mesh.BILLBOARDMODE_ALL;mesh.position.set(x,h/2+.08,z);return {mesh,texture:t};
 };
 const {girl,cat,lunch,merchant}=CONDUCT_POINTS;
 motion.add(sprite('fair-cat-owner',girl.x,girl.z,1.12,1.55,WITNESS_SIZE.w,c=>drawWitness(c,'girl')).mesh,'girl');
 motion.add(sprite('fair-lunch-owner',lunch.x-1.5,lunch.z,1.36,1.85,WITNESS_SIZE.w,c=>drawWitness(c,'elder')).mesh,'elder');
 motion.add(sprite('fair-melchior',merchant.x,merchant.z,1.36,1.85,WITNESS_SIZE.w,c=>drawWitness(c,'merchant')).mesh,'merchant');
 const catSprite=sprite('fair-following-cat',cat.x,cat.z,.65,.65,32,c=>drawFairProp(c,'cat'));
 const meal=sprite('fair-lunch',lunch.x,lunch.z,.85,.75,32,c=>drawFairProp(c,'lunch'));let catFrame=-1;
 const text=new DynamicTexture('fair-conduct-label',{width:512,height:64},scene,false);text.hasAlpha=true;
 const mat=new StandardMaterial('fair-conduct-label',scene);mat.diffuseTexture=text;mat.emissiveTexture=text;mat.opacityTexture=text;mat.disableLighting=true;mat.backFaceCulling=false;
 const label=MeshBuilder.CreatePlane('fair-conduct-label',{width:3.8,height:.48},scene);label.material=mat;label.parent=root;label.billboardMode=Mesh.BILLBOARDMODE_ALL;let lastLabel='';
 root.setEnabled(false);
 return {inspect:()=>motion.inspect(),draw(s:State){
  const c=s.prologue.conduct,on=conductActive(s);root.setEnabled(on);if(!on||!c)return;motion.draw(s.ticks);
  meal.mesh.setEnabled(!c.lunchEaten);catSprite.mesh.position.set(c.cat.x,.40,c.cat.z);catSprite.mesh.scaling.x=c.cat.facing===3?-1:1;
  const frame=c.cat.following?Math.floor(s.ticks/18)%2:0;if(frame!==catFrame){drawFairProp(catSprite.texture.getContext() as CanvasRenderingContext2D,'cat',frame);catSprite.texture.update();catFrame=frame;}
  const near=Object.entries(CONDUCT_POINTS).map(([key,p])=>({key,p,d:Math.hypot(s.players[0].x-p.x,s.players[0].z-p.z)})).filter(x=>x.d<1.8&&(x.key!=='cat'||!c.cat.following&&!c.catReturned)).sort((a,b)=>a.d-b.d)[0];
  const names:Record<string,string>={girl:'小女孩 · E',cat:'小貓 · E',lunch:'午餐 · E',merchant:'梅爾基奧 · E',candy:c.candy==='waiting'?'稍等，讓瑪兒挑選……':'糖果攤 · E'};
  label.setEnabled(!!near&&s.mode==='explore'&&!s.prologue.choice);
  if(near){const caption=names[near.key]!;if(caption!==lastLabel){lastLabel=caption;const ctx=text.getContext() as CanvasRenderingContext2D;ctx.clearRect(0,0,512,64);ctx.font='bold 26px sans-serif';ctx.textAlign='center';ctx.fillStyle='#f6e4b3';ctx.shadowColor='#102436';ctx.shadowBlur=5;ctx.fillText(caption,256,42);text.update();}label.position.set(near.p.x,2.3,near.p.z);}
 }};
}
