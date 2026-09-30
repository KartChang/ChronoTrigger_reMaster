import {DynamicTexture,Geometry,Mesh,Scene,StandardMaterial,Texture,TransformNode,VertexData} from '@babylonjs/core';
import {TREE_ROW_ART,TREE_ROWS,reshapeTreeRow} from './production-tree-row-art';
type Part={mesh:Mesh;source:Geometry;owned:Geometry;material:StandardMaterial;texture:DynamicTexture;position:number[]};
type Owner={root:TransformNode;name:string;parts:Part[];observer:ReturnType<TransformNode['onDisposeObservable']['addOnce']>};
const same=(a:readonly number[],b:readonly number[])=>a.length===b.length&&a.every((v,i)=>Math.abs(v-b[i]!)<1e-7);
/** Private geometry only, installed on the existing two unheld roots. Restore
 * safely on drift; an external replacement remains its owner's responsibility. */
export function installProductionTreeRows(scene:Scene){
 if(scene.isDisposed)throw new Error('A live scene is required');
 const owners=new Map<TransformNode,Owner>(),blocked=new WeakSet<TransformNode>();let disposed=false,authored=0,rejections=0;
 const plain=(r:TransformNode)=>!r.parent&&!r.rotationQuaternion&&r.position.equalsToFloats(0,0,0)&&r.rotation.equalsToFloats(0,0,0)&&r.scaling.equalsToFloats(1,1,1);
 function release(root:TransformNode,reject=false){const o=owners.get(root);if(!o)return;owners.delete(root);root.onDisposeObservable.remove(o.observer);if(reject){blocked.add(root);rejections++;}
  for(const p of o.parts){if(!p.mesh.isDisposed()&&p.mesh.geometry===p.owned&&!p.source.isDisposed())p.source.applyToMesh(p.mesh);if(!p.owned.isDisposed()&&p.owned.meshes.length===0)p.owned.dispose();if(p.mesh.isDisposed()&&!p.source.isDisposed()&&p.source.meshes.length===0)p.source.dispose();}
 }
 function install(root:TransformNode){
  const rows=TREE_ROWS[root.name];if(!rows||!plain(root)||owners.size>=TREE_ROW_ART.maxRoots)return;
  const trees=root.getChildMeshes(false).filter((m):m is Mesh=>m instanceof Mesh&&m.name==='oak');if(trees.length!==rows.length)return;
  const prepared:{mesh:Mesh;source:Geometry;material:StandardMaterial;texture:DynamicTexture;positions:number[];normals:number[]}[]=[];
  for(const row of rows){const matches=trees.filter(m=>m.parent===root&&same(m.position.asArray(),[row.x,row.width*1.25/2+.1,row.z]));if(matches.length!==1)return;
   const mesh=matches[0]!,material=mesh.material,texture=material instanceof StandardMaterial?material.diffuseTexture:null;
   if(mesh.isDisposed()||mesh.rotationQuaternion||!mesh.rotation.equalsToFloats(0,0,0)||!mesh.scaling.equalsToFloats(1,1,1)||mesh.billboardMode!==Mesh.BILLBOARDMODE_ALL||mesh.skeleton||mesh.instances.length||mesh.geometry?.meshes.length!==1||mesh.getTotalVertices()!==4||mesh.getTotalIndices()!==6||!(material instanceof StandardMaterial)||!(texture instanceof DynamicTexture)||texture!==material.emissiveTexture||!texture.hasAlpha||texture.samplingMode!==Texture.NEAREST_SAMPLINGMODE||texture.getSize().width!==64||texture.getSize().height!==80)return;
   const expected=VertexData.CreatePlane({width:row.width,height:row.width*1.25}),source=mesh.geometry!,equal=(a:ArrayLike<number>|null,b:ArrayLike<number>)=>!!a&&a.length===b.length&&Array.from(a).every((v,i)=>Math.abs(v-b[i]!)<1e-6);
   if(!equal(source.getVerticesData('position'),expected.positions!)||!equal(source.getVerticesData('normal'),expected.normals!)||!equal(source.getVerticesData('uv'),expected.uvs!)||!equal(source.getIndices(),expected.indices!))return;
   const positions=reshapeTreeRow(root.name,row.x,row.z,Array.from(source.getVerticesData('position')!))!,normals:number[]=[];VertexData.ComputeNormals(positions,source.getIndices()!,normals);prepared.push({mesh,source,material,texture,positions,normals});
  }
  const o:Owner={root,name:root.name,parts:[],observer:null};owners.set(root,o);
  try{for(const p of prepared){const owned=p.source.copy('tree-row-art-'+p.mesh.uniqueId);o.parts.push({...p,owned,position:p.mesh.position.asArray()});owned.setVerticesData('position',p.positions,false);owned.setVerticesData('normal',p.normals,false);owned.applyToMesh(p.mesh);p.mesh.computeWorldMatrix(true);authored++;}o.observer=root.onDisposeObservable.addOnce(()=>release(root));}catch(error){release(root);throw error;}
 }
 const observer=scene.onBeforeRenderObservable.add(()=>{
  if(disposed)return;
  for(const [root,o]of owners)if(root.isDisposed()||root.name!==o.name||!plain(root)||scene.transformNodes.filter(r=>r.name===o.name&&!r.isDisposed()).length!==1||o.parts.some(p=>p.mesh.isDisposed()||p.mesh.parent!==root||p.mesh.name!=='oak'||p.mesh.geometry!==p.owned||p.owned.meshes.length!==1||p.mesh.material!==p.material||p.material.diffuseTexture!==p.texture||p.material.emissiveTexture!==p.texture||p.mesh.billboardMode!==Mesh.BILLBOARDMODE_ALL||p.mesh.rotationQuaternion||!same(p.mesh.position.asArray(),p.position)||!p.mesh.rotation.equalsToFloats(0,0,0)||!p.mesh.scaling.equalsToFloats(1,1,1)))release(root,true);
  for(const name of Object.keys(TREE_ROWS)){const matches=scene.transformNodes.filter(r=>r.name===name&&!r.isDisposed()&&r.isEnabled());if(matches.length!==1)continue;const root=matches[0]!;if(!owners.has(root)&&!blocked.has(root))install(root);}
 });
 function dispose(){if(disposed)return;disposed=true;scene.onBeforeRenderObservable.remove(observer);scene.onDisposeObservable.remove(onDispose);for(const root of [...owners.keys()])release(root);}
 const onDispose=scene.onDisposeObservable.addOnce(dispose);
 return {dispose,inspect(){const bindings=[...owners.values()].reduce((n,o)=>n+o.parts.length,0);return {profile:TREE_ROW_ART.id,approved:false,disposed,authored,rejections,roots:owners.size,bindings,geometryPayloadBytes:bindings*152,additionalMeshes:0,additionalMaterials:0,additionalTextures:0,actorTextureWrites:0,gameplayWrites:0};}};
}
