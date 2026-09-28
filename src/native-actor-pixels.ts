import type {Ink} from './hero-art';
export type ActorPoint=readonly [number,number];
/** Integer authoring surface, no browser, game state, clock or retained atlas cache. */
export class NativeActorPixels {
 readonly width=48; readonly height=64; readonly data=new Uint8ClampedArray(48*64*4);
 private colourCache=new Map<string,readonly number[]>();
 private colour(value:string){
  let c=this.colourCache.get(value);if(c)return c;
  if(!/^#[0-9a-f]{6}$/i.test(value))throw new TypeError('Native actor pigment must be opaque hex RGB');
  c=[parseInt(value.slice(1,3),16),parseInt(value.slice(3,5),16),parseInt(value.slice(5,7),16),255];this.colourCache.set(value,c);return c;
 }
 rect(x:number,y:number,w:number,h:number,colour:string|null){
  if(![x,y,w,h].every(Number.isInteger)||w<0||h<0)throw new RangeError('Integer nonnegative actor rectangle required');
  const c=colour===null?[0,0,0,0]:this.colour(colour);
  for(let yy=Math.max(0,y);yy<Math.min(64,y+h);yy++)for(let xx=Math.max(0,x);xx<Math.min(48,x+w);xx++)this.data.set(c,(yy*48+xx)*4);
 }
 dot(x:number,y:number,c:string){this.rect(x,y,1,1,c);}
 line(x:number,y:number,bx:number,by:number,c:string){
  if(![x,y,bx,by].every(Number.isInteger))throw new RangeError('Integer line endpoints required');
  const dx=Math.abs(bx-x),dy=-Math.abs(by-y),sx=x<bx?1:-1,sy=y<by?1:-1;let e=dx+dy;
  for(;;){this.dot(x,y,c);if(x===bx&&y===by)break;const n=e*2;if(n>=dy){e+=dy;x+=sx;}if(n<=dx){e+=dx;y+=sy;}}
 }
 polygon(points:readonly ActorPoint[],c:string){
  if(points.length<3||points.some(p=>p.length!==2||!p.every(Number.isInteger)))throw new RangeError('Integer polygon required');
  for(let y=Math.max(0,Math.min(...points.map(p=>p[1])));y<=Math.min(63,Math.max(...points.map(p=>p[1])));y++){
   const xs:number[]=[];
   for(let i=0;i<points.length;i++){const a=points[i]!,b=points[(i+1)%points.length]!;if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}
   xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)this.rect(Math.ceil(xs[i]!),y,Math.floor(xs[i+1]!)-Math.ceil(xs[i]!)+1,1,c);
  }
 }
 oval(cx:number,cy:number,rx:number,ry:number,c:string){
  if(![cx,cy,rx,ry].every(Number.isInteger)||rx<1||ry<1)throw new RangeError('Integer positive ellipse required');
  for(let j=-ry;j<=ry;j++){const w=Math.floor(rx*Math.sqrt(Math.max(0,1-j*j/(ry*ry))));this.rect(cx-w,cy+j,w*2+1,1,c);}
 }
 ink():Ink {let style:Ink['fillStyle']='#000000';return {get fillStyle(){return style;},set fillStyle(v){style=v;},clearRect:(x,y,w,h)=>this.rect(x,y,w,h,null),fillRect:(x,y,w,h)=>{if(typeof style!=='string')throw new TypeError('Native pigment required');this.rect(x,y,w,h,style);}};}
 mirror(){const out=this.data.slice();for(let y=0;y<64;y++)for(let x=0;x<48;x++)this.data.set(out.subarray((y*48+x)*4,(y*48+x+1)*4),(y*48+47-x)*4);}
 /** Preserve a two-pixel border and the original y=62 NPC contact row. */
 border(){this.rect(0,0,48,2,null);this.rect(0,63,48,1,null);this.rect(0,0,2,64,null);this.rect(46,0,2,64,null);}
}
export function sameActorPixels(a:ArrayLike<number>,b:ArrayLike<number>|null):boolean {if(!b||a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;}
