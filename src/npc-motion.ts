import {DynamicTexture,Mesh,StandardMaterial} from '@babylonjs/core';
import {ambientFrame,MOTION_PROFILE} from './actor-motion';
import {drawWitness} from './witness-art';
import type {WitnessArtKind} from './witness-art';
/** Cache textures and repaint only changed poses; never relocate a quest actor. */
export class NpcMotion {
 private actors:{mesh:Mesh;kind:WitnessArtKind;frame:number;seed:number}[]=[];
 add(mesh:Mesh,kind:WitnessArtKind):Mesh{this.actors.push({mesh,kind,frame:-1,seed:this.actors.length});return mesh;}
 draw(ticks:number):void{
  for(const a of this.actors){if(!a.mesh.isEnabled())continue;const f=ambientFrame(ticks,a.seed);if(f===a.frame)continue;
   const tex=(a.mesh.material as StandardMaterial).diffuseTexture as DynamicTexture;
   drawWitness(tex.getContext() as CanvasRenderingContext2D,a.kind,f);tex.update();a.frame=f;
  }
 }
 inspect(){return {profile:MOTION_PROFILE,actors:this.actors.filter(a=>a.mesh.isEnabled()).map(a=>({name:a.mesh.name,kind:a.kind,frame:a.frame}))};}
}
