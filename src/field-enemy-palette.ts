import {Color3,DynamicTexture,Material,Mesh,StandardMaterial} from '@babylonjs/core';
import type {Camera} from '@babylonjs/core';
import {preservePixelPalette} from './pixel-presentation';
import {projectCameraSubjects} from './early-camera-view';

export const FIELD_ENEMY_ART=Object.freeze({id:'vq03c-field-enemy-palette',approved:false});
export type FieldEnemySprite={mesh:Mesh;material:StandardMaterial;texture:DynamicTexture};
type Original={disableLighting:boolean;emissiveTexture:StandardMaterial['emissiveTexture'];useEmissiveAsIllumination:boolean;linkEmissiveWithDiffuse:boolean;emissiveColor:Color3;specularColor:Color3;ambientColor:Color3};
/** Preserve the existing imp painter once, without adding lighting or gray emission.
 * Only the three existing field enemies opt in; the technical-lab material is restored.
 */
export class FieldEnemyPalette {
 private originals=new Map<StandardMaterial,Original>();
 apply(sprite:FieldEnemySprite,field:boolean):void{
  const m=sprite.material;
  if(!field){this.restore(m);return;}
  if(!this.originals.has(m))this.originals.set(m,{disableLighting:m.disableLighting,emissiveTexture:m.emissiveTexture,useEmissiveAsIllumination:m.useEmissiveAsIllumination,linkEmissiveWithDiffuse:m.linkEmissiveWithDiffuse,emissiveColor:m.emissiveColor.clone(),specularColor:m.specularColor.clone(),ambientColor:m.ambientColor.clone()});
  m.disableLighting=true;m.emissiveTexture=sprite.texture;
  if(!m.useEmissiveAsIllumination||m.linkEmissiveWithDiffuse||!m.emissiveColor.equalsFloats(0,0,0)||!m.specularColor.equalsFloats(0,0,0)||!m.ambientColor.equalsFloats(0,0,0))preservePixelPalette(m);
 }
 private restore(m:StandardMaterial):void{
  const o=this.originals.get(m);if(!o)return;
  m.disableLighting=o.disableLighting;m.emissiveTexture=o.emissiveTexture;m.useEmissiveAsIllumination=o.useEmissiveAsIllumination;m.linkEmissiveWithDiffuse=o.linkEmissiveWithDiffuse;
  m.emissiveColor.copyFrom(o.emissiveColor);m.specularColor.copyFrom(o.specularColor);m.ambientColor.copyFrom(o.ambientColor);this.originals.delete(m);
 }
 reset():void{for(const m of this.originals.keys())this.restore(m);}
 inspect(chapter:string|null,sprites:readonly FieldEnemySprite[],camera:Camera,tick:number|null){
  const active=chapter==='canyon'||chapter==='forest';
  const enemies=active?sprites.filter(s=>s.mesh.isEnabled()&&s.mesh.isVisible&&s.mesh.visibility>0):[];
  return {profile:FIELD_ENEMY_ART.id,chapter,tick,active,approved:false,actors:enemies.map(s=>{const m=s.material,t=s.texture;
   return {name:s.mesh.name,texture:t.name,cell:t.getSize(),sampling:t.samplingMode,alpha:t.hasAlpha,disableLighting:m.disableLighting,emissiveMatchesDiffuse:m.emissiveTexture===m.diffuseTexture,emissionOnly:m.useEmissiveAsIllumination,linked:m.linkEmissiveWithDiffuse,emissive:m.emissiveColor.asArray(),ambient:m.ambientColor.asArray(),specular:m.specularColor.asArray(),alphaTest:m.transparencyMode===Material.MATERIAL_ALPHATEST,position:s.mesh.position.asArray(),scale:s.mesh.scaling.asArray(),samples:[[0,0],[6,13],[8,15],[9,16],[6,29]].map(([x,y])=>({x:x!,y:y!,rgba:Array.from(t.getContext().getImageData(x!,y!,1,1).data)}))};}),rects:projectCameraSubjects(enemies.map(s=>({id:s.mesh.name,mesh:s.mesh})),camera)};
 }
}
