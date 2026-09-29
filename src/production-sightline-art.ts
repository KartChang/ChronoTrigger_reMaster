/** VQ04J static authored sightline geometry. No camera, actor, texture or game-state substitution. */
export const SIGHTLINE_ART=Object.freeze({
 id:'vq04j-inn-sign-and-court-dais',approved:false,
 signScale:.66,signInsetX:-.32,signDropY:-.10,daisDepthScale:.70,maxRoots:2,maxBindings:4,maxGeometryBytes:16384,
 addedMeshes:0,addedTextures:0,addedMaterials:0,
});
/** Keep J's smaller 2:1 face, inset beneath the inn eave beside the door.
 * Local vertex translation preserves the original world transform and UVs. */
export function sculptInnSign(positions:readonly number[]):number[]{
 if(positions.length!==12||!positions.every(Number.isFinite))throw new RangeError('Expected a finite four-vertex sign');
 return positions.map((v,i)=>i%3===2?v:v*SIGHTLINE_ART.signScale+(i%3===0?SIGHTLINE_ART.signInsetX:SIGHTLINE_ART.signDropY));
}
/** An elliptical court dais keeps its original width and rise but no longer extends
 * into the defendant's sightline. Only local Z is authored; UVs and triangle winding survive. */
export function sculptCourtDais(positions:readonly number[]):number[]{
 if(positions.length<12||positions.length%3!==0||!positions.every(Number.isFinite))throw new RangeError('Expected finite dais positions');
 return positions.map((v,i)=>i%3===2?v*SIGHTLINE_ART.daisDepthScale:v);
}
