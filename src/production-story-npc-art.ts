import {STORY_NPC_KINDS,drawStoryNpc} from './story-npc-art';
import type {StoryNpcKind} from './story-npc-art';
import {NativeActorPixels} from './native-actor-pixels';
export const STORY_NPC_PRODUCTION=Object.freeze({id:'vq04e-story-npc-redraw',width:48,height:64,pivot:{x:24,y:63},frames:4,directions:4,approved:false,runtimePoses:['ambient'],authoredPoses:['ambient','walk','greet']});
export type StoryNpcPose='ambient'|'walk'|'greet';
const colours={
 resident:['#6f8a65','#405c4c','#adbc8e'],innkeeper:['#a97d4e','#644f3b','#e0bb7c'],guard:['#859dab','#435f75','#d4ded5'],king:['#804767','#4b304e','#c7889b'],nun:['#526d83','#303e57','#a1bbc1'],queen:['#4f9694','#305d72','#b3d5be'],chancellor:['#787590','#44455d','#b9b7cc']
} as const;
export function legacyStoryNpcCell(kind:StoryNpcKind,frame:number){const a=new NativeActorPixels();drawStoryNpc(a.ink(),kind,frame);return a.data;}
/** Seven genuinely redrawn silhouettes at native scale. Direction/gait assets are
 * authored for the existing actors, not a claim that static quest NPCs now navigate. */
