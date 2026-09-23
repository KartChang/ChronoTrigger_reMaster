/** Authored window joinery and warm glass. Rect-only original pixels; no fonts,
 * ROM media, random source, clock or gameplay dependency. Shared per Truce owner. */
export const TOWN_DETAIL_ART=Object.freeze({id:'vq02v-town-details',approved:false,romPixels:false,signScale:2.75});
export const DETAIL_KINDS=['frame','glass'] as const;
export type DetailKind=typeof DETAIL_KINDS[number];
export const DETAIL_SIZES=Object.freeze({frame:64,glass:32});
export const DETAIL_SAMPLE_POINTS=[[0,0],[3,3],[7,12],[13,21],[23,8],[30,30]] as const;
export function drawTownDetail(c:CanvasRenderingContext2D,kind:DetailKind):void{
 if(!DETAIL_KINDS.includes(kind))throw new Error('Unknown town detail');
 const rect=(color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 if(kind==='frame'){
  rect('#614732',0,0,64,64);rect('#ac8150',3,2,57,59);
  // Broad planed boards, recessed joints and occasional tool marks, not noise.
  for(let row=0;row<4;row++){
   const y=3+row*15;rect(row%2?'#997244':'#aa8050',4,y,55,14);
   rect('#c69b63',4,y,54,2);rect('#745233',5,y+12,55,2);
   rect('#89613d',10+row*3,y+6,24,1);rect('#bd9056',33-row*4,y+9,16,1);
  }
  rect('#45382c',0,0,3,64);rect('#d0a66a',3,0,2,64);
  rect('#795536',59,0,3,64);rect('#3b3027',62,0,2,64);
  for(const y of [7,53]){rect('#514331',7,y,3,3);rect('#d6b079',7,y,2,1);rect('#514331',54,y,3,3);}
 }else{
  rect('#725d38',0,0,32,32);rect('#bc9658',2,2,28,28);
  // Four leaded panes with restrained, stepped sky reflections and warm interiors.
  for(const x of [3,17])for(const y of [3,17]){
   rect('#d4b475',x,y,12,12);rect('#e1c78f',x+1,y+7,10,4);
   rect('#9fa991',x,y,12,3);rect('#bec7a8',x+1,y+1,8,2);
   rect('#b3945c',x+10,y+3,2,9);rect('#a57f49',x,y+11,12,1);
   rect('#edd9ac',x+2,y+5,3,2);rect('#e5cea0',x+4,y+3,2,2);
  }
  rect('#6b634e',15,2,2,28);rect('#827047',2,15,28,2);
  rect('#dfc48b',2,2,28,1);rect('#574b36',0,30,32,2);
 }
}
