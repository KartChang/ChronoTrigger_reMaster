import {drawImpFrame,impFrame,IMP_MOTION} from './imp-motion';
import type {ImpFrame} from './imp-motion';
/** Additive strike/follow-through poses. M's four-pose foundation is unchanged.
 * Damage already happened when a delivered action starts this presentation.
 * These are not predictive windups, direction/movement or death animations.
 */
export const IMP_ACTION=Object.freeze({id:'vq03n-field-imp-action',duration:24,strikeTicks:8,followTicks:16,historyLimit:24,approved:false});
export type ImpActionFrame=ImpFrame|4|5;
export function impActionFrame(tick:number,index:number,battle:boolean,reduced:boolean,hurtTick:number|null,attackTick:number|null):ImpActionFrame{
 const base=impFrame(tick,index,battle,reduced,hurtTick);
 if(reduced||!battle||base===3||attackTick===null||!Number.isSafeInteger(attackTick)||attackTick<0||attackTick>tick)return base;
 const age=tick-attackTick;
 return age<IMP_ACTION.strikeTicks?4:age<IMP_ACTION.followTicks?5:age<IMP_ACTION.duration?2:base;
}
export function drawImpActionFrame(c:CanvasRenderingContext2D,frame:ImpActionFrame):void{
 if(!Number.isInteger(frame)||frame<0||frame>5)throw new RangeError('Invalid imp action frame');
 if(frame<=3){drawImpFrame(c,frame as ImpFrame);return;}
 drawImpFrame(c,0);
 // Only the established arm regions are repainted; face, feet, cell and C palette stay exact.
 c.clearRect(3,21,4,5);c.clearRect(18,21,3,5);
 const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 r(5,21,2,3,'#26394a');r(18,21,1,3,'#26394a');
 if(frame===4){r(2,20,5,3,'#468391');r(18,22,4,4,'#468391');}
 else{r(2,22,5,4,'#468391');r(18,20,4,3,'#468391');}
}
export const impHurtActive=(tick:number,hurt:number|null)=>hurt!==null&&tick>=hurt&&tick-hurt<IMP_MOTION.hurtTicks;