export function storyNpcProductionCell(kind:StoryNpcKind,frame:number,facing=0,pose:StoryNpcPose='ambient'):Uint8ClampedArray {
 if(!STORY_NPC_KINDS.includes(kind)||!Number.isInteger(frame)||frame<0||frame>3||!Number.isInteger(facing)||facing<0||facing>3||!['ambient','walk','greet'].includes(pose))throw new RangeError('Invalid production NPC cell');
 const a=new NativeActorPixels(),o='#202935',skin='#e7b98e',ss='#b57b60',sl='#ffdfb1',gold='#c7a45b',gh='#f4d99a';
 const [cloth,shade,light]=colours[kind],side=facing===1||facing===3,back=facing===2,blink=pose==='ambient'&&frame===2,dy=pose==='ambient'&&frame===1?-1:pose==='walk'&&frame%2?-1:0;
 const gown=['king','queen','nun','chancellor'].includes(kind),step=pose==='walk'?(frame===1?3:frame===3?-3:0):0,cx=side?26:24;
 const r=(x:number,y:number,w:number,h:number,c:string)=>a.rect(x,y,w,h,c),p=a.polygon.bind(a),l=a.line.bind(a),v=a.oval.bind(a);
 // Cape/veil/hair behind the body: role-specific taper, not a rectangular torso.
 if(kind==='king'||kind==='queen'){p([[14,30+dy],[32,30+dy],[37,44],[39,58],[32,61],[10,59],[9,54]],o);p([[15,32+dy],[31,32+dy],[34,44],[36,57],[29,59],[12,57]],shade);l(14,36,12,55,light);}
 if(kind==='queen'){p([[15,15+dy],[32,15+dy],[36,28+dy],[35,39],[29,37],[17,36],[12,32+dy]],o);p([[16,17+dy],[31,17+dy],[33,28+dy],[32,36],[17,34],[14,30+dy]],'#866444');l(16,21+dy,16,32+dy,'#cfac70');}
 for(const [x,s]of (side?[[21,-step],[28,step]]:[[16,-step],[28,step]])){
  p([[x!,47],[x!+6,47],[x!+5,53],[x!+s!+4,59],[x!+s!+6,60],[x!+s!+6,62],[x!+s!-2,62],[x!+s!-2,59],[x!,53]],o);
  p([[x!+1,48],[x!+4,48],[x!+3,54],[x!+s!+3,59],[x!+s!,59]],shade);r(x!+s!-1,59,6,2,'#796048');r(x!+s!-1,59,4,1,'#b49669');
 }
 const left=side?18:12,right=side?32:35;
 p([[left+3,31+dy],[right-4,31+dy],[right,36+dy],[right-1,48],[gown?right+1:right-2,gown?59:53],[gown?left-2:left+1,gown?59:53],[left,43],[left,36+dy]],o);
 p([[left+4,33+dy],[right-5,33+dy],[right-2,37+dy],[right-3,48],[gown?right-1:right-3,gown?57:51],[gown?left:left+3,gown?57:51],[left+2,42],[left+2,37+dy]],cloth);
 p([[left+2,37+dy],[left+7,36+dy],[left+6,47],[left+3,55],[left+1,gown?56:48]],shade);
 l(cx+2,35+dy,cx+5,45,light);l(cx-3,42,cx-4,gown?55:48,light);l(right-5,43,right-5,gown?55:48,shade);
 if(back){l(cx,33+dy,cx,54,shade);l(cx+2,34+dy,cx+2,52,light);}else if(kind==='queen'){p([[19,33+dy],[28,33+dy],[30,38],[26,44],[20,42],[18,37]],light);r(23,35+dy,3,4,gold);a.dot(24,35+dy,gh);}
 if(!gown){r(left+2,47,right-left-3,3,'#5f4639');r(cx,47,3,3,gold);r(cx,47,2,1,gh);}
 // The two sleeves have shaped elbows and separately drawn hands; greet is not a blink alias.
 for(const [x,dir]of [[left,-1],[right-1,1]]){
  const raised=pose==='greet'&&dir===1,ey=raised?28-frame%2:43+(dir!*step),hx=x!+dir!*3;
  p([[x!,34+dy],[x!+dir!*4,35+dy],[x!+dir!*5,raised?31:40],[hx,ey+5],[x!-dir!,ey+4],[x!-dir!,38+dy]],o);
  p([[x!,36+dy],[x!+dir!*2,37+dy],[x!+dir!*3,raised?32:40],[hx-dir!,ey+2],[x!,ey+2]],dir===-1?cloth:shade);
  v(hx,ey+3,2,3,skin);a.dot(hx-1,ey+1,sl);
 }
 // Jaw, swept hairline and distinct brow, no boxed eye-mask.
 v(cx,21+dy,9,10,o);v(cx,22+dy,8,8,skin);p([[cx-7,21+dy],[cx-5,25+dy],[cx+1,29+dy],[cx+5,27+dy],[cx+3,31+dy],[cx-3,31+dy],[cx-7,26+dy]],ss);l(cx-4,16+dy,cx+4,16+dy,sl);
 r(cx-10,20+dy,2,5,ss);r(cx+9,20+dy,2,4,skin);
 const hair=kind==='king'||kind==='chancellor'?'#b5ad99':kind==='queen'?'#876741':'#70533d';
 p([[cx-10,18+dy],[cx-9,12+dy],[cx-4,9+dy],[cx+5,10+dy],[cx+10,15+dy],[cx+10,22+dy],[cx+7,23+dy],[cx+6,16+dy],[cx-1,15+dy],[cx-6,18+dy]],o);
 p([[cx-8,17+dy],[cx-7,13+dy],[cx-3,11+dy],[cx+4,12+dy],[cx+8,15+dy],[cx+8,20+dy],[cx+7,20+dy],[cx+5,14+dy],[cx-1,14+dy]],hair);l(cx-5,12+dy,cx+3,12+dy,kind==='king'?'#e4dbc4':'#ad8b57');
 if(back){v(cx,20+dy,8,9,hair);l(cx-4,16+dy,cx-3,26+dy,'#927c5c');}
 else{
  for(const x of side?[cx+4]:[cx-5,cx+4]){l(x-1,20+dy,x+2,20+dy,'#765b49');r(x,22+dy,2,blink?1:3,o);if(!blink)a.dot(x,22+dy,'#fff1cf');}
  r(cx+1,24+dy,2,2,ss);a.dot(cx+2,24+dy,sl);l(cx-3,28+dy,cx+2,28+dy,'#98674e');
 }
 if(kind==='resident'){
  l(left+5,34,left+6,46,'#c1aa79');r(right-1,48,7,10,o);r(right,49,5,7,'#9f7950');r(right,49,5,2,gold);a.dot(right+2,53,gh);
 }else if(kind==='innkeeper'){
  p([[16,14+dy],[15,11+dy],[18,7+dy],[28,7+dy],[33,11+dy],[33,15+dy]],o);p([[17,12+dy],[19,9+dy],[27,9+dy],[31,12+dy],[31,13+dy],[17,13+dy]],'#aa7f52');l(18,10+dy,28,10+dy,'#dbb785');
  if(!back){r(18,34,2,12,'#e7dbc1');r(29,34,2,12,'#e7dbc1');p([[16,43],[32,43],[34,57],[14,57]],o);p([[17,44],[31,44],[32,55],[16,55]],'#d8c9a3');r(20,47,9,6,'#a19479');l(20,47,28,47,'#f0e2be');l(18,53,18,55,'#a69e85');}
 }else if(kind==='guard'){
  p([[14,18+dy],[15,10+dy],[20,6+dy],[29,7+dy],[33,11+dy],[34,18+dy]],o);p([[16,16+dy],[17,11+dy],[21,8+dy],[28,9+dy],[31,12+dy],[32,16+dy]],cloth);l(20,9+dy,19,15+dy,light);r(25,8+dy,2,13,light);r(14,17+dy,20,2,shade);
  if(!back){p([[14,34],[23,36],[32,34],[31,43],[24,47],[16,44]],shade);l(15,35,22,37,light);l(25,38,30,36,light);r(23,38,2,6,gold);}
  r(6,24,2,38,o);r(7,27,1,34,'#a28457');p([[7,16],[4,25],[7,29],[10,25]],o);p([[7,19],[6,25],[7,27],[8,24]],light);l(7,20,7,26,'#f1e3b7');
  p([[30,45],[36,43],[41,47],[39,57],[35,61],[30,56]],o);p([[32,46],[36,45],[39,48],[37,56],[35,58],[32,55]],shade);l(35,47,35,57,gold);l(33,48,37,48,gold);
 }else if(kind==='king'||kind==='queen'){
  p([[14,13+dy],[14,7+dy],[18,9+dy],[22,4+dy],[25,9+dy],[31,6+dy],[34,12+dy]],o);p([[16,11+dy],[16,9+dy],[19,10+dy],[22,6+dy],[25,11+dy],[31,9+dy],[32,11+dy]],gold);r(16,12+dy,16,2,gh);r(23,10+dy,3,3,kind==='king'?'#ae474d':'#418a97');
  if(kind==='king'&&!back){p([[17,28+dy],[21,29+dy],[24,27+dy],[29,28+dy],[28,34+dy],[23,37+dy],[18,33+dy]],o);p([[18,29+dy],[23,30+dy],[28,29+dy],[27,33+dy],[23,35+dy],[20,32+dy]],'#daceb0');r(13,34,23,3,'#e4d6b1');r(16,38,2,16,gold);r(31,38,2,17,gold);r(23,38,3,4,gold);}
  l(14,56,33,56,gold);a.dot(16,55,gh);
 }else if(kind==='nun'){
  p([[13,35+dy],[12,18+dy],[15,10+dy],[22,6+dy],[31,9+dy],[36,18+dy],[35,37+dy],[30,38+dy],[30,28+dy],[17,28+dy],[18,38+dy]],o);
  p([[14,34+dy],[14,18+dy],[17,12+dy],[22,8+dy],[30,11+dy],[33,18+dy],[33,34+dy],[31,35+dy],[31,17+dy],[18,16+dy],[16,35+dy]],'#e3dfca');r(15,19+dy,2,17,shade);r(32,18+dy,2,19,shade);l(18,15+dy,30,15+dy,'#fff3d3');
  if(!back){v(cx,23+dy,6,7,skin);l(cx-4,18+dy,cx+4,18+dy,sl);l(cx-5,24+dy,cx-4,28+dy,ss);for(const ex of side?[cx+3]:[cx-4,cx+3]){r(ex,22+dy,2,blink?1:3,o);if(!blink)a.dot(ex,22+dy,'#fff1cf');}r(cx+1,25+dy,1,2,ss);l(cx-2,29+dy,cx+2,29+dy,'#98674e');}
  p([[15,33],[21,35],[24,38],[28,35],[33,33],[31,39],[24,41],[17,38]],'#d5d9cd');r(23,40,2,12,light);r(20,44,8,2,light);
 }else{
  if(!back){p([[17,27+dy],[22,30+dy],[29,27+dy],[31,31+dy],[27,37+dy],[21,37+dy],[17,32+dy]],'#d7cfb8');l(20,31+dy,23,35+dy,'#eee7d4');}
  r(18,36,2,20,light);r(30,37,2,19,shade);l(20,42,28,42,gold);l(35,46,35,61,'#bc9e61');v(35,44,2,2,gold);
 }
 if(pose==='ambient'&&frame===3){l(cx-3,51,cx-4,55,shade);l(cx+1,51,cx+2,54,light);}
 if(facing===3)a.mirror();a.border();return a.data;
}
