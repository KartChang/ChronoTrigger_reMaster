import {Material,Mesh,Ray,Scene,StandardMaterial,Vector3} from '@babylonjs/core';
import type {CameraSubject} from './early-camera-view';
import {fairOcclusionPoints} from './fair-occlusion-points';
import {EARLY_COMFORT,approachVisibility} from './early-comfort';

/** Existing inn sign only. Authored pixels, geometry and all game rules stay untouched. */
export const TOWN_SIGN_OCCLUSION=Object.freeze({id:'vq02z-inn-actor-visibility',visibility:.30,holdTicks:12,approved:false});
export class TownSignOcclusion {
 private sign:Mesh|null=null;
 private material:StandardMaterial|null=null;
 private originalVisibility=1;
 private originalMode:number|null=null;
 private value=1;
 private tick:number|null=null;
 private lastHit=-Infinity;
 private active=false;
 private reduced=false;
 private blockedBy:string[]=[];
 private tests=0;
 private subjects:string[]=[];
 constructor(private readonly scene:Scene){scene.onDisposeObservable.add(()=>this.reset());}
 reset():void{
  if(this.sign&&!this.sign.isDisposed())this.sign.visibility=this.originalVisibility;
  if(this.material)this.material.transparencyMode=this.originalMode;
  this.value=1;this.tick=null;this.lastHit=-Infinity;this.active=false;this.reduced=false;this.blockedBy=[];this.subjects=[];this.tests=0;
 }
 update(ticks:number,chapter:string,subjects:readonly CameraSubject[],reducedMotion=false):void{
  this.tests=0;this.blockedBy=[];this.subjects=[];
  const camera=this.scene.activeCamera,mesh=this.scene.getMeshByName('inn-sign');
  if(chapter!=='truce'||!Number.isSafeInteger(ticks)||ticks<0||!camera||!(mesh instanceof Mesh)||mesh.parent?.name!=='kingdom-truce'||!mesh.isEnabled()||!mesh.isVisible){this.reset();return;}
  const material=mesh.material;
  // The sign owns its material. Never fade a shared surface or an unrelated map.
  if(!(material instanceof StandardMaterial)||this.scene.meshes.some(m=>m!==mesh&&m.material===material)){this.reset();return;}
  if(this.sign!==mesh||this.material!==material){this.reset();this.sign=mesh;this.material=material;this.originalVisibility=mesh.visibility;this.originalMode=material.transparencyMode;}
  if(this.tick!==null&&ticks<this.tick)this.reset();
  const initial=this.tick===null,elapsed=initial?0:ticks-this.tick!;
  this.tick=ticks;this.active=true;this.reduced=reducedMotion;
  const forward=camera.getDirection(Vector3.Forward()).normalize();
  mesh.computeWorldMatrix(true);
  // Parallel rays end just in front of actual billboard head/chest samples.
  // A sign behind the actor, or one beside their silhouette, must stay opaque.
  const seen=new Set<string>();
  for(const subject of subjects){
   if(!['p0','p1','guest'].includes(subject.id)||seen.has(subject.id))continue;
   seen.add(subject.id);
   const points=fairOcclusionPoints([subject]);if(!points.length)continue;
   this.subjects.push(subject.id);let hit=false;
   for(const p of points){
    const ray=new Ray(p.subtract(forward.scale(64)),forward,63.98);this.tests++;
    const pick=ray.intersectsMesh(mesh,false);
    if(pick.hit&&pick.distance>0&&pick.distance<ray.length){hit=true;break;}
   }
   if(hit)this.blockedBy.push(subject.id);
  }
  if(this.blockedBy.length)this.lastHit=ticks;
  const target=this.blockedBy.length||ticks-this.lastHit<TOWN_SIGN_OCCLUSION.holdTicks?TOWN_SIGN_OCCLUSION.visibility:1;
  const fadeElapsed=target===1?Math.max(0,ticks-Math.max(ticks-elapsed,this.lastHit+TOWN_SIGN_OCCLUSION.holdTicks)):elapsed;
  this.value=initial||reducedMotion?target:approachVisibility(this.value,target,fadeElapsed);
  mesh.visibility=this.originalVisibility*this.value;
  // This private billboard was alpha-tested. Fading requires blending, otherwise
  // CPU and WebGL alpha-cutoff would discard the whole sign instead of revealing it.
  material.transparencyMode=this.value<1?Material.MATERIAL_ALPHABLEND:this.originalMode;
 }
 inspect(){return {profile:TOWN_SIGN_OCCLUSION.id,active:this.active,owner:this.active?'kingdom-truce/inn-sign':null,tick:this.tick,reducedMotion:this.reduced,
  method:'parallel-orthographic-triangle-rays',subjects:[...this.subjects],blockedBy:[...this.blockedBy],meshRayTests:this.tests,
  visibility:this.value,meshVisibility:this.active?this.sign!.visibility:null,originalVisibility:this.originalVisibility,
  materialMode:this.active?this.material!.transparencyMode:null,originalMaterialMode:this.originalMode,
  textureUnchanged:true,geometryUnchanged:true,fadeTicks:EARLY_COMFORT.fadeTicks,holdTicks:TOWN_SIGN_OCCLUSION.holdTicks,approved:false};}
}
