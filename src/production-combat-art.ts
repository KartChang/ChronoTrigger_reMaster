import type {HDHero} from './hd-hero-art';
import {HD_HERO_IDS} from './hd-hero-art';
import {drawProductionParty} from './production-party-art';
import {NativeActorPixels} from './native-actor-pixels';
export const COMBAT_ART=Object.freeze({id:'vq04e-authored-party-combat',width:48,height:64,pivot:{x:24,y:62},approved:false,runtimeApplied:false,
 poses:['attack','cast','hurt','down'] as const,activationHold:'Original native combat/reaction source-cell contracts remain pinned; assets are authored and exported, not silently activated.'});
export type AuthoredCombatPose=typeof COMBAT_ART.poses[number];
const coats={crono:['#367c91','#26495d','#74b9bd'],marle:['#e5e7d3','#9aaf9f','#fff8df'],lucca:['#b6854b','#705238','#dfb776'],frog:['#d7d6bd','#869789','#fff0cb']} as const;
/** Authored action variants share D's new head/body design. No State, simulation,
 * events or diagnostic rewriting: this is an explicitly staged production asset API. */
export function authoredCombatCell(hero:HDHero,facing:number,frame:number,pose:AuthoredCombatPose):Uint8ClampedArray {
 if(!HD_HERO_IDS.includes(hero)||!Number.isInteger(facing)||facing<0||facing>3||!Number.isInteger(frame)||frame<0||frame>3||!COMBAT_ART.poses.includes(pose))throw new RangeError('Invalid authored combat cell');
 const a=new NativeActorPixels(),o='#20272b',skin=hero==='frog'?'#81a666':'#e3b78c',sl=hero==='frog'?'#d0dc93':'#ffe0ac',[coat,shade,light]=coats[hero],side=facing===1||facing===3,back=facing===2;
 drawProductionParty(a.ink(),hero,facing===3?1:facing,0,'idle');
 const r=a.rect.bind(a),p=a.polygon.bind(a),l=a.line.bind(a),v=a.oval.bind(a);
 if(pose==='down'){
  const source=a.data.slice();r(0,0,48,64,null);
  // Individually authored curled legs, folded arm, grounded torso and rotated head.
  const settled=frame>=2,ty=settled?53:49+frame,headX=settled?31:29+frame;
  p([[5,ty+4],[9,ty],[17,ty+1],[21,ty+5],[17,60],[5,60]],o);p([[7,ty+4],[10,ty+2],[15,ty+3],[17,58],[7,58]],shade);r(4,58,9,3,'#8b5938');l(5,58,11,58,'#c49a64');
  p([[15,ty],[22,ty-4],[30,ty-2],[34,ty+3],[32,60],[18,61],[12,58]],o);p([[17,ty+1],[23,ty-2],[29,ty],[31,ty+4],[28,59],[18,59],[15,57]],coat);l(19,ty+1,26,ty,light);
  // Only the authored D head region is turned; a down pose is not an entire scaled standing cell.
  for(let y=4;y<31;y++)for(let x=8;x<39;x++){
   const src=(y*48+x)*4;if(!source[src+3])continue;const xx=headX+Math.floor((30-y)*.45),yy=48+Math.floor((x-8)*.4);
   if(xx>=2&&xx<46&&yy>=2&&yy<62)a.data.set(source.subarray(src,src+4),(yy*48+xx)*4);
  }
  p([[24,ty+2],[30,ty+4],[31,59],[27,61],[20,60],[18,57]],o);p([[25,ty+4],[28,ty+5],[29,59],[24,59],[21,58]],skin);l(23,58,27,58,sl);
  if(frame===3){l(14,57,20,58,shade);l(14,58,19,59,light);}
  l(4,61,43,61,o);
 }else{
  // Clear the relaxed arms only, keep the shared face/torso/feet design.
  r(5,33,side?14:10,20,null);r(side?31:32,33,13,20,null);
  const recoil=pose==='hurt',casting=pose==='cast',strike=pose==='attack';
  let handX=casting?34:recoil?36:frame===0?31:frame===1?40:frame===2?38:33;
  let handY=casting?(frame===1?23:frame===2?21:26):recoil?43:frame===0?29:frame===1?37:frame===2?44:40;
  if(back){handX=33;handY=casting?18:recoil?43:frame===1?23:frame===2?28:32;}
  const sx=side?29:30,sy=35;
  p([[sx-2,sy-2],[sx+2,sy-1],[handX+1,handY-1],[handX+2,handY+4],[handX-2,handY+6],[sx-4,sy+5]],o);
  p([[sx-1,sy],[sx+1,sy],[handX,handY+1],[handX,handY+3],[handX-2,handY+3],[sx-2,sy+4]],coat);l(sx,sy,handX-1,handY+1,light);v(handX,handY+2,2,3,skin);a.dot(handX-1,handY,sl);
  const offX=side?16:11,offY=casting?30:recoil?40:frame===1?38:44;
  p([[side?20:14,33],[offX,36],[offX-3,offY],[offX-1,offY+5],[offX+3,offY+4],[side?22:16,39]],o);p([[side?19:13,35],[offX+1,37],[offX-1,offY],[offX+1,offY+2],[side?20:15,38]],shade);v(offX,offY+3,2,2,skin);
  if(recoil){
   // Braced knee and heel stay at the original pivot instead of translating the mesh.
   p([[15,48],[22,47],[24,53],[19,57],[21,61],[11,61],[12,58],[16,53]],o);p([[16,49],[21,49],[22,52],[17,56],[15,56],[18,52]],shade);r(11,59,9,2,'#8b5938');l(12,59,18,59,'#c49a64');
   const eyeY=23;if(!back){for(const ex of side?[30]:[18,27]){r(ex,eyeY,4,4,skin);l(ex,eyeY+1,ex+2,eyeY+3,o);}}
   if(frame===1||frame===2){l(23,39,26,41,shade);l(20,42,24,43,light);}
  }else if(strike){
   const steel='#d0d6cb',edge='#fff0ca',dark='#687e87',grip='#86623e';
   if(hero==='crono'||hero==='frog'){
    const tx=side?(frame===0?35:44):back?handX-2:frame===0?37:40;
    const ty=frame===0?8:back?5:side?handY-6:frame===1?55:58;
    l(handX-1,handY+6,tx-1,ty,o);l(handX,handY+6,tx,ty,steel);l(handX+1,handY+6,tx+1,ty,edge);if(hero==='frog')l(handX+2,handY+6,tx+2,ty,dark);
    l(handX-3,handY+3,handX+4,handY+3,o);l(handX-2,handY+3,handX+3,handY+3,'#c9a05a');r(handX,handY+4,2,3,grip);
   }else if(hero==='lucca'){
    p([[handX-3,handY-2],[handX+5,handY-2],[handX+5,handY+3],[handX,handY+3],[handX-1,handY+6],[handX-4,handY+5]],o);r(handX-2,handY-1,7,3,dark);l(handX-1,handY-1,handX+4,handY-1,steel);r(handX-2,handY+2,2,3,grip);
   }else{
    l(handX-3,handY+5,handX+3,handY-6,o);l(handX-2,handY+4,handX+3,handY-5,grip);p([[handX-5,handY-4],[handX+4,handY-5],[handX+6,handY+2],[handX+3,handY],[handX-4,handY-2]],o);l(handX-4,handY-3,handX+3,handY-4,'#c49c63');l(handX-3,handY-2,handX+4,handY,'#ece3c2');
   }
  }else if(casting){
   // Open fingers and grounded focus; magical VFX still belong to the game, not the atlas.
   for(let i=0;i<3;i++){l(handX-2+i*2,handY-3-i%2,handX-2+i*2,handY+1,o);l(handX-1+i*2,handY-2-i%2,handX-1+i*2,handY+1,sl);}
   if(frame===2){l(20,39,25,41,light);l(18,43,21,44,shade);}
  }
 }
 if(facing===3)a.mirror();a.border();a.rect(0,62,48,1,null);return a.data;
}
