import {Mesh,Scene,VertexData} from '@babylonjs/core';
/** Rendering-only terrace contour. The original rectangular collision and anchors
 * remain in story-data; no mesh is used to decide where the party can walk. */
export const CANYON_RELIEF={id:'vq03l-terrace-contour',sides:8,triangles:28,approved:false} as const;
type Point=readonly [number,number,number];
type UV=readonly [number,number];
export function canyonTerraceData(width:number,height:number,depth:number,variant:number,cap=false):VertexData{
 if(![width,height,depth].every(v=>Number.isFinite(v)&&v>=.01&&v<=32)||!Number.isInteger(variant)||variant<0||variant>3)throw new RangeError('Invalid canyon terrace dimensions or variant');
 const halfX=width/2,halfZ=depth/2;
 // Keep a near-rectangular visible foot at the collision boundary. Only the
 // upper corners recede. Caps use the same cuts as their underlying cliff.
 const span=Math.min(width-(cap ? .1 : 0),depth-(cap ? .1 : 0));
 if(span<=0)throw new RangeError('Terrace cap is too narrow');
 const cut=[.10,.13,.09,.12].map((_,i)=>span*[.10,.13,.09,.12][(i+variant)%4]!);
 const ring=(y:number,cuts:readonly number[]):Point[]=>[
  [-halfX+cuts[0]!,y,-halfZ],[halfX-cuts[1]!,y,-halfZ],
  [halfX,y,-halfZ+cuts[1]!],[halfX,y,halfZ-cuts[2]!],
  [halfX-cuts[2]!,y,halfZ],[-halfX+cuts[3]!,y,halfZ],
  [-halfX,y,halfZ-cuts[3]!],[-halfX,y,-halfZ+cuts[0]!]
 ];
 const low=ring(-height/2,cap?cut:cut.map(v=>Math.min(.035,v))),high=ring(height/2,cut);
 const positions:number[]=[],indices:number[]=[],uvs:number[]=[],normals:number[]=[];
 const face=(points:Point[],tex:UV[],out:Point)=>{
  // Match Babylon's left-handed ComputeNormals winding, not a double-sided
  // workaround. Each planar face has private vertices for crisp rock normals.
  const a=points[0]!,b=points[1]!,c=points[2]!;
  const u=[a[0]-b[0],a[1]-b[1],a[2]-b[2]],v=[c[0]-b[0],c[1]-b[1],c[2]-b[2]];
  const dot=(u[1]!*v[2]!-u[2]!*v[1]!)*out[0]+(u[2]!*v[0]!-u[0]!*v[2]!)*out[1]+(u[0]!*v[1]!-u[1]!*v[0]!)*out[2];
  if(dot<0){points.reverse();tex.reverse();}
  const first=positions.length/3;for(let i=0;i<points.length;i++){positions.push(...points[i]!);uvs.push(...tex[i]!);}
  for(let i=1;i<points.length-1;i++)indices.push(first,first+i,first+i+1);
 };
 const planar=(p:Point):UV=>[p[0]/width+.5,p[2]/depth+.5];
 face([...low],low.map(planar),[0,-1,0]);face([...high],high.map(planar),[0,1,0]);
 for(let i=0;i<8;i++){
  const j=(i+1)%8,a=low[i]!,b=low[j]!,c=high[j]!,d=high[i]!;
  face([a,b,c,d],[[0,0],[1,0],[1,1],[0,1]],[(a[0]+b[0])/2,0,(a[2]+b[2])/2]);
 }
 VertexData.ComputeNormals(positions,indices,normals);
 const data=new VertexData();data.positions=positions;data.indices=indices;data.normals=normals;data.uvs=uvs;return data;
}
export function canyonTerrace(scene:Scene,name:string,width:number,height:number,depth:number,variant:number,cap=false):Mesh{
 // Validate before adding a mesh to the scene, so a bad request leaves no shell.
 const data=canyonTerraceData(width,height,depth,variant,cap),mesh=new Mesh(name,scene);
 data.applyToMesh(mesh,false);return mesh;
}
