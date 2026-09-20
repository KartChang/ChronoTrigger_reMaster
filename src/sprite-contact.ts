import {Vector3,VertexBuffer} from '@babylonjs/core';
import type {Mesh} from '@babylonjs/core';
import {billboardCenter} from './early-comfort';

export type ContactPoint=Readonly<{x:number;y:number;z:number}>;
export type SpriteContact=Readonly<{id:string;mesh:Mesh;shadow:Mesh;foot:ContactPoint;pivotY:number;cellHeight:number}>;
/** Apply the retained texture-foot anchor to a camera-facing sprite at its actual
 * scale, then align its own contact shadow. The caller supplies presentation
 * coordinates (including a lunge), never a writable game-state reference.
 * Current party and witness roots have unit scale and no rotation.
 */
export function placeSpriteContact(mesh:Mesh,shadow:Mesh,foot:ContactPoint,up:ContactPoint,height:number,pivotY=62,cellHeight=64,shadowWidth=1,shadowDepth=.52):void{
 const scale=Math.abs(mesh.scaling.y);
 const center=billboardCenter(foot,up,height*scale,pivotY,cellHeight);
 mesh.setAbsolutePosition(new Vector3(center.x,center.y,center.z));
 shadow.setAbsolutePosition(new Vector3(foot.x,foot.y,foot.z));
 shadow.scaling.x=shadowWidth*Math.abs(mesh.scaling.x);shadow.scaling.y=shadowDepth*Math.abs(mesh.scaling.x);
}
/** Inspect the authored texture pivot through the actual mesh matrix, not a
 * second copy of placement arithmetic. Plain copied values only. No GPU readback
 * or art/device approval is implied by this geometric observation.
 */
export function inspectSpriteContacts(contacts:readonly SpriteContact[]){
 return contacts.filter(c=>c.mesh.isEnabled()&&c.mesh.isVisible&&c.mesh.visibility>0).map(c=>{
  const data=c.mesh.getVerticesData(VertexBuffer.PositionKind);
  if(!data?.length)throw new Error('Missing sprite contact geometry');
  const xs:number[]=[],ys:number[]=[];for(let i=0;i+2<data.length;i+=3){xs.push(data[i]!);ys.push(data[i+1]!);}
  const left=Math.min(...xs),right=Math.max(...xs),top=Math.max(...ys),bottom=Math.min(...ys);
  const local=new Vector3((left+right)/2,top+(bottom-top)*c.pivotY/c.cellHeight,0);
  const actual=Vector3.TransformCoordinates(local,c.mesh.computeWorldMatrix(true));
  c.shadow.computeWorldMatrix(true);const shade=c.shadow.getAbsolutePosition();
  return {id:c.id,mesh:c.mesh.name,foot:{...c.foot},actualFoot:{x:actual.x,y:actual.y,z:actual.z},
   footError:Math.hypot(actual.x-c.foot.x,actual.y-c.foot.y,actual.z-c.foot.z),
   shadow:{name:c.shadow.name,visible:c.shadow.isEnabled()&&c.shadow.isVisible,x:shade.x,y:shade.y,z:shade.z},
   scale:{x:c.mesh.scaling.x,y:c.mesh.scaling.y,z:c.mesh.scaling.z}};
 });
}
