import {townDetailFixture} from './village-detail-fixture.mjs';
import {readFileSync} from 'node:fs';
import {planterFixture,pauseAccessFixture} from './pause-access-fixture.mjs';
const e=JSON.parse(readFileSync(new URL('../fixtures/village-pixels-unit.json',import.meta.url),'utf8'));
/** In-memory schema fixture only, never used to populate a native report or save. */
export function villageFixture(chapter){
 if(chapter!=='truce')return null;
 return {profile:e.profile,approved:false,chapter,planters:planterFixture(),details:townDetailFixture(),surfaces:Object.entries({stone:8,plaster:4,timber:24,slate:30,clay:10,door:4}).map(([kind,meshes])=>({kind,name:'truce-craft-'+kind,width:64,height:64,sampling:1,alpha:false,meshes,samples:structuredClone(e.surfaces[kind])})),sign:{kind:'sign',name:'truce-inn-sign',width:80,height:40,sampling:1,alpha:true,samples:structuredClone(e.sign)}};
}
export function villageLayoutFixture(state,observation){
 return {schema:'chrono-village-layouts-v1',status:'passed',physicalDevice:false,artApproved:false,before:structuredClone(state),after:structuredClone(state),fullStateEqual:true,restoredViewport:{width:960,height:640},views:[[960,640],[390,844],[844,390]].map(([width,height],i)=>{const value=observation('village-layout-'+i,'truce'),canvas={width:Math.floor(width/2),height:Math.floor(height/2)};
  Object.assign(value.renderer,canvas);Object.assign(value.pixels,{...canvas,opaque:canvas.width*canvas.height});value.village.details=townDetailFixture(canvas);
  return {...value,paused:true,viewport:{width,height},pauseAccess:pauseAccessFixture(state,{width,height},i,observation),state:structuredClone(state),canvasImage:{source:'actual-cpu-canvas',path:`village-canvas-${i}.png`,bytes:99,sha256:'a'.repeat(64)}};})};
}
