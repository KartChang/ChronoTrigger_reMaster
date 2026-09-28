/** VQ04H authored architectural proportions, not changes to map/collision footprints.
 * The existing sign, actors, UVs, materials, animation clocks and camera are untouched. */
export const ARCHITECTURE_ART=Object.freeze({
 id:'vq04h-town-and-court-proportions',approved:false,
 town:Object.freeze({anchorY:.33,heightScale:.82,buildings:4,partsPerBuilding:25}),
 defendant:Object.freeze({anchorY:.08,heightScale:.50}),
 judge:Object.freeze({anchorY:.60,heightScale:.72}),
 maxBindings:110,maxRoots:2,maxAdditionalGeometryBytes:100320,
 addedTextures:0,addedMaterials:0,addedMeshes:0,
});
/** Bake an affine parent-space Y compression into a private copy of a box's local
 * vertices. Inverse rotation preserves every parent-space X/Z, including pitched
 * roof slabs and their courses. Scene positions, transforms and UVs are unchanged. */
export function reshapeArchitecture(positions:readonly number[],originY:number,rotationZ:number,anchorY:number,heightScale:number):number[]{
 if(positions.length!==72||!positions.every(Number.isFinite)||![originY,rotationZ,anchorY,heightScale].every(Number.isFinite)||heightScale<=0||heightScale>1)throw new RangeError('Expected finite 24-vertex architectural box and compression');
 const c=Math.cos(rotationZ),s=Math.sin(rotationZ),out=Array.from(positions);
 for(let i=0;i<out.length;i+=3){const x=positions[i]!,y=positions[i+1]!,px=c*x-s*y,py=s*x+c*y+originY,ny=anchorY+(py-anchorY)*heightScale-originY;out[i]=c*px+s*ny;out[i+1]=-s*px+c*ny;}
 return out;
}
