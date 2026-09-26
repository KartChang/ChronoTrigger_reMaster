import type {Ink} from './hero-art';
import {drawNaga,drawYakra} from './rescue-art';
/** Authored additions, not ROM frames. The original rest/ready painters remain unchanged. */
export type RescueEnemyKind='naga'|'hench'|'yakra';
export type RescueEnemyFrame=0|1|2|3|4;
export const RESCUE_ENEMY_ART=Object.freeze({id:'vq03s-rescue-enemy-poses',frames:5,approved:false});
export function drawRescueEnemyFrame(c:Ink,kind:RescueEnemyKind,frame:RescueEnemyFrame):void{
 if(!['naga','hench','yakra'].includes(kind)||!Number.isInteger(frame)||frame<0||frame>4)throw new RangeError('Invalid rescue enemy cell');
 if(kind==='yakra'){
  drawYakra(c,frame===1?1:0);if(frame<2)return;
  // Preserve the face, spikes and foot-contact row. Only outer forearms change.
  const r=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
  c.clearRect(3,23,7,10);c.clearRect(39,23,6,10);
  r(5,23,5,10,'#443126');r(7,23,3,10,'#c28b43');r(39,23,4,10,'#443126');r(39,23,2,10,'#86502c');
  const y=frame===2?20:frame===3?27:24;
  r(2,y,8,5,'#443126');r(3,y+1,7,3,'#e6b766');r(39,y,7,5,'#443126');r(39,y+1,6,3,'#c28b43');
  return;
 }
 drawNaga(c,kind==='hench');if(frame===0)return;
 const r=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 const a=kind==='hench'?'#677692':'#827393',b=kind==='hench'?'#97a5b0':'#bb98a3',o='#2c293e';
 // Original silhouette, face and tail retained; authored shoulder/arm silhouettes only.
 c.clearRect(3,18,3,7);c.clearRect(18,18,3,7);r(5,18,1,7,o);r(18,18,1,7,o);
 const y=frame===1?16:frame===2?14:frame===3?20:17;
 r(2,y,4,6,o);r(3,y+1,3,4,a);r(18,y,4,6,o);r(18,y+1,3,4,b);
 if(frame===4){r(1,18,4,3,a);r(20,18,3,3,b);}
 // The guard's retained polearm is never erased by its moving arm.
 if(kind==='hench'){r(3,13,1,17,'#adac96');r(2,11,3,4,'#dad8be');}
}
