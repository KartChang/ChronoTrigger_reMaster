import {drawImp} from './pixel-art';
/** Four authored arm poses. Original face/feet, cell and C palette remain untouched. */
export const IMP_MOTION=Object.freeze({id:'vq03m-field-imp-motion',width:24,height:32,frames:4,period:180,hurtTicks:18,approved:false});
export type ImpFrame=0|1|2|3;
export function impFrame(tick:number,index:number,battle:boolean,reduced:boolean,hurtTick:number|null=null):ImpFrame{
 if(!Number.isSafeInteger(tick)||tick<0||!Number.isInteger(index)||index<0||index>2)throw new RangeError('Invalid imp animation tick or slot');
 if(reduced)return 0;
 if(hurtTick!==null&&Number.isSafeInteger(hurtTick)&&hurtTick>=0&&tick>=hurtTick&&tick-hurtTick<IMP_MOTION.hurtTicks)return 3;
 if(battle)return Math.floor((tick+index*11)/24)%4===3?1:2;
 return (tick+index*37)%IMP_MOTION.period>=150?1:0;
}
export function drawImpFrame(c:CanvasRenderingContext2D,frame:ImpFrame):void{
 if(!Number.isInteger(frame)||frame<0||frame>3)throw new RangeError('Invalid imp frame');
 drawImp(c);if(frame===0)return;
 const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 // Move only arms; restore the body strip behind the original arm footprint.
 c.clearRect(3,21,4,5);c.clearRect(18,21,3,5);
 r(5,21,2,3,'#26394a');r(18,21,1,3,'#26394a');
 if(frame===3){r(2,21,5,3,'#468391');r(18,21,4,3,'#468391');}
 else{const y=frame===1?20:19;r(3,y,4,5,'#468391');r(18,y,3,5,'#468391');}
}
