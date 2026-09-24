import {DynamicTexture,Mesh,StandardMaterial,Scene} from '@babylonjs/core';
import {ambientFrame,MOTION_PROFILE} from './actor-motion';
import {drawWitness,WITNESS_SIZE} from './witness-art';
import type {WitnessArtKind} from './witness-art';
/** Borrow each existing NPC texture; release bindings, never relocate quest actors. */
export class NpcMotion {
 private reducedMotion=false;
 private lastTick:number|null=null;
 private nextSeed=0;
 private actors:{mesh:Mesh;kind:WitnessArtKind;frame:number;seed:number;uploads:number}[]=[];
 constructor(private readonly scene:Scene){scene.onDisposeObservable.addOnce(()=>{this.actors=[];});}
 add(mesh:Mesh,kind:WitnessArtKind):Mesh{
  if(this.scene.isDisposed||mesh.isDisposed()||mesh.getScene()!==this.scene)throw new Error('Invalid witness scene ownership');
  if(this.actors.some(a=>a.mesh===mesh))throw new Error('Duplicate witness binding');
  const tex=(mesh.material as StandardMaterial)?.diffuseTexture as DynamicTexture;
  if(!(tex instanceof DynamicTexture)||tex.getSize().width!==WITNESS_SIZE.w||tex.getSize().height!==WITNESS_SIZE.h)throw new Error('Witness cell mismatch');
  if(this.actors.some(a=>(a.mesh.material as StandardMaterial)?.diffuseTexture===tex))throw new Error('Witness texture must be private');
  this.actors.push({mesh,kind,frame:-1,seed:this.nextSeed++,uploads:0});
  // Keep surviving stagger phases stable when another mesh is removed.
  mesh.onDisposeObservable.addOnce(()=>{this.actors=this.actors.filter(a=>a.mesh!==mesh);});
  return mesh;
 }
 draw(ticks:number,reducedMotion=false):void{
  if(!Number.isSafeInteger(ticks)||ticks<0||typeof reducedMotion!=='boolean')throw new Error('Invalid witness presentation input');
  this.reducedMotion=reducedMotion;this.lastTick=ticks;
  for(const a of this.actors){if(a.mesh.isDisposed()||!a.mesh.isEnabled()||!a.mesh.isVisible||a.mesh.visibility<=0)continue;
   const f=reducedMotion?0:ambientFrame(ticks,a.seed);if(f===a.frame)continue;
   const tex=(a.mesh.material as StandardMaterial).diffuseTexture as DynamicTexture;
   drawWitness(tex.getContext() as CanvasRenderingContext2D,a.kind,f);tex.update();a.frame=f;a.uploads++;
  }
 }
 inspect(){return {profile:MOTION_PROFILE,motion:{profile:'vq03f-witness-motion-preference',clock:'simulation-ticks',tick:this.lastTick,reducedMotion:this.reducedMotion,bindingCount:this.actors.length,stateMutation:false},actors:this.actors.filter(a=>!a.mesh.isDisposed()&&a.mesh.isEnabled()&&a.mesh.isVisible&&a.mesh.visibility>0).map(a=>({name:a.mesh.name,kind:a.kind,seed:a.seed,frame:a.frame,uploads:a.uploads,cell:{...((a.mesh.material as StandardMaterial).diffuseTexture as DynamicTexture).getSize()}}))};}
}
