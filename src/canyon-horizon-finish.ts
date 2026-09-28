import {DynamicTexture,Material,MeshBuilder,Scene,StandardMaterial,Texture} from '@babylonjs/core';
import {preservePixelPalette} from './pixel-presentation';
/** Low irregular rear-bank silhouette joins the existing flat northern edge to the
 * distant scenery. No walkable surface, collision, camera or actor movement is added. */
export const HORIZON_ART=Object.freeze({id:'vq04d-canyon-rear-bank',width:512,height:128,approved:false});
export function paintCanyonHorizon(){
 const {width,height}=HORIZON_ART,rgba=new Uint8ClampedArray(width*height*4);
 for(let x=0;x<width;x++){
  const t=x/(width-1),bank=Math.abs(t-.5),top=Math.round(53+25*Math.cos(t*12)+8*Math.sin(t*39)+5*Math.sin(t*91));
  // The closed gate remains legible in the lower central saddle.
  const edge=Math.max(top,bank<.17?92-Math.round(bank*95):0);
  for(let y=Math.max(2,edge);y<height;y++){
   const i=(y*width+x)*4,depth=(y-edge)/Math.max(1,height-edge),strata=(y+Math.round(Math.sin(x*.065)*3))%15;
   const grain=((Math.imul(x+7,1103515245)^Math.imul(y+11,134775813))>>>0)%7;
   const turf=y-edge<7,shadow=strata<2?-15:strata===3?11:0;
   rgba[i]=turf?85+grain:99+Math.round(depth*21)+shadow+grain;rgba[i+1]=turf?111+grain:101+Math.round(depth*15)+shadow+grain;rgba[i+2]=turf?57:70+shadow;rgba[i+3]=255;
  }
 }
 return {width,height,rgba};
}
export function installCanyonHorizon(scene:Scene){
 let applied=false,disposed=false;const observer=scene.onBeforeRenderObservable.add(()=>{
  if(applied||disposed)return;const root=scene.getTransformNodeByName('truce-canyon-600');if(!root?.isEnabled())return;
  const p=paintCanyonHorizon(),t=new DynamicTexture('production-canyon-rear-bank',p,scene,false,Texture.NEAREST_SAMPLINGMODE);t.hasAlpha=true;t.wrapU=t.wrapV=Texture.CLAMP_ADDRESSMODE;
  const c=t.getContext() as CanvasRenderingContext2D,image=c.createImageData(p.width,p.height);image.data.set(p.rgba);c.putImageData(image,0,0);t.update();
  const m=new StandardMaterial('production-canyon-rear-bank-material',scene);m.diffuseTexture=t;m.emissiveTexture=t;m.disableLighting=true;m.useAlphaFromDiffuseTexture=true;m.transparencyMode=Material.MATERIAL_ALPHATEST;m.alphaCutOff=.4;m.backFaceCulling=false;preservePixelPalette(m);
  const plane=MeshBuilder.CreatePlane('production-canyon-rear-bank',{width:24,height:4},scene);plane.parent=root;plane.position.set(0,1.6,12.25);plane.material=m;plane.isPickable=false;applied=true;
 });
 scene.onDisposeObservable.addOnce(()=>{disposed=true;scene.onBeforeRenderObservable.remove(observer);});
 return {inspect(){return {profile:HORIZON_ART.id,applied,disposed,approved:false,additionalMeshes:applied?1:0,rawTextureBytes:applied?512*128*4:0};}};
}
