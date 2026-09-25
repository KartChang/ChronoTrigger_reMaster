import type {Ink} from './hero-art';
import {drawTrialOak} from './trial-detail-art';
/** Reuses the four accepted authored oak variations without changing their painter.
 * Two transparent columns on either side isolate tiles under nearest sampling. */
export const CANYON_CANOPY={width:272,height:80,tileWidth:64,stride:68,gutter:2,variants:4,approved:false,romPixels:false} as const;
export function drawCanyonCanopyAtlas(c:Ink):void{
 c.clearRect(0,0,CANYON_CANOPY.width,CANYON_CANOPY.height);
 for(let variant=0;variant<4;variant++){
  const offset=variant*68+2;
  const tile:Ink={get fillStyle(){return c.fillStyle;},set fillStyle(v){c.fillStyle=v;},
   fillRect(x,y,w,h){c.fillRect(offset+x,y,w,h);},clearRect(x,y,w,h){c.clearRect(offset+x,y,w,h);}};
  drawTrialOak(tile,variant);
 }
}
/** Immutable tile placement, not random per-frame UV changes or mirrored lighting. */
export function canyonCanopyUV(input:ArrayLike<number>,variant:number):number[]{
 if(!Number.isInteger(variant)||variant<0||variant>=4||input.length%2!==0||input.length===0||!Array.from(input).every(v=>Number.isFinite(v)&&v>=0&&v<=1))throw new RangeError('Invalid canyon canopy UVs');
 return Array.from(input,(v,i)=>i%2?v:(variant*68+2+v*64)/272);
}
