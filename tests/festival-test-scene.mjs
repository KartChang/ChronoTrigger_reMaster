import {NullEngine,Scene,FreeCamera,Camera,Vector3,DirectionalLight,ShadowGenerator} from '@babylonjs/core';
import {surface} from '../scripts/asset-export.mjs';
/** Geometry-only engine and rect painter, not browser/canvas/GPU evidence. Text is not rasterized. */
export function festivalTestScene(){
 const engine=new NullEngine();
 engine.createCanvas=(width,height)=>{
  const canvas={width,height};let pixels=surface(width,height),style='#000000';
  // DynamicTexture resizes its initial 1x1 canvas. Keep this rect-only test surface in sync.
  const current=()=>{if(pixels.width!==canvas.width||pixels.height!==canvas.height)pixels=surface(canvas.width,canvas.height);return pixels;};
  const ink={canvas,get fillStyle(){return style;},set fillStyle(value){style=value;},
   fillRect(x,y,w,h){const p=current();p.ink.fillStyle=style;p.ink.fillRect(x,y,w,h);},
   clearRect(x,y,w,h){current().ink.clearRect(x,y,w,h);},
   getImageData(x,y,w,h){const p=current(),data=new Uint8ClampedArray(w*h*4);for(let row=0;row<h;row++)for(let col=0;col<w;col++){const sx=x+col,sy=y+row;if(sx>=0&&sx<p.width&&sy>=0&&sy<p.height)data.set(p.rgba.subarray((sy*p.width+sx)*4,(sy*p.width+sx)*4+4),(row*w+col)*4);}return {data,width:w,height:h};},
   fillText(){},measureText(t){return {width:t.length*10};}};
  canvas.getContext=()=>ink;return canvas;
 };
 const scene=new Scene(engine),camera=new FreeCamera('camera',new Vector3(0,23,-26),scene);
 camera.setTarget(Vector3.Zero());camera.mode=Camera.ORTHOGRAPHIC_CAMERA;
 camera.orthoLeft=-12;camera.orthoRight=12;camera.orthoTop=8;camera.orthoBottom=-8;scene.activeCamera=camera;
 const light=new DirectionalLight('test-light',new Vector3(-.45,-1,.55),scene),shadow=new ShadowGenerator(256,light);
 return {engine,scene,camera,shadow,dispose(){scene.dispose();engine.dispose();}};
}
