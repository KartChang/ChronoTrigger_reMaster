import {DynamicTexture,Mesh,StandardMaterial,Scene} from '@babylonjs/core';
import {ambientFrame} from './actor-motion';
import {drawStoryNpc,STORY_NPC_ART} from './story-npc-art';
import type {StoryNpcKind} from './story-npc-art';
/** One mutable texture per existing NPC; no timer, state mutation or moving plane. */
export class StoryNpcMotion {
 private actors:{mesh:Mesh;kind:StoryNpcKind;frame:number;seed:number;uploads:number}[]=[];
 constructor(scene:Scene){scene.onDisposeObservable.addOnce(()=>{this.actors=[];});}
 add(mesh:Mesh,kind:StoryNpcKind):Mesh{
  if(this.actors.some(a=>a.mesh===mesh))throw new Error('Duplicate story NPC binding');
  const tex=(mesh.material as StandardMaterial)?.diffuseTexture as DynamicTexture;
  const size=tex?.getSize();if(size?.width!==STORY_NPC_ART.width||size.height!==STORY_NPC_ART.height)throw new Error('Story NPC cell mismatch');
  this.actors.push({mesh,kind,frame:0,seed:this.actors.length,uploads:0});return mesh;
 }
 draw(ticks:number):void{
  for(const a of this.actors){if(a.mesh.isDisposed()||!a.mesh.isEnabled())continue;
   const frame=ambientFrame(ticks,a.seed);if(frame===a.frame)continue;
   const tex=(a.mesh.material as StandardMaterial).diffuseTexture as DynamicTexture;
   drawStoryNpc(tex.getContext() as CanvasRenderingContext2D,a.kind,frame);tex.update();a.frame=frame;a.uploads++;
  }
 }
 inspect(){return {profile:STORY_NPC_ART.id,approved:false,actors:this.actors.filter(a=>!a.mesh.isDisposed()&&a.mesh.isEnabled()).map(a=>({name:a.mesh.name,kind:a.kind,frame:a.frame,uploads:a.uploads,cell:{...((a.mesh.material as StandardMaterial).diffuseTexture as DynamicTexture).getSize()}}))};}
}
