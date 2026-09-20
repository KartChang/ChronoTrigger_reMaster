import {Mesh,Ray,Scene,Vector3} from '@babylonjs/core';
import {EARLY_COMFORT,approachVisibility} from './early-comfort';
import type {Observer} from '@babylonjs/core';
/** Only explicit art-kit groups can fade. Never changes shared material alpha, actor state or collision data. */
type Entry={mesh:Mesh;original:number};
type Group={id:string;entries:Entry[];visibility:number;lastHit:number;blocked:boolean};
export class EarlyOcclusion {
 private groups=new Map<string,Group>();
 private dirty=true;
 private meshCount=-1;
 private lastTicks:number|null=null;
 private chapter='';
 private observer:Observer<import('@babylonjs/core').AbstractMesh>;
 private tests=0;
 private samples=0;
 constructor(private scene:Scene){this.observer=scene.onNewMeshAddedObservable.add(()=>{this.dirty=true;});}
 private discover(){
  if(!this.dirty&&this.meshCount===this.scene.meshes.length)return;this.dirty=false;this.meshCount=this.scene.meshes.length;
  for(const mesh of this.scene.meshes){
   if(!(mesh instanceof Mesh)||mesh.metadata?.artKit!=='vq01')continue;
   const id=mesh.metadata?.occlusionGroup;
   if(typeof id!=='string'||!id||mesh.metadata?.gameCollision!==false)continue;
   let g=this.groups.get(id);if(!g){g={id,entries:[],visibility:1,lastHit:-Infinity,blocked:false};this.groups.set(id,g);}
   if(!g.entries.some(e=>e.mesh===mesh))g.entries.push({mesh,original:mesh.visibility});
  }
 }
 reset(){for(const g of this.groups.values()){for(const e of g.entries)if(!e.mesh.isDisposed())e.mesh.visibility=e.original;g.visibility=1;g.lastHit=-Infinity;g.blocked=false;}this.lastTicks=null;}
 update(ticks:number,chapter:string,forward:Vector3,points:readonly Vector3[]){
  this.discover();this.tests=0;this.samples=points.length;
  const invalid=!Number.isFinite(ticks)||ticks<0||![forward.x,forward.y,forward.z].every(Number.isFinite)||forward.lengthSquared()<.5;
  if(invalid||!EARLY_COMFORT.chapters.includes(chapter)){this.reset();this.chapter=chapter;return;}
  if(this.chapter!==chapter||this.lastTicks!==null&&ticks<this.lastTicks)this.reset();
  this.chapter=chapter;const initial=this.lastTicks===null,elapsed=initial?0:ticks-this.lastTicks!;this.lastTicks=ticks;
  const direction=forward.normalizeToNew();
  // Orthographic rays must be parallel. Camera-position-to-actor rays would falsely converge.
  const rays=points.filter(p=>[p.x,p.y,p.z].every(Number.isFinite)).map(p=>new Ray(p.subtract(direction.scale(64)),direction,63.98));
  for(const [id,g] of this.groups){
   g.entries=g.entries.filter(e=>!e.mesh.isDisposed());if(!g.entries.length){this.groups.delete(id);continue;}
   const visible=g.entries.filter(e=>e.mesh.isEnabled()&&e.mesh.isVisible);
   if(!visible.length){g.visibility=1;g.lastHit=-Infinity;g.blocked=false;for(const e of g.entries)e.mesh.visibility=e.original;continue;}
   let hit=false;
   for(const e of visible){
    // Called before scene.render: force the current transform even within the same render id.
    e.mesh.computeWorldMatrix(true);
    for(const ray of rays){this.tests++;const pick=ray.intersectsMesh(e.mesh,false);if(pick.hit&&pick.distance>0&&pick.distance<ray.length){hit=true;break;}}
    if(hit)break;
   }
   g.blocked=hit;if(hit)g.lastHit=ticks;
   const target=hit||ticks-g.lastHit<EARLY_COMFORT.clearHoldTicks?EARLY_COMFORT.fadeVisibility:1;
   const fadeElapsed=target===1?Math.max(0,ticks-Math.max(ticks-elapsed,g.lastHit+EARLY_COMFORT.clearHoldTicks)):elapsed;
   g.visibility=initial?target:approachVisibility(g.visibility,target,fadeElapsed);
   for(const e of g.entries)e.mesh.visibility=e.original*g.visibility;
  }
 }
 inspect(){return {profile:EARLY_COMFORT.id,method:'parallel-orthographic-triangle-rays',tick:this.lastTicks,samples:this.samples,meshRayTests:this.tests,
  groups:[...this.groups.values()].filter(g=>g.entries.some(e=>e.mesh.isEnabled())).map(g=>({id:g.id,blocked:g.blocked,visibility:g.visibility,meshes:g.entries.length})),approved:false};}
 dispose(){this.reset();this.scene.onNewMeshAddedObservable.remove(this.observer);this.groups.clear();}
}
