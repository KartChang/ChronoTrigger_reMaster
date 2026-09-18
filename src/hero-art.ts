/** Redrawn from visual references, not sampled/extracted original pixels.
 * Native project cells remain 24x32; these are NOT the original game's cells.
 */
export type Ink=Pick<CanvasRenderingContext2D,'fillStyle'|'fillRect'|'clearRect'>;
export type Hero='crono'|'marle'|'lucca';
export type HeroPose='ready'|'idle'|'walk'|'attack'|'cast'|'hurt'|'down'|'victory';
export const COMBAT_POSES=['attack','cast','hurt','down','victory'] as const;
export const CLIP_MS:Record<typeof COMBAT_POSES[number],readonly number[]>={
 attack:[100,90,100,180],cast:[130,130,160,180],hurt:[90,90,100,130],down:[120,120,140,400],victory:[180,140,180,260]
};
export function drawReferenceHero(c:Ink,hero:Hero,facing:number,frame:number,pose:HeroPose='walk'):void{
 c.clearRect(0,0,24,32);
 const phase=((Math.floor(frame)%4)+4)%4,back=facing===2,left=facing===3,side=facing===1||left;
 const crono=hero==='crono',marle=hero==='marle';
 const stride=pose==='walk'?(phase===1?1:phase===3?-1:0):0;
 const recoil=pose==='hurt'?(phase<3?1:0):0;
 const crouch=(pose==='attack'&&phase===0)||(pose==='hurt'&&phase===2)?1:(pose==='down'&&phase===1)?2:0;
 const fallen=pose==='down'&&phase>=2;
 const o='#282738',skin='#efbf88',skinShade='#b57e59',skinLight='#ffe1ae';
 const hair=crono?'#ba3d21':marle?'#c77d28':'#655078';
 const hairShade=crono?'#752d22':marle?'#85532b':'#3e385d';
 const hairLight=crono?'#f7792f':marle?'#f5c267':'#a086ad';
 const cloth=crono?'#258f9d':marle?'#eee9cf':'#c78b4b';
 const clothShade=crono?'#275568':marle?'#9bb4a7':'#775b43';
 const clothLight=crono?'#60b5b4':marle?'#fff9e1':'#edd69c';
 const r=(x:number,y:number,w:number,h:number,color:string)=>{
  c.fillStyle=color;x+=recoil;y+=crouch;
  if(fallen){c.fillRect(2+Math.round((32-y-h)*.64),23+Math.round((x-4)*.42),Math.max(1,Math.round(h*.64)),Math.max(1,Math.round(w*.42)));}
  else c.fillRect(left?24-x-w:x,y,w,h);
 };
 const line=(x0:number,y0:number,x1:number,y1:number,color:string)=>{
  const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx+dy;
  for(;;){r(x0,y0,1,1,color);if(x0===x1&&y0===y1)break;const e=2*err;if(e>=dy){err+=dy;x0+=sx;}if(e<=dx){err+=dx;y0+=sy;}}
 };
 // Slimmer body, long readable legs, separate shoe silhouettes and cloth shading.
 const ll=Number(stride<0),rl=Number(stride>0);
 r(8-stride,23,4,8-ll,o);r(13+stride,23,4,8-rl,o);
 r(9-stride,23,2,5-ll,marle?'#f5edce':'#79918a');r(14+stride,23,2,5-rl,marle?'#cfceb5':'#405a62');
 r(8-stride,28-ll,4,3,'#865539');r(13+stride,28-rl,4,3,'#754633');
 r(8-stride,28-ll,3,1,'#d99957');r(13+stride,28-rl,3,1,'#b37c44');r(8-stride,31-ll,4,1,o);r(13+stride,31-rl,4,1,o);
 r(7,16,11,8,o);r(8,16,9,7,cloth);r(8,19,2,4,clothShade);r(11,17,4,3,clothLight);r(16,17,1,6,clothShade);
 r(8,22,9,2,crono?'#665840':'#557f72');r(12,22,2,2,'#d5b76a');
 const ready=pose==='cast'||pose==='victory';
 const attacking=pose==='attack';
 const armY=ready?Math.max(8,14-phase*2):attacking?17+(phase===0?2:0):18;
 r(6,armY+stride,2,6,o);r(6,armY+stride,2,3,cloth);r(6,armY+stride+3,2,2,skinShade);
 r(17,armY-stride,2,6,o);r(17,armY-stride,2,3,clothShade);r(17,armY-stride+3,2,2,skin);
 if(attacking&&phase>0){r(17,18,4,2,cloth);r(20,18,2,2,skinLight);}
 // Head shape is stepped at chin and temples, not an opaque square hair block.
 r(8,5,9,9,o);r(7,7,11,6,o);r(9,8,7,7,skin);r(8,9,2,4,skinShade);r(15,10,2,3,skinShade);r(10,14,5,1,skinShade);
 r(8,5,9,4,hair);r(7,7,2,5,hairShade);r(16,6,2,6,hair);r(10,6,4,2,hairLight);
 if(crono){
  for(const [x,y,w,h] of [[5,4,3,4],[8,1,3,7],[12,0,2,6],[14,2,4,6],[18,3,2,5],[19,2,2,2]])r(x!,y!,w!,h!,hairShade);
  r(6,4,2,3,hair);r(9,2,2,5,hairLight);r(12,1,1,5,hair);r(14,3,3,4,hairLight);r(17,4,2,4,hair);r(7,7,2,2,hairLight);
  r(8,8,9,2,'#ddd4af');r(8,9,3,1,'#969582');r(17,8,2,1,'#eee3bd');
  r(8,15,9,2,'#cc8d3c');r(9,15,6,1,'#f3cb70');r(back?8:16,16,2,5,'#c48b43');r(back?7:17,19,2,3,'#eeb55b');
 }else if(marle){
  r(11,1,6,5,hairShade);r(12,2,4,3,hairLight);r(17,3,3,8,hair);r(18,7,2,7,hairShade);r(18,5,1,6,hairLight);
  r(15,4,4,2,'#588781');r(10,4,6,3,hairLight);r(8,6,3,4,hair);r(15,7,2,3,hair);
  r(10,15,5,2,skin);r(11,17,3,1,'#5b9c99');r(12,18,1,2,'#b1d9c4');r(9,20,7,2,'#d5dfc5');
 }else{
  r(7,8,2,10,hairShade);r(17,8,2,10,hair);r(7,14,2,4,hairLight);
  r(8,3,9,5,o);r(9,3,7,3,'#869176');r(10,3,4,1,'#c9c49a');r(7,6,11,2,'#c9b88a');r(8,7,9,1,'#807654');r(16,3,2,3,'#b98d45');
 }
 if(back){
  r(8,9,9,5,hair);r(9,10,3,3,hairLight);r(8,13,2,2,hairShade);r(15,13,2,2,hairShade);
  if(!crono&&!marle){r(8,8,9,2,'#7e7e68');r(10,8,5,1,'#c8b991');}
 }else if(side){
  r(15,10,2,2,o);r(17,12,2,1,skinLight);r(8,9,3,5,hair);
  if(!crono&&!marle){r(14,10,5,4,o);r(15,11,3,2,'#bbd8cd');}
 }else if(!crono&&!marle){
  r(8,10,4,4,o);r(13,10,4,4,o);r(12,11,1,1,o);r(9,11,2,2,'#a8c8c7');r(14,11,2,2,'#c7ded0');
 }else{
  r(10,11,1,2,o);r(14,11,1,2,o);r(10,11,1,1,'#ffffff');r(12,14,2,1,skinShade);
 }
 // Held weapons have dedicated poses; they are not a translated standing frame.
 if(attacking){
  if(crono){
   if(phase===0){line(18,20,21,8,o);line(19,19,22,7,'#9abdc6');line(19,17,21,8,'#f7f7d9');}
   else if(phase===1){line(19,18,22,5,o);line(20,18,23,5,'#c7e3df');r(18,17,4,1,'#b89146');}
   else {line(17,20,23,13,o);line(18,20,23,15,'#e4efdf');line(18,19,23,14,'#87afb5');r(16,19,3,1,'#c19b57');}
  }else if(marle){
   r(20,14,1,11,'#986939');line(19,14,22,18,'#e2cba1');line(22,18,19,25,'#e2cba1');line(19,14,19,25,'#746657');r(18,19,6,1,'#c8d4c3');
  }else{r(19,17,4,3,o);r(19,17,4,1,'#aab2a8');r(19,20,2,2,'#9c6e45');if(phase===2){r(22,15,2,2,'#ffda78');r(23,20,1,2,'#ffe8a8');}}
 }
 if(pose==='cast'){r(5,armY,3,2,skinLight);r(17,armY,3,2,skinLight);if(phase===2){r(4,armY-2,1,1,'#e5f8d7');r(20,armY-1,1,1,'#a9e7e2');}}
 if(pose==='hurt'&&phase<2){r(9,12,3,1,o);r(14,12,2,1,o);}
 if(pose==='victory'&&crono){line(18,13,20,2,'#8fb4bb');line(19,13,21,2,'#f8f7d9');r(17,12,4,1,'#d8b160');}
}
