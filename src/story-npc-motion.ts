import {DynamicTexture,Mesh,StandardMaterial,Scene} from '@babylonjs/core';
import {ambientFrame} from './actor-motion';
import {drawStoryNpc,STORY_NPC_ART} from './story-npc-art';
import type {StoryNpcKind} from './story-npc-art';
/** One mutable texture per existing NPC; no timer, state mutation or moving plane. */
export class StoryNpcMotion {
 private reducedMotion=false;
 private lastTick:number|null=null;
 private nextSeed=0;
 private actors:{mesh:Mesh;kind:StoryNpcKind;frame:number;seed:number;uploads:number}[]=[];
 constructor(private readonly scene:Scene){scene.onDisposeObservable.addOnce(()=>{this.actors=[];});}
 add(mesh:Mesh,kind:StoryNpcKind):Mesh{
  if(this.scene.isDisposed||mesh.isDisposed()||mesh.getScene()!==this.scene)throw new Error('Invalid NPC scene ownership');
  if(this.actors.some(a=>a.mesh===mesh))throw new Error('Duplicate story NPC binding');
  const tex=(mesh.material as StandardMaterial)?.diffuseTexture as DynamicTexture;
  const size=tex?.getSize();if(size?.width!==STORY_NPC_ART.width||size.height!==STORY_NPC_ART.height)throw new Error('Story NPC cell mismatch');
  if(this.actors.some(a=>(a.mesh.material as StandardMaterial)?.diffuseTexture===tex))throw new Error('NPC texture must be private');
  this.actors.push({mesh,kind,frame:0,seed:this.nextSeed++,uploads:0});
  // Release references at disposal without renumbering still-live stagger seeds.
  mesh.onDisposeObservable.addOnce(()=>{this.actors=this.actors.filter(a=>a.mesh!==mesh);});
  return mesh;
 }
 draw(ticks:number,reducedMotion=false):void{
  if(!Number.isSafeInteger(ticks)||ticks<0||typeof reducedMotion!=='boolean')throw new Error('Invalid NPC presentation input');
  this.reducedMotion=reducedMotion;this.lastTick=ticks;
  for(const a of this.actors){if(a.mesh.isDisposed()||!a.mesh.isEnabled()||!a.mesh.isVisible||a.mesh.visibility<=0)continue;
   const frame=reducedMotion?0:ambientFrame(ticks,a.seed);if(frame===a.frame)continue;
   const tex=(a.mesh.material as StandardMaterial).diffuseTexture as DynamicTexture;
   drawStoryNpc(tex.getContext() as CanvasRenderingContext2D,a.kind,frame);tex.update();a.frame=frame;a.uploads++;
  }
 }
 inspect(){return {profile:STORY_NPC_ART.id,approved:false,motion:{profile:'vq03e-npc-motion-preference',clock:'simulation-ticks',tick:this.lastTick,reducedMotion:this.reducedMotion,bindingCount:this.actors.length,stateMutation:false},actors:this.actors.filter(a=>!a.mesh.isDisposed()&&a.mesh.isEnabled()&&a.mesh.isVisible&&a.mesh.visibility>0).map(a=>({name:a.mesh.name,kind:a.kind,seed:a.seed,frame:a.frame,uploads:a.uploads,cell:{...((a.mesh.material as StandardMaterial).diffuseTexture as DynamicTexture).getSize()}}))};}
}
