import {Engine,NullEngine} from '@babylonjs/core';
import type {InternalTexture} from '@babylonjs/core';
import {WEBGL_OPTIONS} from './render-capability';
export const CPU_TEXTURE_BUDGET=32*1024*1024;
export const CPU_TEXTURE_ENTRIES=512;
/** Explicit rendering preference, never a game-state or test-success switch. */
export function webglOnly(search:string):boolean{return new URLSearchParams(search).get('renderer')==='webgl';}
type Upload={canvas:HTMLCanvasElement;invertY:boolean;revision:number};
type Pixels={width:number;height:number;rgba:Uint8ClampedArray;invertY:boolean;revision:number};
/** NullEngine supplies Babylon's scene/math/storage only. CpuScene is the renderer. */
export class CpuEngine extends NullEngine {
 readonly cpuContext:CanvasRenderingContext2D;
 private factor=1;private actualFactor=1;private uploads=new WeakMap<InternalTexture,Upload>();
 private pixels=new Map<InternalTexture,Pixels>();private bytes=0;
 constructor(readonly canvas:HTMLCanvasElement,context:CanvasRenderingContext2D){
  super({renderWidth:1,renderHeight:1,textureSize:512,deterministicLockstep:false,lockstepMaxSteps:4});
  this.cpuContext=context;this._webGLVersion=0;this.resize();
 }
 override getRenderingCanvas(){return this.canvas;}
 override getGlInfo(){return {vendor:'project-authored',renderer:'CPU Software Rasterizer / Canvas2D',version:'no WebGL'};}
 override getRenderWidth(){return this.canvas?.width??1;}
 override getRenderHeight(){return this.canvas?.height??1;}
 override getHardwareScalingLevel(){return this.actualFactor??1;}
 override setHardwareScalingLevel(value:number){this.factor=Number.isFinite(value)&&value>0?value:1;this.resize();}
 override resize(){
  if(!this.canvas)return;
  const width=Math.max(1,this.canvas.clientWidth||640),height=Math.max(1,this.canvas.clientHeight||480);
  const scale=Math.max(this.factor,Math.sqrt(width*height/(640*480)),width/1280,height/1280);
  this.actualFactor=scale;
  const w=Math.max(1,Math.floor(width/scale)),h=Math.max(1,Math.floor(height/scale));
  if(this.canvas.width!==w)this.canvas.width=w;if(this.canvas.height!==h)this.canvas.height=h;
  this.cpuContext.imageSmoothingEnabled=false;
 }
 override updateDynamicTexture(texture:InternalTexture|null,canvas:HTMLCanvasElement,invertY:boolean){
  if(!texture)return;const previous=this.uploads.get(texture);
  this.uploads.set(texture,{canvas,invertY:!!invertY,revision:(previous?.revision??0)+1});texture.isReady=true;
 }
 /** Original DynamicTexture canvas read only, invalidated by actual update calls. */
 readTexturePixels(texture:InternalTexture):Pixels|null{
  const upload=this.uploads.get(texture);if(!upload)return null;
  const old=this.pixels.get(texture);
  if(old?.revision===upload.revision){this.pixels.delete(texture);this.pixels.set(texture,old);return old;}
  const {canvas,invertY,revision}=upload,w=canvas.width,h=canvas.height;
  if(w<1||h<1||w*h*4>CPU_TEXTURE_BUDGET)throw Error('CPU texture exceeds memory budget');
  const context=canvas.getContext('2d');if(!context)throw Error('Original texture canvas unavailable');
  const next={width:w,height:h,rgba:context.getImageData(0,0,w,h).data,invertY,revision};
  if(old){this.bytes-=old.rgba.byteLength;this.pixels.delete(texture);}
  while((this.bytes+next.rgba.byteLength>CPU_TEXTURE_BUDGET||this.pixels.size>=CPU_TEXTURE_ENTRIES)&&this.pixels.size){const key=this.pixels.keys().next().value!;this.bytes-=this.pixels.get(key)!.rgba.byteLength;this.pixels.delete(key);}
  this.pixels.set(texture,next);this.bytes+=next.rgba.byteLength;return next;
 }
 textureMemory(){return {bytes:this.bytes,budget:CPU_TEXTURE_BUDGET,entries:this.pixels.size,entryLimit:CPU_TEXTURE_ENTRIES};}
 override _releaseTexture(texture:InternalTexture){const old=this.pixels.get(texture);if(old){this.bytes-=old.rgba.byteLength;this.pixels.delete(texture);}this.uploads.delete(texture);super._releaseTexture(texture);}
 override dispose(){this.pixels.clear();this.bytes=0;this.uploads=new WeakMap();super.dispose();}
}
/** Try the unchanged Babylon WebGL2 -> WebGL1 path once. A real Canvas2D context
 * is a distinct fallback, not an attempt to enable a browser-blocked GL driver. */
export function createRenderEngine(canvas:HTMLCanvasElement):Engine{
 try{return new Engine(canvas,true,{...WEBGL_OPTIONS},true);}
 catch(webglError){
  if(webglOnly(canvas.ownerDocument?.defaultView?.location.search??''))throw new Error('已選擇僅使用 WebGL；此瀏覽器未提供可用 WebGL。移除網址的 renderer=webgl 可恢復自動 CPU 相容繪圖。');
  const context=canvas.getContext('2d',{alpha:false});
  if(!context)throw new Error('WebGL 與 Canvas2D 皆不可用：'+(webglError instanceof Error?webglError.message:String(webglError)));
  const engine=new CpuEngine(canvas,context);
  const notice=canvas.ownerDocument?.getElementById('cpu-render-note');if(notice)notice.hidden=false;
  return engine;
 }
}
