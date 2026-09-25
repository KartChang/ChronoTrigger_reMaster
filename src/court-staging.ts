import {Mesh,TransformNode,Vector3,VertexBuffer} from '@babylonjs/core';
import {billboardCenter} from './early-comfort';
import {WITNESS_SIZE} from './witness-art';
type Binding={mesh:Mesh;foot:Readonly<{x:number;y:number;z:number}>;height:number};
/** Existing courtroom supports only. This changes rendered pivots, not quest coordinates. */
export function bindCourtStaging(root:TransformNode){
 if(root.name!=='trial-courtroom'||root.isDisposed())throw new Error('Court staging requires its live court root');
 const scene=root.getScene();let bindings:Binding[]=[];
 for(const mesh of root.getChildMeshes()){
  const juror=/^courtroomjuror-[0-6]$/.test(mesh.name),counsel=/^courtroom(defender|prosecutor|judge)$/.test(mesh.name),witness=/^courtroomtestimony-(girl|elder|merchant|shopper)$/.test(mesh.name);
  if(!juror&&!counsel&&!witness)continue;
  const positions=mesh.getVerticesData(VertexBuffer.PositionKind);if(!positions)throw new Error('Missing court sprite geometry');
  const ys=[];for(let i=1;i<positions.length;i+=3)ys.push(positions[i]!);
  const height=Math.max(...ys)-Math.min(...ys);if(!(height>0))throw new Error('Invalid court sprite height');
  // The seven adult jurors share the 1.7-high adult scale; their cells and poses do not change.
  if(juror){mesh.scaling.x=1.2;mesh.scaling.y=1.7/height;}
  const support=juror?.55:witness?.49:.72;
  bindings.push({mesh:mesh as Mesh,height,foot:Object.freeze({x:mesh.position.x,y:support+.04,z:mesh.position.z})});
  mesh.onDisposeObservable.addOnce(()=>{bindings=bindings.filter(b=>b.mesh!==mesh);});
 }
 if(bindings.length!==14)throw new Error('Incomplete court actor staging');
 root.onDisposeObservable.addOnce(()=>{bindings=[];});
 const visible=(b:Binding)=>!b.mesh.isDisposed()&&b.mesh.isEnabled()&&b.mesh.isVisible&&b.mesh.visibility>0;
 return {
  draw(){
   const camera=scene.activeCamera;if(!camera||root.isDisposed()||!root.isEnabled())return;
   const up=camera.getDirection(Vector3.Up());
   for(const b of bindings){if(!visible(b))continue;
    const p=billboardCenter(b.foot,up,b.height*Math.abs(b.mesh.scaling.y),WITNESS_SIZE.pivot.y,WITNESS_SIZE.h);
    b.mesh.setAbsolutePosition(new Vector3(p.x,p.y,p.z));
   }
  },
  inspect(){return {profile:'vq03i-court-support-pivots',bindingCount:bindings.length,approved:false,actors:bindings.filter(visible).map(b=>{
   const pivot=new Vector3(0,b.height*(.5-WITNESS_SIZE.pivot.y/WITNESS_SIZE.h),0);
   const p=Vector3.TransformCoordinates(pivot,b.mesh.computeWorldMatrix(true));
   return {name:b.mesh.name,foot:{...b.foot},actualFoot:{x:p.x,y:p.y,z:p.z},footError:Math.hypot(p.x-b.foot.x,p.y-b.foot.y,p.z-b.foot.z),height:b.height*Math.abs(b.mesh.scaling.y)};
  })};}
 };
}
