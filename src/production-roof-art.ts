/** VQ04M roof construction dressing. The original roof textures remain the real
 * renderer/diagnostic source. Only their mesh UV orientation and roof joinery change.
 * This pure author is invoked once by the existing scene-owned geometry pass. */
export const ROOF_ART=Object.freeze({
 id:'vq04m-eave-aligned-roof-joinery',approved:false,
 slabCount:8,courseCount:32,ridgeCount:4,buildings:4,
 courseCrossSection:.42,ridgeTopWidth:.60,
 addedMeshes:0,addedMaterials:0,addedTextures:0,addedGeometryBuffers:0,
});
export type RoofDressing={positions:number[];uvs:number[]};
/** Return null for every non-roof mesh. Inputs are copied, never edited.
 * Unit UV rotation puts the existing tile rows across the slope instead of along
 * the ridge. Repeat remains exactly one tile sheet: no sampler/resource changes. */
export function dressProductionRoof(name:string,positions:readonly number[],uvs:readonly number[]):RoofDressing|null{
 if(!['truce-pitched-roof','truce-roof-course','truce-ridge'].includes(name))return null;
 if(positions.length!==72||uvs.length!==48||!positions.every(Number.isFinite)||!uvs.every(v=>Number.isFinite(v)&&v>=0&&v<=1))throw new RangeError('Known finite roof box with unit UVs required');
 const p=Array.from(positions),u=Array.from(uvs),xs=p.filter((_,i)=>i%3===0),ys=p.filter((_,i)=>i%3===1);
 const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;
 if(!(Math.max(...xs)>Math.min(...xs))||!(Math.max(...ys)>Math.min(...ys)))throw new RangeError('Degenerate roof cross section');
 if(name==='truce-pitched-roof'){
  for(let i=0;i<u.length;i+=2){u[i]=uvs[i+1]!;u[i+1]=1-uvs[i]!;}
 }else if(name==='truce-roof-course'){
  // Keep the rail centre and longitudinal length. A narrower cross section avoids
  // the standing-seam/metal-sheet appearance without hiding or disabling a mesh.
  for(let i=0;i<p.length;i+=3){p[i]=cx+(p[i]!-cx)*ROOF_ART.courseCrossSection;p[i+1]=cy+(p[i+1]!-cy)*ROOF_ART.courseCrossSection;}
 }else{
  // A tapered timber cap instead of a square ridge; the base stays seated.
  for(let i=0;i<p.length;i+=3)if(p[i+1]!>cy)p[i]=cx+(p[i]!-cx)*ROOF_ART.ridgeTopWidth;
 }
 return {positions:p,uvs:u};
}
