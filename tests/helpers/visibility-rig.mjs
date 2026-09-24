import {World,renderCompatibleScene} from '../../.test/cpu-entry.mjs';
import {World as CWorld,renderCompatibleScene as renderC} from '../../.test/visibility-baseline-cpu-entry.mjs';
import {cpuTestCanvas} from '../cpu-test-canvas.mjs';
export function visibilityRig(width=390,height=844){
 const oldDoc=globalThis.document,oldWindow=globalThis.window;
 const doc={createElement:t=>t==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.document=doc;globalThis.window={devicePixelRatio:1,addEventListener(){},removeEventListener(){},navigator:{}};
 const currentPort=cpuTestCanvas(width,height),oldPort=cpuTestCanvas(width,height);currentPort.canvas.ownerDocument=oldPort.canvas.ownerDocument=doc;
 const current=new World(currentPort.canvas),old=new CWorld(oldPort.canvas);
 return {current,old,currentPort,oldPort,renderCompatibleScene,renderC,close(){current.engine.dispose();old.engine.dispose();globalThis.document=oldDoc;globalThis.window=oldWindow;}};
}
