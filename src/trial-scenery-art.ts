/** Authored presentation for the existing 16 x 14 trial maps. No gameplay or clocks. */
export type TrialSceneryKind = 'courtroom' | 'guardia1000';
export const TRIAL_SCENERY = Object.freeze({width:384,height:352,worldWidth:16,worldDepth:14});
type Ink = Pick<CanvasRenderingContext2D,'fillStyle'|'fillRect'>;
const hash=(x:number,y:number)=>{let n=Math.imul(x+71,374761393)^Math.imul(y+19,668265263);n=Math.imul(n^(n>>>13),1274126177);return (n^(n>>>16))>>>0;};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
function patch(x:number,y:number){
 const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
 return mix(mix(hash(ix,iy)/4294967295,hash(ix+1,iy)/4294967295,sx),mix(hash(ix,iy+1)/4294967295,hash(ix+1,iy+1)/4294967295,sx),sy);
}
function segmentDistance(x:number,z:number,ax:number,az:number,bx:number,bz:number){
 const dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)));
 return Math.hypot(x-ax-t*dx,z-az-t*dz);
}
/** Same north-up mapping as the actual ground; does not assert traversability. */
export function trialSceneryPixel(x:number,z:number){
 if(!Number.isFinite(x)||!Number.isFinite(z))throw new RangeError('Finite scenery coordinates required');
 return {x:Math.round((x/16+.5)*384),y:Math.round((.5-z/14)*352)};
}
export function drawTrialSceneryFloor(c:Ink,w:number,h:number,kind:TrialSceneryKind):void{
 if(!Number.isSafeInteger(w)||!Number.isSafeInteger(h)||w<16||h<16||w>2048||h>2048)throw new RangeError('Invalid scenery surface');
 if(kind!=='courtroom'&&kind!=='guardia1000')throw new RangeError('Unknown trial scenery');
 // Quantize boundaries once, so nearest sampling has no half-pixel cracks at any export size.
 const rect=(x:number,y:number,rw:number,rh:number,color:string)=>{c.fillStyle=color;const l=Math.round(x*w/384),t=Math.round(y*h/352);c.fillRect(l,t,Math.round((x+rw)*w/384)-l,Math.round((y+rh)*h/352)-t);};
 if(kind==='guardia1000'){
  rect(0,0,384,352,'#374b35');
  for(let py=0;py<352;py+=4)for(let px=0;px<384;px+=4){
   const x=(px+2)/384*16-8,z=7-(py+2)/352*14;
   const path=Math.min(segmentDistance(x,z,0,-7,-.35,-1),segmentDistance(x,z,-.35,-1,0,6.8),segmentDistance(x,z,-.1,.3,5.5,4));
   const v=patch(px/52,py/44),edge=.13*(patch(px/26,py/24)-.5);
   const color=path<.82+edge?(v<.4?'#61583d':v<.7?'#685e41':'#6c6245'):
    path<1.14+edge?(v<.5?'#50563a':'#565a3d'):(v<.33?'#344832':v<.55?'#3a5036':v<.73?'#40563a':'#465a3d');
   rect(px,py,4,4,color);
  }
  // Sparse paired leaf marks stay outside the actor trail, not bright single-pixel noise.
  for(let i=0;i<32;i++){
   const px=12+hash(i,37)%356,py=12+hash(i,93)%328,x=px/24-8,z=7-py/352*14;
   const d=Math.min(segmentDistance(x,z,0,-7,-.35,-1),segmentDistance(x,z,-.35,-1,0,6.8),segmentDistance(x,z,-.1,.3,5.5,4));
   if(d>1.6){rect(px,py,4,2,'#4c5d3e');rect(px+3,py+2,3,2,'#405339');}
  }
 }else{
  rect(0,0,384,352,'#575d57');
  const stone=['#656b63','#686e65','#6b7067','#626960'];
  for(let row=0;row<11;row++)for(let col=-1;col<9;col++){
   const x=col*48+(row%2)*24,y=row*32;
   rect(x+1,y+1,47,31,stone[hash(col,row)%stone.length]!);
   // Broad low-contrast bevel, not a second high-frequency checkerboard.
   rect(x+2,y+2,45,1,'#71776d');
  }
  for(const x of [28,352]){rect(x,0,4,352,'#727362');rect(x+1,0,2,352,'#8a8365');}
  // Runner ends under the existing defendant stand. Upper dais geometry stays untouched.
  rect(165,178,54,174,'#613e42');rect(166,178,2,174,'#9a835a');rect(216,178,2,174,'#9a835a');
  rect(171,181,42,171,'#70484a');rect(173,181,2,171,'#795050');rect(209,181,2,171,'#795050');
  for(const y of [244,306]){
   rect(187,y-4,10,2,'#957b55');rect(183,y-2,18,2,'#957b55');rect(181,y,22,2,'#957b55');
   rect(183,y+2,18,2,'#957b55');rect(187,y+4,10,2,'#957b55');rect(186,y,12,2,'#70484a');
  }
 }
}
export type CourtDetail = Readonly<{name:string;x:number;y:number;z:number;w:number;h:number;d:number;color:string}>;
/** Thin facings on existing fixtures only; no new standing objects or collision solids. */
export function courtFixtureDetails():readonly CourtDetail[]{
 const parts:CourtDetail[]=[];
 const add=(name:string,x:number,y:number,z:number,w:number,h:number,d:number,color:string)=>parts.push(Object.freeze({name,x,y,z,w,h,d,color}));
 for(let i=0;i<7;i++){
  const x=(i<4?-1:1)*5.5,z=1+(i%4)*1.28;
  add('scenery-jury-panel-'+i,x,.3,z-.61,1.9,.3,.035,'#605441');
  add('scenery-jury-rail-'+i,x,.51,z-.62,2.28,.065,.07,'#9b8863');
  add('scenery-jury-inlay-'+i,x,.33,z-.633,.55,.05,.015,'#b09c6d');
 }
 for(const [name,x,y,z,w,h,d] of [['judge',0,1.02,4.2,1.7,.85,1.2],['stand',0,.43,-1.2,1.5,.7,.7]] as const){
  add('scenery-'+name+'-panel',x,y,z-d/2-.014,w-.2,h-.22,.026,'#6e593e');
  add('scenery-'+name+'-lip',x,y+h/2-.035,z-d/2-.028,w,.07,.06,'#b09a68');
  for(const side of [-1,1])add('scenery-'+name+'-stile-'+side,x+side*(w/2-.14),y,z-d/2-.032,.07,h-.18,.018,'#9d8355');
  add('scenery-'+name+'-inlay',x,y+.025,z-d/2-.033,.32,.06,.018,'#b9a373');
 }
 return Object.freeze(parts);
}
