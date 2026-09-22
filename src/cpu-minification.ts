/** Bounded CPU-only box-filter levels for opaque surfaces. Original asset bytes,
 * alpha-cutout sprites and the WebGL material/sampling configuration are untouched. */
export type CpuMipLevel={width:number;height:number;rgba:Uint8ClampedArray};
export function mipBytes(base:CpuMipLevel,levels:readonly CpuMipLevel[]=[]):number{
 return base.rgba.byteLength+levels.reduce((n,l)=>n+l.rgba.byteLength,0);
}
export function opaqueMipChain(base:CpuMipLevel,budget:number):CpuMipLevel[]{
 let w=base.width,h=base.height,total=w*h*4;
 if(!Number.isSafeInteger(w)||!Number.isSafeInteger(h)||w<1||h<1||base.rgba.length!==total)throw Error('Invalid CPU texture dimensions');
 const sizes: Array<[number,number]>=[];
 while(w>1||h>1){w=Math.max(1,Math.floor(w/2));h=Math.max(1,Math.floor(h/2));total+=w*h*4;sizes.push([w,h]);}
 // Keep the existing base texture usable if a complete chain cannot fit.
 if(total>budget)return [];
 const levels:CpuMipLevel[]=[];let previous=base;
 for(const [width,height] of sizes){
  const rgba=new Uint8ClampedArray(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const x0=Math.floor(x*previous.width/width),x1=Math.floor((x+1)*previous.width/width);
   const y0=Math.floor(y*previous.height/height),y1=Math.floor((y+1)*previous.height/height),count=(x1-x0)*(y1-y0);
   for(let c=0;c<4;c++){
    let sum=0;for(let sy=y0;sy<y1;sy++)for(let sx=x0;sx<x1;sx++)sum+=previous.rgba[(sy*previous.width+sx)*4+c]!;
    rgba[(y*width+x)*4+c]=Math.round(sum/count);
   }
  }
  previous={width,height,rgba};levels.push(previous);
 }
 return levels;
}
export type MipVertex={sx:number;sy:number;u:number;v:number;iw:number};
/** Affine (orthographic) footprint in original texels per output pixel.
 * Invalid/perspective-varying inputs never acquire an affine filtering path. */
function opaqueFootprint(a:MipVertex,b:MipVertex,c:MipVertex,width:number,height:number,m:readonly number[]):number{
 if(![width,height].every(n=>Number.isFinite(n)&&n>0)||m.length<10||
  ![0,1,4,5,8,9].every(i=>Number.isFinite(m[i]))||
  ![a,b,c].every(p=>[p.sx,p.sy,p.u,p.v,p.iw].every(Number.isFinite)&&p.iw>0)||
  Math.abs(a.iw-b.iw)>1e-9||Math.abs(a.iw-c.iw)>1e-9)return NaN;
 const area=(b.sx-a.sx)*(c.sy-a.sy)-(b.sy-a.sy)*(c.sx-a.sx);
 if(!Number.isFinite(area)||Math.abs(area)<1e-8)return NaN;
 const dx=(p:number,q:number,r:number)=>(p*(b.sy-c.sy)+q*(c.sy-a.sy)+r*(a.sy-b.sy))/area;
 const dy=(p:number,q:number,r:number)=>(p*(c.sx-b.sx)+q*(a.sx-c.sx)+r*(b.sx-a.sx))/area;
 const ux=dx(a.u,b.u,c.u),uy=dy(a.u,b.u,c.u),vx=dx(a.v,b.v,c.v),vy=dy(a.v,b.v,c.v);
 return Math.max(Math.hypot((ux*m[0]!+vx*m[4]!)*width,(ux*m[1]!+vx*m[5]!)*height),
                 Math.hypot((uy*m[0]!+vy*m[4]!)*width,(uy*m[1]!+vy*m[5]!)*height));
}
/** Retained discrete-level API: zero means the first half-size mip. */
export function opaqueMipLevel(a:MipVertex,b:MipVertex,c:MipVertex,width:number,height:number,m:readonly number[],count:number):number{
 if(!Number.isSafeInteger(count)||count<1)return -1;
 const rho=opaqueFootprint(a,b,c,width,height,m);
 if(!Number.isFinite(rho)||rho<2)return -1;
 return Math.min(count-1,Math.floor(Math.log2(rho))-1);
}
export type CpuMipBlend=Readonly<{lower:number;upper:number;mix:number}>;
/** Level zero is the original texture; levels 1..count are box-filter mips.
 * Blend adjacent levels, including original -> first mip for 1 < rho < 2.
 * This avoids both a no-op at mild minification and an abrupt half-size blur.
 * Level selection happens once per triangle, never in the fragment loop. */
export function opaqueMipBlend(a:MipVertex,b:MipVertex,c:MipVertex,width:number,height:number,m:readonly number[],count:number):CpuMipBlend|null{
 if(!Number.isSafeInteger(count)||count<1)return null;
 const rho=opaqueFootprint(a,b,c,width,height,m);
 if(!Number.isFinite(rho)||rho<=1)return null;
 const lod=Math.min(count,Math.log2(rho)),lower=Math.floor(lod),upper=Math.min(count,lower+1);
 return {lower,upper,mix:upper===lower?0:lod-lower};
}
