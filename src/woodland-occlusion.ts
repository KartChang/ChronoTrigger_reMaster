import {DynamicTexture,Material,Mesh,Ray,Scene,StandardMaterial,Texture,Vector3,VertexBuffer} from '@babylonjs/core';
import type {CameraSubject} from './early-camera-view';
import {EARLY_COMFORT,approachVisibility} from './early-comfort';

/** Existing private oak billboards only. No new meshes/textures or game-state writes. */
export const WOODLAND_OCCLUSION=Object.freeze({id:'vq03d-woodland-actor-visibility',visibility:.30,holdTicks:12,maxTrees:16,samplesPerActor:12,approved:false});
type Hit={id:string;sample:number;uv:number[];pixel:number[];alpha:number;distance:number};
type Entry={mesh:Mesh;material:StandardMaterial;texture:DynamicTexture;alpha:Uint8Array;invertY:boolean;originalVisibility:number;originalMode:number|null;value:number;lastHit:number;hits:Hit[]};
/** Foot, shin, chest and head rows of the current real billboard after camera framing. */
export function woodlandActorPoints(subject:CameraSubject):Vector3[]{
 const mesh=subject.mesh;
 if(!mesh.isEnabled()||!mesh.isVisible||mesh.visibility<=0)return [];
 const p=mesh.getVerticesData(VertexBuffer.PositionKind);
 if(!p||p.length<9||!Array.from(p).every(Number.isFinite))return [];
 let left=Infinity,right=-Infinity,bottom=Infinity,top=-Infinity,front=Infinity,back=-Infinity;
 for(let i=0;i+2<p.length;i+=3){left=Math.min(left,p[i]!);right=Math.max(right,p[i]!);bottom=Math.min(bottom,p[i+1]!);top=Math.max(top,p[i+1]!);front=Math.min(front,p[i+2]!);back=Math.max(back,p[i+2]!);}
 if(!(right>left&&top>bottom))return [];
 const world=mesh.computeWorldMatrix(true),result:Vector3[]=[];
 for(const x of [.28,.5,.72])for(const y of [.055,.22,.5,.85]){
  const q=Vector3.TransformCoordinates(new Vector3(left+(right-left)*x,bottom+(top-bottom)*y,(front+back)/2),world);
  if([q.x,q.y,q.z].every(Number.isFinite))result.push(q);
 }
 return result;
}
export class WoodlandOcclusion {
 private entries=new Map<Mesh,Entry>();
 private meshCount=-1;
 private tick:number|null=null;
 private chapter='';
 private active=false;
 private reduced=false;
 private tests=0;
 private alphaTests=0;
 private subjects:string[]=[];
 constructor(private readonly scene:Scene){scene.onDisposeObservable.add(()=>this.dispose());}
 private restore(e:Entry):void{if(!e.mesh.isDisposed()){e.mesh.visibility=e.originalVisibility;e.material.transparencyMode=e.originalMode;}e.value=1;e.lastHit=-Infinity;e.hits=[];}
 reset():void{for(const e of this.entries.values())this.restore(e);this.tick=null;this.active=false;this.tests=0;this.alphaTests=0;this.subjects=[];}
 dispose():void{this.reset();this.entries.clear();this.meshCount=-1;}
 private discover():void{
  if(this.meshCount===this.scene.meshes.length)return;
  this.meshCount=this.scene.meshes.length;
  for(const [mesh] of this.entries)if(mesh.isDisposed())this.entries.delete(mesh);
  for(const mesh of this.scene.meshes){
   if(this.entries.size>=WOODLAND_OCCLUSION.maxTrees)break;
   if(!(mesh instanceof Mesh)||mesh.name!=='oak'||!['kingdom-truce','kingdom-forest'].includes(mesh.parent?.name??'')||this.entries.has(mesh))continue;
   const material=mesh.material;
   if(!(material instanceof StandardMaterial)||this.scene.meshes.some(m=>m!==mesh&&m.material===material))continue;
   const texture=material.diffuseTexture;
   if(!(texture instanceof DynamicTexture)||material.emissiveTexture!==texture||!texture.hasAlpha||texture.samplingMode!==Texture.NEAREST_SAMPLINGMODE)continue;
   const size=texture.getSize();if(size.width!==64||size.height!==80)continue;
   const pixels=texture.getContext().getImageData(0,0,64,80).data,alpha=new Uint8Array(64*80);
   for(let i=0;i<alpha.length;i++)alpha[i]=pixels[i*4+3]!;
   this.entries.set(mesh,{mesh,material,texture,alpha,invertY:texture.invertY,originalVisibility:mesh.visibility,originalMode:material.transparencyMode,value:1,lastHit:-Infinity,hits:[]});
  }
 }
 update(ticks:number,chapter:string,subjects:readonly CameraSubject[],reducedMotion=false):void{
  const camera=this.scene.activeCamera;
  if(!['truce','forest'].includes(chapter)||!Number.isSafeInteger(ticks)||ticks<0||!camera){this.reset();this.chapter=chapter;return;}
  this.discover();
  if(this.chapter!==chapter||this.tick!==null&&ticks<this.tick)this.reset();
  const initial=this.tick===null,elapsed=initial?0:ticks-this.tick!;
  this.tick=ticks;this.chapter=chapter;this.active=true;this.reduced=reducedMotion;this.tests=0;this.alphaTests=0;this.subjects=[];
  const forward=camera.getDirection(Vector3.Forward()).normalize(),seen=new Set<string>();
  const actors:{id:string;rays:Ray[]}[]=[];
  for(const subject of subjects){
   if(!['p0','p1','guest'].includes(subject.id)||seen.has(subject.id))continue;
   seen.add(subject.id);const points=woodlandActorPoints(subject);if(!points.length)continue;
   this.subjects.push(subject.id);actors.push({id:subject.id,rays:points.map(p=>new Ray(p.subtract(forward.scale(64)),forward,63.98))});
  }
  for(const e of this.entries.values()){
   const {mesh,material}=e;e.hits=[];
   if(mesh.isDisposed()||mesh.parent?.name!=='kingdom-'+chapter||!mesh.isEnabled()||!mesh.isVisible||mesh.material!==material){this.restore(e);continue;}
   mesh.computeWorldMatrix(true);
   for(const actor of actors)for(const [sample,ray] of actor.rays.entries()){
    this.tests++;const pick=ray.intersectsMesh(mesh,false);
    if(!pick.hit||pick.distance<=0||pick.distance>=ray.length)continue;
    const uv=pick.getTextureCoordinates();if(!uv||![uv.x,uv.y].every(Number.isFinite)||uv.x<0||uv.x>1||uv.y<0||uv.y>1)continue;
    // Match the unchanged nearest, clamped 64x80 authored alpha. Empty corners
    // of a rectangular billboard must not make a tree fade beside the player.
    const x=Math.min(63,Math.floor(uv.x*64)),y=Math.min(79,Math.floor((e.invertY?1-uv.y:uv.y)*80)),alpha=e.alpha[y*64+x]!;
    this.alphaTests++;if(alpha<128)continue;
    e.hits.push({id:actor.id,sample,uv:uv.asArray(),pixel:[x,y],alpha,distance:pick.distance});break;
   }
   if(e.hits.length)e.lastHit=ticks;
   const target=e.hits.length||ticks-e.lastHit<WOODLAND_OCCLUSION.holdTicks?WOODLAND_OCCLUSION.visibility:1;
   const fadeElapsed=target===1?Math.max(0,ticks-Math.max(ticks-elapsed,e.lastHit+WOODLAND_OCCLUSION.holdTicks)):elapsed;
   e.value=initial||reducedMotion?target:approachVisibility(e.value,target,fadeElapsed);
   mesh.visibility=e.originalVisibility*e.value;
   material.transparencyMode=e.value<1?Material.MATERIAL_ALPHABLEND:e.originalMode;
  }
 }
 inspect(){return {profile:WOODLAND_OCCLUSION.id,active:this.active,chapter:this.chapter,tick:this.tick,subjects:[...this.subjects],reducedMotion:this.reduced,
  method:'parallel-rays-nearest-authored-alpha',samplesPerActor:WOODLAND_OCCLUSION.samplesPerActor,meshRayTests:this.tests,alphaTests:this.alphaTests,
  cachedTrees:this.entries.size,alphaMaskBytes:[...this.entries.values()].reduce((n,e)=>n+e.alpha.byteLength,0),fadeTicks:EARLY_COMFORT.fadeTicks,holdTicks:WOODLAND_OCCLUSION.holdTicks,approved:false,
  groups:[...this.entries.values()].filter(e=>!e.mesh.isDisposed()&&e.mesh.isEnabled()&&e.mesh.parent?.name==='kingdom-'+this.chapter).map(e=>({name:e.mesh.name,owner:e.mesh.parent!.name,position:e.mesh.position.asArray(),scale:e.mesh.scaling.asArray(),cell:e.texture.getSize(),sampling:e.texture.samplingMode,alpha:e.texture.hasAlpha,
   visibility:e.value,meshVisibility:e.mesh.visibility,originalVisibility:e.originalVisibility,materialMode:e.material.transparencyMode,originalMaterialMode:e.originalMode,
   blockedBy:e.hits.map(h=>h.id),hits:e.hits.map(h=>({...h,uv:[...h.uv],pixel:[...h.pixel]}))}))};}
}
