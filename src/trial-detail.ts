import {Color3,DynamicTexture,Scene,StandardMaterial,Texture,Vector4} from '@babylonjs/core';
import {drawCourtDais,TRIAL_DETAIL_ART} from './trial-detail-art';
/** One cap/edge atlas per cached courtroom, shared by the existing three cylinders. */
export function courtDaisSurface(scene:Scene):StandardMaterial{
 const t=new DynamicTexture('court-dais-atlas',TRIAL_DETAIL_ART.dais,scene,false,Texture.NEAREST_SAMPLINGMODE);
 drawCourtDais(t.getContext() as CanvasRenderingContext2D);t.wrapU=t.wrapV=Texture.CLAMP_ADDRESSMODE;t.update();
 const m=new StandardMaterial('court-dais-stone',scene);m.diffuseTexture=t;m.specularColor=Color3.Black();return m;
}
/** Babylon cylinder order is bottom / side / top. Keep padding away from atlas seams. */
export function courtDaisUV():Vector4[]{
 return [new Vector4(0,32/160,1,1),new Vector4(0,2/160,1,28/160),new Vector4(0,32/160,1,1)];
}
