import {Mesh,Texture,VertexBuffer} from '@babylonjs/core';
import {noise} from './surface-layout';

/** Fair-only presentation. The retained painter, walkable map and scene transforms are untouched. */
export const FAIR_GROUND_PROFILE = 'vq01s-static-ground-depth' as const;
const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
const smooth=(a:number,b:number,n:number)=>{const t=clamp((n-a)/(b-a));return t*t*(3-2*t);};
function field(x:number,z:number):number {
 const u=x/5,v=z/5,ix=Math.floor(u),iz=Math.floor(v),fx=smooth(0,1,u-ix),fz=smooth(0,1,v-iz);
 const a=noise(ix,iz,73)*(1-fx)+noise(ix+1,iz,73)*fx;
 const b=noise(ix,iz+1,73)*(1-fx)+noise(ix+1,iz+1,73)*fx;
 return a*(1-fz)+b*fz;
}
/** Broad colour fields sit below the original pixel detail; no noise, upload or clock per frame. */
export function fairGroundTone(x:number,z:number):readonly [number,number,number,number] {
 if(!Number.isFinite(x)||!Number.isFinite(z))throw new Error('Non-finite fair ground position');
 const route=Math.max(1-smooth(1.2,3.3,Math.abs(x)),1-smooth(.8,2.2,Math.abs(z+7.1)));
 const bell=1-smooth(1.5,4.8,Math.hypot(x+3.5,z+.5));
 const edge=Math.max(smooth(9,13.4,Math.abs(x)),smooth(7.6,10.4,Math.abs(z-1)));
 const base=.88+.035*(field(x,z)-.5)+.075*route+.045*bell-.095*edge;
 return [clamp(base+.016*route,.74,1),clamp(base+.006*bell,.74,1),clamp(base-.03*route,.74,1),1];
}
/** One immutable vertex buffer; no extra texture, overlay mesh, collider or render pass. */
export function shadeFairGround(mesh:Mesh):void {
 const positions=mesh.getVerticesData(VertexBuffer.PositionKind);
 if(!positions||positions.length%3)throw new Error('Fair ground positions missing');
 const colours=new Float32Array(positions.length/3*4);
 for(let i=0;i<positions.length;i+=3)colours.set(fairGroundTone(positions[i]!+mesh.position.x,positions[i+2]!+mesh.position.z),i/3*4);
 mesh.setVerticesData(VertexBuffer.ColorKind,colours,false,4);
 mesh.useVertexColors=true;mesh.hasVertexAlpha=false;
 mesh.metadata={...mesh.metadata,groundProfile:FAIR_GROUND_PROFILE,gameCollision:false};
}
/** Read the live mesh/texture, not a manufactured pass flag; only invoked by the observation API. */
export function inspectFairGround(mesh:Mesh,texture:Texture) {
 const values=mesh.getVerticesData(VertexBuffer.ColorKind)??[];
 let min=1,max=0,alphaMin=1,alphaMax=0,checksum=2166136261;
 for(let i=0;i<values.length;i++){
  const n=values[i]!;if(i%4===3){alphaMin=Math.min(alphaMin,n);alphaMax=Math.max(alphaMax,n);}else{min=Math.min(min,n);max=Math.max(max,n);}
  checksum=Math.imul(checksum^Math.round(n*65535),16777619)>>>0;
 }
 return {profile:mesh.metadata?.groundProfile??null,source:'actual-fair-ground-buffer',approved:false,
  vertices:mesh.getTotalVertices(),triangles:mesh.getTotalIndices()/3,colourValues:values.length,
  useVertexColors:mesh.useVertexColors,hasVertexAlpha:mesh.hasVertexAlpha,
  dynamic:mesh.getVertexBuffer(VertexBuffer.ColorKind)?.isUpdatable()??null,
  min,max,alphaMin,alphaMax,checksum:checksum.toString(16),position:mesh.position.asArray(),
  texture:{width:texture.getSize().width,height:texture.getSize().height,sampling:texture.samplingMode,
   mipmaps:texture.getInternalTexture()?.generateMipMaps??false,anisotropy:texture.anisotropicFilteringLevel},
  collision:mesh.checkCollisions,visible:mesh.isEnabled()};
}
