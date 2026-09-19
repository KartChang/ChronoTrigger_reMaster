import {Vector3,VertexBuffer,Matrix,Viewport} from '@babylonjs/core';
import type {AbstractMesh,Camera} from '@babylonjs/core';
import {SCREEN_UP} from './early-comfort';
import type {ComfortActor} from './early-comfort';

export type CameraSubject=Readonly<{id:string;mesh:AbstractMesh}>;
function vertices(mesh:AbstractMesh):Vector3[]{
 if(!mesh.isEnabled()||!mesh.isVisible||mesh.visibility<=0)return [];
 const data=mesh.getVerticesData(VertexBuffer.PositionKind);
 if(!data||data.length<9)return [];
 const matrix=mesh.computeWorldMatrix(true),points:Vector3[]=[];
 for(let i=0;i+2<data.length;i+=3){
  const p=Vector3.TransformCoordinates(new Vector3(data[i],data[i+1],data[i+2]),matrix);
  if(![p.x,p.y,p.z].every(Number.isFinite))return [];
  points.push(p);
 }
 return points;
}
/** Feed the existing framing policy the actual visible plane, not logical actor coordinates.
 * The effective bottom at the chosen z reconstructs the mesh's screen-up extent.
 * No position, material, game state, visibility or saved data is edited here.
 */
export function observeCameraSubjects(subjects:readonly CameraSubject[]):ComfortActor[]{
 return subjects.flatMap(({id,mesh})=>{
  const points=vertices(mesh);if(!points.length)return [];
  const left=Math.min(...points.map(p=>p.x)),right=Math.max(...points.map(p=>p.x));
  const bottom=Math.min(...points.map(p=>p.y*SCREEN_UP.y+p.z*SCREEN_UP.z));
  const top=Math.max(...points.map(p=>p.y*SCREEN_UP.y+p.z*SCREEN_UP.z));
  const z=mesh.getAbsolutePosition().z;
  if(right-left<=0||top-bottom<=0)return [];
  return [{id,x:(left+right)/2,z,halfWidth:(right-left)/2,height:top-bottom,groundY:(bottom-z*SCREEN_UP.z)/SCREEN_UP.y}];
 });
}
/** Read-only GPU-scene vertex projection for the same subjects used by the camera.
 * This is geometry evidence only; it cannot establish visual quality or device performance.
 */
export function projectCameraSubjects(subjects:readonly CameraSubject[],camera:Camera){
 const matrix=camera.getViewMatrix(true).multiply(camera.getProjectionMatrix(true));
 return subjects.flatMap(({id,mesh})=>{
  const points=vertices(mesh).map(p=>Vector3.Project(p,Matrix.Identity(),matrix,new Viewport(0,0,1,1)));
  if(!points.length)return [];
  return [{id,left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))}];
 });
}
