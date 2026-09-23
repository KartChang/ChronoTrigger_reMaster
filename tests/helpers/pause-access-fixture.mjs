import {readFileSync} from 'node:fs';
const e=JSON.parse(readFileSync(new URL('../fixtures/planter-pixels-unit.json',import.meta.url),'utf8'));
/** Schema ports only; these objects are never emitted as native reports or saves. */
export const planterFixture=()=>({profile:'vq02t-truce-planters',approved:false,name:'truce-planter-craft',width:64,height:64,meshes:5,sampling:1,alpha:false,samples:structuredClone(e.samples)});
export function pauseAccessFixture(state,viewport,index,observation){
 const layout=focus=>({viewport:{...viewport},focus,dialog:{x:12,y:12,width:viewport.width-24,height:300},scrollTop:0,clientHeight:296,scrollHeight:296,controls:['resume','render-quality','cpu-sampling'].map((id,i)=>({id,fontSize:14,visible:true,hit:true,rect:{x:24,y:30+i*60,width:150,height:44}}))});
 const nearest={...observation('pause-controls-'+index,'truce',false),state:structuredClone(state),paused:true,canvasImage:{source:'actual-cpu-canvas',path:`village-nearest-${index}.png`,bytes:99,sha256:'a'.repeat(64)}};
 const keys=['Tab','Tab','Space','Space','Tab'],focusOrder=['render-quality','cpu-sampling','cpu-sampling','cpu-sampling','resume'];
 let focus='resume',sampling=true;const point=()=>({paused:true,state:structuredClone(state),focus,sampling});
 const steps=keys.map((key,i)=>{const before=point();focus=focusOrder[i];if(key==='Space')sampling=!sampling;return {key,before,after:point(),completed:true};});
 return {steps,schema:'chrono-pause-access-v1',status:'passed',physicalDevice:false,originalSampling:true,restoredSampling:true,before:structuredClone(state),after:structuredClone(state),initial:layout('resume'),qualityFocus:layout('render-quality'),samplingFocus:layout('cpu-sampling'),keys:['Tab','Tab','Space','Space','Tab'],focusOrder:['render-quality','cpu-sampling','cpu-sampling','cpu-sampling','resume'],nearest};
}
