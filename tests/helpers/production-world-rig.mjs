import {cpuTestCanvas} from '../cpu-test-canvas.mjs';
/** Rect-only offline canvas port. It is not a browser/device/native-evidence producer. */
export function productionWorldRig(World,width=192,height=128){
 const saved={document:globalThis.document,window:globalThis.window,matchMedia:globalThis.matchMedia},media={matches:false};
 const doc={createElement:t=>t==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.document=doc;globalThis.window={devicePixelRatio:1,addEventListener(){},removeEventListener(){},navigator:{}};globalThis.matchMedia=()=>media;
 const canvas=cpuTestCanvas(width,height);canvas.canvas.ownerDocument=doc;
 let world;try{world=new World(canvas.canvas);}catch(error){Object.assign(globalThis,saved);throw error;}
 return {world,canvas,media,close(){world.engine.dispose();Object.assign(globalThis,saved);}};
}
