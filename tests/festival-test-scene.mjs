import {NullEngine,Scene,FreeCamera,Camera,Vector3,DirectionalLight,ShadowGenerator} from '@babylonjs/core';
import {surface} from '../scripts/asset-export.mjs';
/** Geometry-only engine and rect painter, not browser/canvas/GPU evidence. Text is not rasterized. */
export function festivalTestScene(){
 const engine=new NullEngine();
 engine.createCanvas=(width,height)=>{
  const canvas={width,height},pixels=surface(width,height);
  const ink=Object.assign(pixels.ink,{canvas,fillText(){},measureText(t){return {width:t.length*10};}});
  canvas.getContext=()=>ink;return canvas;
 };
 const scene=new Scene(engine),camera=new FreeCamera('camera',new Vector3(0,23,-26),scene);
 camera.setTarget(Vector3.Zero());camera.mode=Camera.ORTHOGRAPHIC_CAMERA;
 camera.orthoLeft=-12;camera.orthoRight=12;camera.orthoTop=8;camera.orthoBottom=-8;scene.activeCamera=camera;
 const light=new DirectionalLight('test-light',new Vector3(-.45,-1,.55),scene),shadow=new ShadowGenerator(256,light);
 return {engine,scene,camera,shadow,dispose(){scene.dispose();engine.dispose();}};
}
