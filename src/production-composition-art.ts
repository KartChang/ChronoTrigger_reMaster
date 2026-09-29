/** VQ04N actual model/pixel authoring. Pure inputs, no State/native-report access.
 * M roof dressing is retained upstream. This pass changes the roof envelope and
 * seats the previously uncompressed court fascia on the existing H furniture. */
import {ARCHITECTURE_ART,reshapeArchitecture} from './production-architecture-art';
import {courtFixtureDetails} from './trial-scenery-art';
import type {PixelSurface,ProductionSurface} from './production-art';
export const COMPOSITION_ART=Object.freeze({
 id:'vq04n-roof-envelope-court-fascia-canopy',approved:false,
 roofParts:48,roofEaveY:2.18,roofHeightScale:.72,courtFasciaParts:10,
 canopyWidth:544,canopyHeight:160,canopyVariants:4,retainedRootFromRow:108,
 addedMeshes:0,addedMaterials:0,addedTextures:0,addedRetainedGeometry:0,
});
const roofNames=new Set(['truce-pitched-roof','truce-roof-course','truce-ridge','truce-chimney']);
export function reshapeProductionRoof(name:string,positions:readonly number[],originY:number,rotationZ:number):number[]|null{
 if(!roofNames.has(name))return null;
 // One parent-space affine compression preserves horizontal footprint and the
 // already-authored M courses/UVs; chimney and cap follow the same roof envelope.
 return reshapeArchitecture(positions,originY,rotationZ,COMPOSITION_ART.roofEaveY,COMPOSITION_ART.roofHeightScale);
}
const fascia=courtFixtureDetails().filter(p=>/^scenery-(judge|stand)-(panel|lip|stile-[-]?1|inlay)$/.test(p.name));
if(fascia.length!==COMPOSITION_ART.courtFasciaParts)throw new Error('Incomplete authored court fascia');
/** Admit exact existing decorative boxes only, not jury banks or held furniture. */
export function reshapeCourtFascia(name:string,positions:readonly number[],origin:readonly number[],rotation:readonly number[]):number[]|null{
 const part=fascia.find(p=>'courtroom-'+p.name===name);if(!part)return null;
 const same=(a:readonly number[],b:readonly number[])=>a.length===b.length&&a.every((v,i)=>Number.isFinite(v)&&Math.abs(v-b[i]!)<1e-6);
 if(!same(origin,[part.x,part.y,part.z])||!same(rotation,[0,0,0])||positions.length!==72||!positions.every(Number.isFinite))throw new RangeError('Known court fascia transform required');
 const half=[part.w/2,part.h/2,part.d/2];
 for(let i=0;i<positions.length;i++)if(Math.abs(Math.abs(positions[i]!)-half[i%3]!)>1e-6)throw new RangeError('Known court fascia source box required');
 const recipe=part.name.startsWith('scenery-stand-')?ARCHITECTURE_ART.defendant:ARCHITECTURE_ART.judge;
 return reshapeArchitecture(positions,part.y,0,recipe.anchorY,recipe.heightScale);
}
/** Sculpt the real existing foliage pixels into narrower, unequal crown lobes.
 * No substitute report/pixels: these bytes are the actual texture uploaded by the
 * production owner. The unmodified lower trunk/root rows keep the existing pivot. */
export function paintCompositionSurface(kind:ProductionSurface,base:PixelSurface):PixelSurface|null{
 if(kind!=='canopy-atlas')return null;
 if(base.width!==544||base.height!==160||!(base.rgba instanceof Uint8ClampedArray)||base.rgba.length!==544*160*4)throw new RangeError('Existing canopy atlas required');
 const rgba=new Uint8ClampedArray(base.rgba);
 const phase=[.2,1.5,2.9,4.1],lean=[-3,4,-4,2];
 for(let variant=0;variant<4;variant++){
  const offset=variant*136+4;
  for(let y=0;y<108;y++){
   // The lower fork returns continuously to its unchanged source row.
   const crown=Math.max(0,Math.min(1,(108-y)/24));
   const width=1-crown*(.12+.025*Math.sin(y*.085+phase[variant]!));
   const sway=crown*(lean[variant]!*(1-y/108)+Math.sin(y*.065+phase[variant]!)*2);
   for(let x=0;x<128;x++){
    const at=(y*544+offset+x)*4,sx=Math.round(63.5+(x-63.5-sway)/width);
    rgba.fill(0,at,at+4);
    if(sx<0||sx>=128)continue;
    const from=(y*544+offset+sx)*4;
    rgba.set(base.rgba.subarray(from,from+4),at);
   }
  }
  // Two small edge-connected notches per crown interrupt the continuous rim.
  // They sit away from the central fork, leaving the original shaded leaf masses.
  const notches=variant%2?[[22,63,10,5],[98,83,9,4]]:[[24,82,9,4],[99,59,10,5]];
  for(const [cx,cy,rx,ry]of notches)for(let y=cy!-ry!;y<=cy!+ry!;y++)for(let x=cx!-rx!;x<=cx!+rx!;x++){
   if(((x-cx!)/rx!)**2+((y-cy!)/ry!)**2<1){const at=(y*544+offset+x)*4;rgba.fill(0,at,at+4);}
  }
 }
 return {width:base.width,height:base.height,rgba};
}
