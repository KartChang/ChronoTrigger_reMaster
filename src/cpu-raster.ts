import {opaqueMipLevel} from './cpu-minification';
import type {CpuMipLevel} from './cpu-minification';
import {clipOutcode} from './cpu-visibility';
/** Small CPU triangle rasterizer. Canvas2D only presents the completed RGBA buffer.
 * No WebGL, DOM, game state, textures created by a driver, or synthetic success path. */
export type ClipVertex={x:number;y:number;z:number;w:number;u:number;v:number;r:number;g:number;b:number;a:number};
export type CpuTexture={width:number;height:number;rgba:Uint8ClampedArray;invertY:boolean;wrapU:number;wrapV:number;matrix:readonly number[];mips?:readonly CpuMipLevel[]};
export type CpuSurface={texture:CpuTexture|null;opacity:CpuTexture|null;opacityFromRGB:boolean;textureAlpha:boolean;alpha:number;cutoff:number;blend:boolean;emission:readonly number[]};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const keys=['x','y','z','w','u','v','r','g','b','a'] as const;
const planes=[(v:ClipVertex)=>v.w+v.x,(v:ClipVertex)=>v.w-v.x,(v:ClipVertex)=>v.w+v.y,(v:ClipVertex)=>v.w-v.y,(v:ClipVertex)=>v.w+v.z,(v:ClipVertex)=>v.w-v.z];
/** Homogeneous clipping preserves attributes through the near plane and viewport. */
export function clipTriangle(a:ClipVertex,b:ClipVertex,c:ClipVertex):ClipVertex[]{
 if(![a,b,c].every(v=>keys.every(k=>Number.isFinite(v[k]))))return [];
 let polygon=[a,b,c];
 for(const distance of planes){
  const next:ClipVertex[]=[];
  for(let i=0;i<polygon.length;i++){
   const p=polygon[i]!,q=polygon[(i+1)%polygon.length]!,dp=distance(p),dq=distance(q),inside=dp>=0;
   if(inside)next.push(p);
   if(inside!==(dq>=0)){const t=dp/(dp-dq),v={...p};for(const k of keys)v[k]=p[k]+(q[k]-p[k])*t;next.push(v);}
  }
  polygon=next;if(polygon.length<3)return [];
 }
 return polygon.filter(v=>v.w>1e-9);
}
const wrap=(n:number,mode:number)=>mode===0?Math.min(1-Number.EPSILON,clamp(n)):mode===2?(Math.floor(n)%2===0?n-Math.floor(n):1-(n-Math.floor(n))):n-Math.floor(n);
/** WebGL-compatible UV transform/wrap; source bytes retain the original canvas row order. */
export function textureIndex(t:CpuTexture,u:number,v:number):number{
 const m=t.matrix,uu=u*m[0]!+v*m[4]!+m[8]!,vv=u*m[1]!+v*m[5]!+m[9]!;
 const x=Math.min(t.width-1,Math.max(0,Math.floor(wrap(uu,t.wrapU)*t.width)));
 const y0=wrap(vv,t.wrapV),y=Math.min(t.height-1,Math.max(0,Math.floor((t.invertY?1-y0:y0)*t.height)));
 return (y*t.width+x)*4;
}
type Screen=ClipVertex&{sx:number;sy:number;sz:number;iw:number};
const edge=(a:Screen,b:Screen,x:number,y:number)=>(b.sx-a.sx)*(y-a.sy)-(b.sy-a.sy)*(x-a.sx);
const topLeft=(a:Screen,b:Screen)=>b.sy<a.sy||(b.sy===a.sy&&b.sx>a.sx);
const accepted=(e:number,t:boolean)=>e>1e-8||(Math.abs(e)<=1e-8&&t);
export class CpuRaster {
 readonly rgba:Uint8ClampedArray;readonly depth:Float32Array;
 minifiedTriangles=0;triangles=0;fragments=0;submitted=0;fastAccepted=0;trivialRejected=0;clipped=0;
 constructor(readonly width:number,readonly height:number){
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width*height>640*480)throw Error('CPU raster size outside bounded pixel budget');
  this.rgba=new Uint8ClampedArray(width*height*4);this.depth=new Float32Array(width*height);
 }
 clear(color:readonly number[]):void{
  this.depth.fill(Infinity);this.minifiedTriangles=0;this.triangles=0;this.fragments=0;
  this.submitted=0;this.fastAccepted=0;this.trivialRejected=0;this.clipped=0;
  const r=Math.round(clamp(color[0]??0)*255),g=Math.round(clamp(color[1]??0)*255),b=Math.round(clamp(color[2]??0)*255);
  for(let i=0;i<this.rgba.length;i+=4){this.rgba[i]=r;this.rgba[i+1]=g;this.rgba[i+2]=b;this.rgba[i+3]=255;}
 }
 triangle(a:ClipVertex,b:ClipVertex,c:ClipVertex,material:CpuSurface):void{
  this.submitted++;
  const ca=clipOutcode(a.x,a.y,a.z,a.w),cb=clipOutcode(b.x,b.y,b.z,b.w),cc=clipOutcode(c.x,c.y,c.z,c.w);
  const attributes=(v:ClipVertex)=>Number.isFinite(v.u)&&Number.isFinite(v.v)&&Number.isFinite(v.r)&&Number.isFinite(v.g)&&Number.isFinite(v.b)&&Number.isFinite(v.a);
  if(ca===64||cb===64||cc===64||!attributes(a)||!attributes(b)||!attributes(c)||(ca&cb&cc)!==0){this.trivialRejected++;return;}
  // Most visible triangles need no polygon lists or six clipping passes.
  // Keep the original near-zero-w and crossing-plane path unchanged.
  if((ca|cb|cc)===0&&a.w>1e-9&&b.w>1e-9&&c.w>1e-9){this.fastAccepted++;this.fill(a,b,c,material);return;}
  this.clipped++;const p=clipTriangle(a,b,c);for(let i=1;i+1<p.length;i++)this.fill(p[0]!,p[i]!,p[i+1]!,material);
 }
 private fill(av:ClipVertex,bv:ClipVertex,cv:ClipVertex,m:CpuSurface):void{
  const project=(v:ClipVertex):Screen=>({...v,sx:(v.x/v.w*.5+.5)*this.width,sy:(.5-v.y/v.w*.5)*this.height,sz:v.z/v.w*.5+.5,iw:1/v.w});
  const a=project(av);let b=project(bv),c=project(cv),area=edge(a,b,c.sx,c.sy);
  if(Math.abs(area)<1e-8)return;if(area<0){[b,c]=[c,b];area=-area;}
  const x0=Math.max(0,Math.ceil(Math.min(a.sx,b.sx,c.sx)-.5)),x1=Math.min(this.width-1,Math.floor(Math.max(a.sx,b.sx,c.sx)-.5));
  const y0=Math.max(0,Math.ceil(Math.min(a.sy,b.sy,c.sy)-.5)),y1=Math.min(this.height-1,Math.floor(Math.max(a.sy,b.sy,c.sy)-.5));
  const tl0=topLeft(b,c),tl1=topLeft(c,a),tl2=topLeft(a,b),pixels=this.rgba,zbuffer=this.depth;
  this.triangles++;
  // Select once per triangle, not per pixel. Never filter opacity/cutout/blend surfaces.
  let diffuse=m.texture;
  if(diffuse?.mips?.length&&!m.textureAlpha&&!m.opacity&&!m.blend&&m.cutoff===0){
   const lod=opaqueMipLevel(a,b,c,diffuse.width,diffuse.height,diffuse.matrix,diffuse.mips.length);
   if(lod>=0){diffuse={...diffuse,...diffuse.mips[lod]!};this.minifiedTriangles++;}
  }
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   const e0=edge(b,c,x+.5,y+.5),e1=edge(c,a,x+.5,y+.5),e2=edge(a,b,x+.5,y+.5);
   if(!accepted(e0,tl0)||!accepted(e1,tl1)||!accepted(e2,tl2))continue;
   const f0=e0/area,f1=e1/area,f2=e2/area,z=f0*a.sz+f1*b.sz+f2*c.sz,index=y*this.width+x;
   if(z<0||z>1||z>zbuffer[index]!+1e-7)continue;
   const iw=f0*a.iw+f1*b.iw+f2*c.iw;if(iw<=0)continue;
   const k0=f0*a.iw/iw,k1=f1*b.iw/iw,k2=f2*c.iw/iw;
   const u=k0*a.u+k1*b.u+k2*c.u,v=k0*a.v+k1*b.v+k2*c.v;
   let r=k0*a.r+k1*b.r+k2*c.r,g=k0*a.g+k1*b.g+k2*c.g,blue=k0*a.b+k1*b.b+k2*c.b,alpha=clamp(m.alpha*(k0*a.a+k1*b.a+k2*c.a));
   if(diffuse){const t=diffuse,i=textureIndex(t,u,v);r*=t.rgba[i]!/255;g*=t.rgba[i+1]!/255;blue*=t.rgba[i+2]!/255;if(m.textureAlpha)alpha*=t.rgba[i+3]!/255;}
   if(m.opacity){const t=m.opacity,i=textureIndex(t,u,v);alpha*=m.opacityFromRGB?(t.rgba[i]!*.3+t.rgba[i+1]!*.59+t.rgba[i+2]!*.11)/255:t.rgba[i+3]!/255;}
   if(alpha<=0||alpha<m.cutoff)continue;
   r=clamp(r+(m.emission[0]??0));g=clamp(g+(m.emission[1]??0));blue=clamp(blue+(m.emission[2]??0));
   if(!m.blend)alpha=1;
   const j=index*4,inv=1-alpha;pixels[j]=r*255*alpha+pixels[j]!*inv;pixels[j+1]=g*255*alpha+pixels[j+1]!*inv;pixels[j+2]=blue*255*alpha+pixels[j+2]!*inv;
   if(!m.blend)zbuffer[index]=z;this.fragments++;
  }
 }
}
