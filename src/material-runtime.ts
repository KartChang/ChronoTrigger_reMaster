import {Color3,DynamicTexture,Scene,StandardMaterial,Texture,Vector4} from '@babylonjs/core';
import {ART_PROFILE,materialFor} from './art-profile';
import {drawMaterial} from './material-art';
/** One immutable texture per material/tint per scene set; no uploads in the render loop. */
export function materialSet(scene:Scene,prefix:string){
 const cache=new Map<string,StandardMaterial>();
 return (name:string,tint:string):StandardMaterial=>{
  const kind=materialFor(name),key=(kind??'flat')+tint;let material=cache.get(key);if(material)return material;
  material=new StandardMaterial(prefix+'-'+key,scene);material.specularColor=Color3.Black();
  if(kind){const t=new DynamicTexture(prefix+'-'+key,{width:64,height:64},scene,false,Texture.NEAREST_SAMPLINGMODE);drawMaterial(t.getContext() as CanvasRenderingContext2D,kind);t.wrapU=t.wrapV=Texture.WRAP_ADDRESSMODE;t.update();material.diffuseTexture=t;material.diffuseColor=Color3.FromHexString(tint).scale(.4).add(new Color3(.6,.6,.6));}
  else material.diffuseColor=Color3.FromHexString(tint);
  cache.set(key,material);return material;
 };
}
/** Physical face size, not one stretched brick pattern on a 16-unit wall. */
export function boxTextureUV(width:number,height:number,depth:number):Vector4[]{
 const size=ART_PROFILE.surfaces.materialWorldSpan;
 return [[width,height],[width,height],[depth,height],[depth,height],[width,depth],[width,depth]].map(([u,v])=>new Vector4(0,0,u!/size,v!/size));
}
