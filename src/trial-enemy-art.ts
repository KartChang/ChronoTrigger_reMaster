import {drawWitness} from './witness-art';
import {drawTankPart} from './trial-art';
export type TrialEnemyKind='prisonGuard'|'tankHead'|'tankBody'|'tankWheel';
export type TrialEnemyFrame=0|1|2|3|4;
export const TRIAL_ENEMY_ART=Object.freeze({id:'vq03u-trial-enemy-cells',approved:false});
export const trialEnemyKind=(k:unknown):k is TrialEnemyKind=>k==='prisonGuard'||k==='tankHead'||k==='tankBody'||k==='tankWheel';
/** Original cells 0/1 are unchanged. New integer-pixel poses reuse the original palette. */
export function drawTrialEnemy(c:CanvasRenderingContext2D,kind:TrialEnemyKind,frame:TrialEnemyFrame):void{
 if(!trialEnemyKind(kind)||!Number.isInteger(frame)||frame<0||frame>4)throw new RangeError('Invalid trial enemy cell');
 const part=kind==='tankHead'?'head':kind==='tankBody'?'body':'wheel';
 if(kind==='prisonGuard')drawWitness(c,'guard',frame<2?frame:0);else drawTankPart(c,part,frame<2?frame:0);
 if(frame<2)return;
 const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 if(kind==='prisonGuard'){
  // Preserve face, helmet, torso and boot contacts; move only the forearms and held spear.
  c.clearRect(12,29,5,15);c.clearRect(32,29,5,15);c.clearRect(37,10,4,45);
  const y=frame===2?31:frame===3?27:36;
  r(11,y,6,9,'#191e2a');r(12,y+1,4,6,'#7e8c93');r(12,y+7,4,3,'#c58e70');
  r(32,y,9,6,'#191e2a');r(33,y+1,7,4,'#7e8c93');r(39,y+1,4,4,'#dfad88');
  const tip=frame===2?20:frame===3?16:29;
  r(42,tip+8,2,Math.min(25,54-tip-8),'#846544');r(41,tip+3,4,7,'#415968');r(42,tip,2,7,'#c3ccc3');
 }else if(kind==='tankHead'){
  // Head's real outgoing operation is repair, not a guessed damaging bite.
  r(34,16,5,4,frame===4?'#493b2e':'#e9db86');r(35,16,2,2,'#e4d478');
  r(49,22,9,5,frame===3?'#c29863':'#493b2e');r(51,23,5,2,'#686c60');
  if(frame!==4){r(10,31,8,2,'#d5ad72');r(10,frame===2?39:47,8,2,'#c59461');}
 }else if(kind==='tankBody'){
  r(13,34,24,13,'#a8784b');
  const y=frame===2?35:frame===3?38:41;
  for(let x=16;x<=30;x+=7){r(x,y,4,6,'#45392b');r(x,y,3,1,'#d3b98a');}
  if(frame!==4){r(frame===2?29:34,0,5,3,'#b9c2b0');r(33,frame===2?4:2,5,2,'#d3d6ba');}
 }else{
  r(19,19,24,25,'#899081');r(22,22,18,20,'#4f584f');
  if(frame===4){r(18,29,26,5,'#b4b49c');r(28,22,6,19,'#434b45');}
  else for(let i=0;i<6;i++){const x=frame===2?19+i*4:39-i*4;r(x,18+i*4,5,5,'#b4b49c');}
  r(25,25,12,12,'#4c534b');r(28,28,6,6,'#b29a67');
 }
}
