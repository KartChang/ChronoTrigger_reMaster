import {Geometry,Mesh,Scene,StandardMaterial,TransformNode,VertexData} from '@babylonjs/core';
import {courtDaisUV} from './trial-detail';
import {SIGHTLINE_ART,sculptInnSign,sculptCourtDais} from './production-sightline-art';
type Part={mesh:Mesh;source:Geometry;owned:Geometry;material:Mesh['material'];name:string;position:number[];rotation:number[];scale:number[];billboard:number;bytes:number};
type Owner={root:TransformNode;name:string;parts:Part[];observer:ReturnType<TransformNode['onDisposeObservable']['addOnce']>};
const same=(a:ArrayLike<number>|null,b:ArrayLike<number>,epsilon=1e-6)=>!!a&&a.length===b.length&&Array.from(a).every((v,i)=>Number.isFinite(v)&&Math.abs(v-b[i]!)<=epsilon);
/** Only known, complete, privately owned source geometry is admitted. The rendered
 * geometry itself changes; original source buffers and diagnostic pixel APIs do not. */
export function installProductionSightlines(scene:Scene){
 if(scene.isDisposed)throw new Error('A live scene is required');
 const owners=new Map<TransformNode,Owner>(),blocked=new WeakSet<TransformNode>();let disposed=false,authored=0,rejections=0;
 const plain=(r:TransformNode)=>!r.parent&&!r.rotationQuaternion&&r.position.equalsToFloats(0,0,0)&&r.rotation.equalsToFloats(0,0,0)&&r.scaling.equalsToFloats(1,1,1);
 const safe=(m:Mesh)=>!m.isDisposed()&&!m.skeleton&&!m.rotationQuaternion&&m.instances.length===0&&m.geometry?.meshes.length===1&&m.getVerticesDataKinds().sort().join(',')==='normal,position,uv'&&m.material instanceof StandardMaterial;
 const geometryMatches=(m:Mesh,v:VertexData)=>same(m.getVerticesData('position'),v.positions!)&&same(m.getVerticesData('normal'),v.normals!)&&same(m.getVerticesData('uv'),v.uvs!)&&same(m.getIndices(),v.indices!,0);
 function collect(root:TransformNode){
  if(!plain(root))return null;
  const meshes=root.getChildMeshes(false).filter((m):m is Mesh=>m instanceof Mesh&&m.parent===root);
  if(root.name==='kingdom-truce'){
   const signs=meshes.filter(m=>m.name==='inn-sign');if(signs.length!==1)return null;const m=signs[0]!;
   if(!safe(m)||!same(m.position.asArray(),[-4.7,2.4,-3.4])||!same(m.rotation.asArray(),[0,0,0])||!same(m.scaling.asArray(),[2.75,2.75,1])||m.billboardMode!==Mesh.BILLBOARDMODE_ALL||m.material!.name!=='truce-inn-sign'||scene.meshes.some(other=>other!==m&&other.material===m.material)||!geometryMatches(m,VertexData.CreatePlane({width:1.4,height:.7})))return null;
   return [{mesh:m,positions:sculptInnSign(Array.from(m.getVerticesData('position')!))}];
  }
  if(root.name!=='trial-courtroom')return null;
  const dais=meshes.filter(m=>m.name==='court-curved-dais');if(dais.length!==3)return null;
  const parts=[];
  for(let i=0;i<3;i++){
   const matches=dais.filter(m=>same(m.position.asArray(),[0,.14+i*.23,4]));if(matches.length!==1)return null;const m=matches[0]!;
   if(!safe(m)||!same(m.rotation.asArray(),[0,0,0])||!same(m.scaling.asArray(),[1,1,1])||m.billboardMode!==0||m.material!.name!=='production-court-dais:false:false'||!geometryMatches(m,VertexData.CreateCylinder({diameter:10-i*.8,height:.24,tessellation:28,faceUV:courtDaisUV()})))return null;
   parts.push({mesh:m,positions:sculptCourtDais(Array.from(m.getVerticesData('position')!))});
  }
  return parts;
 }
 function release(root:TransformNode,reject=false){
  const o=owners.get(root);if(!o)return;owners.delete(root);root.onDisposeObservable.remove(o.observer);if(reject){blocked.add(root);rejections++;}
  for(const p of o.parts){if(!p.mesh.isDisposed()&&p.mesh.geometry===p.owned&&!p.source.isDisposed())p.source.applyToMesh(p.mesh);if(!p.owned.isDisposed()&&p.owned.meshes.length===0)p.owned.dispose();if(p.mesh.isDisposed()&&!p.source.isDisposed()&&p.source.meshes.length===0)p.source.dispose();}
 }
 function install(root:TransformNode){
  const selected=collect(root);if(!selected||owners.size>=SIGHTLINE_ART.maxRoots)return;
  const parts=selected.map(({mesh,positions})=>{const source=mesh.geometry!,normals:number[]=[];VertexData.ComputeNormals(positions,source.getIndices()!,normals);const bytes=(positions.length+normals.length+source.getVerticesData('uv')!.length+source.getIndices()!.length)*4;return {mesh,source,positions,normals,bytes};});
  const existing=[...owners.values()].flatMap(o=>o.parts);if(existing.length+parts.length>SIGHTLINE_ART.maxBindings||[...existing,...parts].reduce((n,p)=>n+p.bytes,0)>SIGHTLINE_ART.maxGeometryBytes)return;
  const o:Owner={root,name:root.name,parts:[],observer:null};owners.set(root,o);
  try{for(const {mesh,source,positions,normals,bytes}of parts){const owned=source.copy('sightline-art-'+mesh.uniqueId);o.parts.push({mesh,source,owned,name:mesh.name,material:mesh.material,position:mesh.position.asArray(),rotation:mesh.rotation.asArray(),scale:mesh.scaling.asArray(),billboard:mesh.billboardMode,bytes});owned.setVerticesData('position',positions,false);owned.setVerticesData('normal',normals,false);owned.applyToMesh(mesh);mesh.computeWorldMatrix(true);authored++;}o.observer=root.onDisposeObservable.addOnce(()=>release(root));}catch(error){release(root);throw error;}
 }
 const before=scene.onBeforeRenderObservable.add(()=>{
  if(disposed)return;
  for(const [root,o]of owners)if(root.isDisposed()||root.name!==o.name||!plain(root)||scene.transformNodes.filter(r=>r.name===o.name&&!r.isDisposed()).length!==1||o.parts.some(p=>p.mesh.isDisposed()||p.mesh.parent!==root||p.mesh.name!==p.name||p.mesh.geometry!==p.owned||p.owned.meshes.length!==1||p.mesh.material!==p.material||p.mesh.billboardMode!==p.billboard||!same(p.mesh.position.asArray(),p.position)||!same(p.mesh.rotation.asArray(),p.rotation)||!same(p.mesh.scaling.asArray(),p.scale)))release(root,true);
  for(const name of ['kingdom-truce','trial-courtroom']){const matches=scene.transformNodes.filter(r=>r.name===name&&!r.isDisposed()&&r.isEnabled());if(matches.length!==1)continue;const root=matches[0]!;if(!owners.has(root)&&!blocked.has(root))install(root);}
 });
 function dispose(){if(disposed)return;disposed=true;scene.onBeforeRenderObservable.remove(before);scene.onDisposeObservable.remove(onDispose);for(const root of [...owners.keys()])release(root);}
 const onDispose=scene.onDisposeObservable.addOnce(dispose);
 return {dispose,inspect(){const parts=[...owners.values()].flatMap(o=>o.parts);return {profile:SIGHTLINE_ART.id,approved:false,disposed,authored,rejections,roots:owners.size,bindings:parts.length,geometryBytes:parts.reduce((n,p)=>n+p.bytes,0),additionalMeshes:0,additionalTextures:0,additionalMaterials:0,actorTextureWrites:0,gameplayWrites:0,signScale:SIGHTLINE_ART.signScale,daisDepthScale:SIGHTLINE_ART.daisDepthScale};}};
}
