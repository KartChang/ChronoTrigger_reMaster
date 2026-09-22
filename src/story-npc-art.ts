import type {Ink} from './hero-art';
/** Authored replacement pixels for existing 600-era NPCs, never ROM extracts.
 * Same world-space planes/anchors. The held home resident renderer is not used.
 */
export const STORY_NPC_ART={id:'vq02q-story-npc-cloth-and-silhouette',width:48,height:64,frames:4,approved:false,romPixels:false} as const;
export const STORY_NPC_KINDS=['resident','innkeeper','guard','king','nun','queen','chancellor'] as const;
export type StoryNpcKind=typeof STORY_NPC_KINDS[number];
const outfits={
 resident:['#718165','#43594e','#a9b292'],innkeeper:['#ad9a71','#766c55','#ded0a1'],
 guard:['#889ba3','#506375','#c5cfca'],king:['#786583','#4d455e','#baa5ae'],
 nun:['#657384','#3b4859','#a2b0b8'],queen:['#628b8a','#3f616e','#b1c2ac'],
 chancellor:['#77798a','#494e63','#b6b5b6']
} as const;
export function drawStoryNpc(c:Ink,kind:StoryNpcKind,frame=0):void{
 if(!Object.hasOwn(outfits,kind))throw new Error('Unknown story NPC kind');
 const f=Number.isFinite(frame)?((Math.floor(frame)%4)+4)%4:0,breath=f===1?-1:0,blink=f===2;
 const [cloth,shade,light]=outfits[kind],o='#2e303e',skin='#e5b58b',skinShadow='#b88060',skinLight='#f5d5a5',gold='#c6ac70';
 c.clearRect(0,0,48,64);
 const r=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 const top=(x:number,y:number,w:number,h:number,col:string)=>r(x,y+breath,w,h,col);
 // Planted boots and tapered separated legs. Breathing never translates the feet.
 for(const x of [15,27]){r(x,48,7,13,o);r(x+1,49,5,9,shade);r(x,58,8,4,'#655044');r(x+1,58,5,1,'#a17c58');r(x-2,62,10,1,o);}
 const gown=['king','nun','queen','chancellor'].includes(kind);
 r(12,32,24,gown?27:21,o);r(13,33,22,gown?24:18,cloth);
 r(14,34,4,gown?22:16,shade);r(20,34,7,13,light);r(30,34,4,gown?22:17,shade);
 r(19,36,2,gown?20:14,cloth);r(27,37,2,gown?19:13,light);
 if(gown){r(11,55,26,4,o);r(13,55,22,2,cloth);r(15,55,2,2,light);r(30,53,2,4,shade);}
 else{r(14,49,20,3,'#685b45');r(23,49,3,3,gold);r(14,52,8,3,cloth);r(26,52,8,3,shade);}
 // Sleeves overlap the torso at the shoulders, but fingers keep an independent silhouette.
 for(const [x,col] of [[9,cloth],[35,shade]] as const){top(x,34,4,17,o);top(x+1,35,2,11,col);top(x+1,46,2,4,skin);top(x+1,46,1,3,skinLight);}
 // Stepped temples, cheek and jaw avoid the old rectangular head.
 top(17,10,15,3,o);top(14,13,20,15,o);top(16,27,16,4,o);top(19,30,10,3,o);
 top(16,14,16,13,skin);top(18,26,13,4,skin);top(20,30,8,3,skinShadow);
 top(16,18,2,9,skinShadow);top(29,22,3,5,skinShadow);top(19,15,9,3,skinLight);
 top(24,23,2,3,skinShadow);top(25,23,1,2,skinLight);top(22,28,5,1,'#996856');
 top(13,20,2,5,skinShadow);top(33,20,2,5,skin);
 const hair=kind==='king'||kind==='chancellor'?'#b5ab91':'#70513f';
 top(16,9,16,5,o);top(15,12,19,5,hair);top(17,11,9,2,kind==='king'?'#d5ccb0':'#a07b51');
 top(15,16,3,7,hair);top(31,16,2,8,hair);top(18,16,4,2,hair);
 top(19,20,4,1,'#765544');top(27,20,4,1,'#765544');
 for(const x of [19,28]){top(x,22,3,blink?1:4,o);if(!blink){top(x,22,1,2,'#f7edca');top(x+1,23,1,2,'#40515b');}}
 top(19,33,10,2,light);top(21,35,6,1,gold);
 if(kind==='resident'){
  r(16,35,2,15,'#b5aa7e');r(32,47,6,11,o);r(33,48,4,8,'#9b8055');r(33,50,4,2,gold);r(34,53,1,1,o);
  r(22,42+(f===3?1:0),6,1,shade);
 }else if(kind==='innkeeper'){
  top(14,12,20,5,'#4b3b36');top(17,10,14,3,'#8b674c');
  r(18,34,3,11,gold);r(29,34,3,11,gold);r(14,43,20,15,light);r(15,44,18,1,'#eee0b7');
  r(17,48,14,8,'#a39879');r(18,48,12,1,'#e4d8af');r(18,54,12,1,'#847a61');r(31,45,2,11,'#b5a580');
  top(21,28,6,2,'#7d5440');
 }else if(kind==='guard'){
  top(16,7,15,2,o);top(14,9,19,9,o);top(16,9,15,7,cloth);top(18,9,3,6,light);top(14,16,20,2,shade);top(25,8,2,10,light);
  r(12,34,24,5,shade);r(13,34,10,3,light);r(26,35,9,2,cloth);r(20,40,10,9,shade);r(21,40,8,2,light);r(22,43,6,4,cloth);
  r(6,24,2,38,o);r(7,28,1,33,'#af9667');r(5,21,4,7,light);r(6,18,2,4,light);r(5,27,4,1,shade);
  r(31,44,8,13,o);r(32,45,6,11,shade);r(34,46,2,8,gold);
 }else if(kind==='king'){
  top(14,8,20,5,o);top(15,9,18,3,gold);for(const x of [15,23,31]){top(x,4,x===23?3:2,7,gold);top(x,4,1,4,'#ecdc99');}
  top(18,28,3,5,'#d7cbb0');top(22,30,8,5,'#d7cbb0');top(22,33,5,3,'#a69b87');
  r(13,34,22,6,'#d8cba1');r(14,36,4,4,'#aeaa94');r(30,36,4,4,'#aeaa94');r(17,40,2,15,gold);r(30,40,2,15,gold);
  r(24,37,4,5,o);r(25,38,2,3,gold);r(14,55,20,2,gold);
 }else if(kind==='queen'){
  top(13,12,3,24,hair);top(32,12,3,24,hair);top(13,14,1,17,'#b38b54');top(33,20,2,16,'#4c4140');
  top(16,8,16,3,gold);for(const x of [17,23,29])top(x,5,2,4,'#e4d199');top(23,8,3,3,'#77aaa6');
  top(14,25,2,2,gold);top(32,25,2,2,gold);r(19,34,2,22,'#c3c4a2');r(29,35,2,21,'#c3c4a2');
  r(23,35,4,4,gold);r(24,36,2,2,'#dce3c0');r(14,54,20,2,'#adb792');r(20,44+(f===3?1:0),9,1,light);
 }else if(kind==='nun'){
  top(13,8,22,27,o);top(14,10,20,24,'#d6d4b8');top(15,14,18,21,shade);top(17,16,14,15,skin);
  top(18,18,12,2,skinLight);for(const x of [19,27]){top(x,22,2,blink?1:3,o);if(!blink)top(x,22,1,1,'#eee4c4');}
  top(24,25,2,2,skinShadow);top(21,29,6,1,skinShadow);top(15,13,18,3,'#eee8cc');
  top(13,12,3,26,shade);top(33,12,3,26,shade);r(16,33,17,5,'#d5d3b9');r(21,38,4,15,light);r(18,42,10,2,light);
  r(13,54,21,2,shade);
 }else{
  top(14,18,4,6,'#d7cdb1');top(31,18,4,6,'#a49e8e');top(18,29,13,5,'#d6cdb5');top(22,33,7,3,'#b3ad9b');
  r(17,38,3,19,light);r(30,37,3,20,shade);r(20,40,10,2,gold);r(22,44,6,2,'#9b936e');r(35,46,2,17,'#a7946d');
 }
 // Cloth settles one pixel; the bottom contact row never moves.
 if(f===3){r(23,52,1,3,shade);r(24,52,1,3,light);}
}
