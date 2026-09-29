/** VQ04J static authored sightline geometry. No camera, actor, texture or game-state substitution. */
export const SIGHTLINE_ART=Object.freeze({
 id:'vq04j-inn-sign-and-court-dais',approved:false,
 signScale:.66,daisDepthScale:.70,maxRoots:2,maxBindings:4,maxGeometryBytes:16384,
 addedMeshes:0,addedTextures:0,addedMaterials:0,
});
/** Preserve the centered sign's 2:1 proportions and its existing world anchor. */
export function sculptInnSign(positions:readonly number[]):number[]{
 if(positions.length!==12||!positions.every(Number.isFinite))throw new RangeError('Expected a finite four-vertex sign');
 return positions.map((v,i)=>i%3===2?v:v*SIGHTLINE_ART.signScale);
}
/** An elliptical court dais keeps its original width and rise but no longer extends
 * into the defendant's sightline. Only local Z is authored; UVs and triangle winding survive. */
export function sculptCourtDais(positions:readonly number[]):number[]{
 if(positions.length<12||positions.length%3!==0||!positions.every(Number.isFinite))throw new RangeError('Expected finite dais positions');
 return positions.map((v,i)=>i%3===2?v*SIGHTLINE_ART.daisDepthScale:v);
}
