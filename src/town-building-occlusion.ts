import {Mesh,Ray,Scene,StandardMaterial,Vector3} from '@babylonjs/core';
import type {CameraSubject} from './early-camera-view';
import {fairOcclusionPoints} from './fair-occlusion-points';
import {EARLY_COMFORT,approachVisibility} from './early-comfort';

/** Existing Truce houses only; no mesh, texture, material, collision or state is created. */
export const TOWN_BUILDING_OCCLUSION=Object.freeze({id:'vq03a-town-building-visibility',visibility:.16,holdTicks:12,approved:false});
const parts=new Set(['truce-stone-plinth','truce-plaster','truce-timber','truce-crossbeam','truce-lintel','truce-pitched-roof','truce-roof-course','truce-ridge','truce-door','truce-window','truce-glass','truce-mullion','truce-chimney']);
type Group={id:string;anchor:Mesh;members:{mesh:Mesh;visibility:number}[];value:number;lastHit:number;blockedBy:string[];min:Vector3;max:Vector3};
export class TownBuildingOcclusion {
 private groups:Group[]=[];
 private tick:number|null=null;
 private active=false;
 private reduced=false;
 private subjects:string[]=[];
 private tests=0;
 constructor(private readonly scene:Scene){scene.onDisposeObservable.add(()=>this.reset());}
 reset():void{
  for(const g of this.groups){for(const p of g.members)if(!p.mesh.isDisposed())p.mesh.visibility=p.visibility;g.value=1;g.lastHit=-Infinity;g.blockedBy=[];}
  this.tick=null;this.active=false;this.reduced=false;this.subjects=[];this.tests=0;
 }
 private collect():void{
  this.reset();this.groups=[];
  const anchors=this.scene.meshes.filter((m):m is Mesh=>m instanceof Mesh&&m.name==='truce-plaster'&&m.parent?.name==='kingdom-truce'&&!m.isDisposed());
  const candidates=this.scene.meshes.filter((m):m is Mesh=>m instanceof Mesh&&parts.has(m.name)&&m.parent?.name==='kingdom-truce'&&!m.isDisposed()&&m.material instanceof StandardMaterial);
  for(const anchor of anchors){
   const members=candidates.filter(m=>anchors.reduce((near,a)=>Vector3.DistanceSquared(m.position,a.position)<Vector3.DistanceSquared(m.position,near.position)?a:near,anchors[0]!)===anchor).map(mesh=>({mesh,visibility:mesh.visibility}));
   const min=new Vector3(Infinity,Infinity,Infinity),max=new Vector3(-Infinity,-Infinity,-Infinity);
   for(const {mesh} of members){mesh.computeWorldMatrix(true);const b=mesh.getBoundingInfo().boundingBox;min.minimizeInPlace(b.minimumWorld);max.maximizeInPlace(b.maximumWorld);}
   this.groups.push({id:`truce-house:${anchor.position.x},${anchor.position.z}`,anchor,members,value:1,lastHit:-Infinity,blockedBy:[],min,max});
  }
 }
 update(ticks:number,chapter:string,subjects:readonly CameraSubject[],reducedMotion=false):void{
  const camera=this.scene.activeCamera;
  if(chapter!=='truce'||!Number.isSafeInteger(ticks)||ticks<0||!camera){this.reset();return;}
  if(!this.groups.length||this.groups.some(g=>g.anchor.isDisposed()||g.members.some(p=>p.mesh.isDisposed())))this.collect();
  if(this.tick!==null&&ticks<this.tick)this.reset();
  const initial=this.tick===null,elapsed=initial?0:ticks-this.tick!;
  this.tick=ticks;this.active=true;this.reduced=reducedMotion;this.tests=0;this.subjects=[];
  const forward=camera.getDirection(Vector3.Forward()).normalize(),seen=new Set<string>();
  const rays:{id:string;rays:Ray[]}[]=[];
  for(const subject of subjects){
   if(!['p0','p1','guest'].includes(subject.id)||seen.has(subject.id))continue;
   seen.add(subject.id);const points=fairOcclusionPoints([subject]);if(!points.length)continue;
   this.subjects.push(subject.id);rays.push({id:subject.id,rays:points.map(p=>new Ray(p.subtract(forward.scale(64)),forward,63.98))});
  }
  for(const g of this.groups){
   g.blockedBy=[];
   if(!g.anchor.isEnabled()||!g.anchor.isVisible){for(const p of g.members)p.mesh.visibility=p.visibility;g.value=1;g.lastHit=-Infinity;continue;}
   for(const actor of rays){
    let hit=false;
    for(const ray of actor.rays){
     if(!ray.intersectsBoxMinMax(g.min,g.max))continue;
     for(const p of g.members){if(!p.mesh.isEnabled()||!p.mesh.isVisible||p.visibility<=0)continue;this.tests++;const pick=ray.intersectsMesh(p.mesh,false);if(pick.hit&&pick.distance>0&&pick.distance<ray.length){hit=true;break;}}
     if(hit)break;
    }
    if(hit)g.blockedBy.push(actor.id);
   }
   if(g.blockedBy.length)g.lastHit=ticks;
   const target=g.blockedBy.length||ticks-g.lastHit<TOWN_BUILDING_OCCLUSION.holdTicks?TOWN_BUILDING_OCCLUSION.visibility:1;
   const fadeElapsed=target===1?Math.max(0,ticks-Math.max(ticks-elapsed,g.lastHit+TOWN_BUILDING_OCCLUSION.holdTicks)):elapsed;
   g.value=initial||reducedMotion?target:approachVisibility(g.value,target,fadeElapsed);
   // These existing opaque StandardMaterials use per-mesh visibility to blend.
   // Do not edit their shared alpha, texture, transparency mode or ownership.
   for(const p of g.members)p.mesh.visibility=p.visibility*g.value;
  }
 }
 inspect(){return {profile:TOWN_BUILDING_OCCLUSION.id,active:this.active,tick:this.tick,subjects:[...this.subjects],reducedMotion:this.reduced,method:'parallel-orthographic-triangle-rays',meshRayTests:this.tests,fadeTicks:EARLY_COMFORT.fadeTicks,holdTicks:TOWN_BUILDING_OCCLUSION.holdTicks,approved:false,
  groups:this.groups.map(g=>({id:g.id,owner:'kingdom-truce',visibility:g.value,blockedBy:[...g.blockedBy],members:g.members.map(p=>({name:p.mesh.name,position:p.mesh.position.asArray(),visibility:p.mesh.visibility,originalVisibility:p.visibility,blend:!!(p.mesh.material as StandardMaterial).needAlphaBlendingForMesh(p.mesh)}))}))};}
}
