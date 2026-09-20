import {Vector3,VertexBuffer} from '@babylonjs/core';
import type {CameraSubject} from './early-camera-view';
/** Read-only samples inside the actual visible billboard, not logical actor positions.
 * Parallel camera rays cover head/chest widths; empty and nonfinite geometry is ignored.
 */
export function fairOcclusionPoints(subjects:readonly CameraSubject[]):Vector3[]{
 return subjects.flatMap(({mesh})=>{
  if(!mesh.isEnabled()||!mesh.isVisible||mesh.visibility<=0)return [];
  const p=mesh.getVerticesData(VertexBuffer.PositionKind);
  if(!p||p.length<9||!Array.from(p).every(Number.isFinite))return [];
  const xs:number[]=[],ys:number[]=[],zs:number[]=[];
  for(let i=0;i+2<p.length;i+=3){xs.push(p[i]!);ys.push(p[i+1]!);zs.push(p[i+2]!);}
  const left=Math.min(...xs),right=Math.max(...xs),bottom=Math.min(...ys),top=Math.max(...ys),z=(Math.min(...zs)+Math.max(...zs))/2;
  if(!(right>left&&top>bottom))return [];
  const world=mesh.computeWorldMatrix(true),points:Vector3[]=[];
  for(const x of [.22,.5,.78])for(const y of [.35,.65,.86]){
   const v=Vector3.TransformCoordinates(new Vector3(left+(right-left)*x,bottom+(top-bottom)*y,z),world);
   if([v.x,v.y,v.z].every(Number.isFinite))points.push(v);
  }
  return points;
 });
}
