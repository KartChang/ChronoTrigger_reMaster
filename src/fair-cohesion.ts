import {Mesh,StandardMaterial,Vector3,VertexBuffer,VertexData} from '@babylonjs/core';
import type {Scene,ShadowGenerator,TransformNode} from '@babylonjs/core';
import {HD_ART} from './hd-hero-art';

/** Fair-only form calibration, not a new art asset or a quality score. */
export const FAIR_COHESION_PROFILE='vq01y-fair-shadow-and-form';
export const FAIR_HUMAN_WIDTH=1.36,FAIR_HUMAN_HEIGHT=1.85;
export const FAIR_FORM_TEXEL=FAIR_HUMAN_HEIGHT/HD_ART.height;
const SHADOW_FLOOR=.34;

export function fairStoneBevel(width:number,height:number,depth:number):number{
 if(![width,height,depth].every(n=>Number.isFinite(n)&&n>0))throw new Error('Invalid fair stone dimensions');
 return Math.min(FAIR_FORM_TEXEL*1.5,Math.min(width,height,depth)*.12);
}
/** Closed, flat-faced chamfer: original bounds, one actor-scale edge, no texture/blur.
 * 6 faces + 12 edge strips + 8 corners. Build once, then use the retained batcher.
 */
export function fairStoneGeometry(width:number,height:number,depth:number):VertexData{
 const bevel=fairStoneBevel(width,height,depth),half=[width/2,height/2,depth/2];
 const inner=half.map(n=>n-bevel),positions:number[]=[],indices:number[]=[],normals:number[]=[],colors:number[]=[];
 const face=(points:number[][],out:number[],edge=false)=>{
  const normal=Vector3.FromArray(out).normalize();
  const a=Vector3.FromArray(points[0]!),b=Vector3.FromArray(points[1]!),c=Vector3.FromArray(points[2]!);
  // Babylon's left-handed front faces use clockwise winding from outside.
  if(Vector3.Dot(Vector3.Cross(b.subtract(a),c.subtract(a)),normal)>0)points.reverse();
  const first=positions.length/3;
  for(const point of points){positions.push(...point);normals.push(normal.x,normal.y,normal.z);colors.push(...(edge?[.94,.95,.93,1]:[1,1,1,1]));}
  for(let i=1;i<points.length-1;i++)indices.push(first,first+i,first+i+1);
 };
 for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){
  const u=(axis+1)%3,v=(axis+2)%3,out=[0,0,0];out[axis]=sign;
  face([[-1,-1],[1,-1],[1,1],[-1,1]].map(([su,sv])=>{
   const p=[0,0,0];p[axis]=sign*half[axis]!;p[u]=su!*inner[u]!;p[v]=sv!*inner[v]!;return p;
  }),out);
 }
 for(let a=0;a<3;a++)for(let b=a+1;b<3;b++)for(const sa of [-1,1])for(const sb of [-1,1]){
  const c=3-a-b,out=[0,0,0];out[a]=sa;out[b]=sb;
  face([[0,-1],[1,-1],[1,1],[0,1]].map(([side,sc])=>{
   const p=[0,0,0];p[a]=sa*(side?inner[a]!:half[a]!);p[b]=sb*(side?half[b]!:inner[b]!);p[c]=sc!*inner[c]!;return p;
  }),out,true);
 }
 for(const sx of [-1,1])for(const sy of [-1,1])for(const sz of [-1,1]){
  const sign=[sx,sy,sz];face([0,1,2].map(axis=>sign.map((s,i)=>s*(i===axis?half[i]!:inner[i]!))),sign,true);
 }
 const data=new VertexData();Object.assign(data,{positions,indices,normals,colors});return data;
}

/** Use the original generator. Restore its value on map exit even when fair.draw
 * is not called outside the fair. No global key/fill/filter/bias changes.
 */
export function fairShadowScope(scene:Scene,root:TransformNode,shadow:ShadowGenerator){
 let previous:number|null=null,disposed=false;
 const sync=()=>{
  if(disposed)return;
  if(root.isEnabled()){
   if(previous===null)previous=shadow.getDarkness();
   shadow.setDarkness(Math.max(previous,SHADOW_FLOOR));
  }else if(previous!==null){shadow.setDarkness(previous);previous=null;}
 };
 const observer=scene.onBeforeRenderObservable.add(sync);
 return {sync,dispose(){
  if(disposed)return;disposed=true;scene.onBeforeRenderObservable.remove(observer);
  if(previous!==null){shadow.setDarkness(previous);previous=null;}
 },inspect(){
  const list=shadow.getShadowMap()?.renderList??[];
  const batches=root.getChildMeshes().filter((m):m is Mesh=>m instanceof Mesh&&Array.isArray(m.metadata?.fairParts));
  const actors=root.getChildMeshes().filter(m=>m.metadata?.fairHuman===true);
  return {profile:FAIR_COHESION_PROFILE,source:'actual-fair-shadow-and-form',approved:false,
   shadow:{active:previous!==null,enabled:root.isEnabled(),darkness:shadow.getDarkness(),previous,
    mapSize:shadow.getShadowMap()?.getSize().width??null,filter:shadow.filter,bias:shadow.bias,normalBias:shadow.normalBias},
   forms:batches.map(m=>({name:m.name,casts:list.includes(m),receives:m.receiveShadows,
    parts:m.metadata.fairParts.map((p:{name:string;casts:boolean;bevel:number|null})=>({...p})),
    vertices:m.getTotalVertices(),triangles:m.getTotalIndices()/3,
    normals:m.getVerticesData(VertexBuffer.NormalKind)?.length??0,
    colors:m.getVerticesData(VertexBuffer.ColorKind)?.length??0,
    dynamic:m.getVertexBuffer(VertexBuffer.PositionKind)?.isUpdatable()??null,
    collision:m.checkCollisions,pickable:m.isPickable})),
   actors:actors.map(m=>{
    if(!(m instanceof Mesh)||!(m.material instanceof StandardMaterial))throw new Error('Invalid fair actor material');
    const p=m.getVerticesData(VertexBuffer.PositionKind)??[],xs:number[]=[],ys:number[]=[];
    for(let i=0;i<p.length;i+=3){xs.push(p[i]!);ys.push(p[i+1]!);}
    const size=m.material.diffuseTexture?.getSize();
    return {name:m.name,width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys),
     texture:size?{width:size.width,height:size.height}:null,sampling:m.material.diffuseTexture?.samplingMode??null,
     billboard:m.billboardMode,unlit:m.material.disableLighting};
   }),physicalDevice:false,artApproved:false};
 }};
}
