import {boxTextureUV} from './material-runtime';
import {ARCHITECTURE_SOURCE_LAYOUT} from './architecture-source-layout';
import {Geometry,Mesh,Scene,StandardMaterial,TransformNode,VertexBuffer,VertexData} from '@babylonjs/core';
import {ARCHITECTURE_ART,reshapeArchitecture} from './production-architecture-art';
type Part={mesh:Mesh;source:Geometry;owned:Geometry;name:string;material:Mesh['material'];position:number[];rotation:number[];scale:number[];bytes:number};
type Owner={root:TransformNode;name:string;parts:Part[];observer:ReturnType<TransformNode['onDisposeObservable']['addOnce']>};
const townCounts:Readonly<Record<string,number>>={plaster:4,timber:12,crossbeam:4,lintel:4,'pitched-roof':8,'roof-course':32,ridge:4,door:4,window:8,glass:8,mullion:8,chimney:4};
const same=(a:readonly number[],b:readonly number[])=>a.length===b.length&&a.every((v,i)=>Math.abs(v-b[i]!)<1e-8);
/** Scene-owned model pass. Only complete known Truce/court structures are accepted.
 * Clone geometry before authoring; never mutate original buffers, actors or textures.
 * Native observations continue to read the real meshes; no diagnostic substitution. */
export function installProductionArchitecture(scene:Scene){
 if(scene.isDisposed)throw new Error('A live scene is required');
 const owners=new Map<TransformNode,Owner>(),rejected=new WeakSet<TransformNode>();let disposed=false,authored=0,rejections=0;
 const plainRoot=(r:TransformNode)=>!r.parent&&!r.rotationQuaternion&&r.position.equalsToFloats(0,0,0)&&r.rotation.equalsToFloats(0,0,0)&&r.scaling.equalsToFloats(1,1,1);
 const box=(m:Mesh)=>!m.isDisposed()&&!m.rotationQuaternion&&!m.skeleton&&m.instances.length===0&&m.geometry?.meshes.length===1&&m.getTotalVertices()===24&&m.getTotalIndices()===36&&m.scaling.equalsToFloats(1,1,1)&&m.rotation.x===0&&m.rotation.y===0&&[0,.48,-.48].includes(m.rotation.z)&&m.getVerticesDataKinds().sort().join(',')==='normal,position,uv'&&m.material instanceof StandardMaterial&&m.position.asArray().every(Number.isFinite)&&Array.from(m.getVerticesData(VertexBuffer.PositionKind)??[]).every(Number.isFinite);
 function exactLayout(root:TransformNode,meshes:Mesh[]){
  const rows=ARCHITECTURE_SOURCE_LAYOUT[root.name];if(!rows||meshes.length!==rows.length)return false;
  const used=new Set<Mesh>();
  for(const [name,x,y,z,w,h,d,rotationZ,material]of rows){
   const found=meshes.filter(m=>m.name===name&&same(m.position.asArray(),[x,y,z])&&Math.abs(m.rotation.z-rotationZ)<1e-8&&m.material?.name===material);
   if(found.length!==1||used.has(found[0]!))return false;const mesh=found[0]!;used.add(mesh);
   // The two original court boxes use physical-scale UVs; F trim and town boxes use unit UVs.
   const unit=VertexData.CreateBox({width:w,height:h,depth:d,faceUV:name.startsWith('courtroom-')?boxTextureUV(w,h,d):undefined}),expected=unit.positions!;
   const equal=(a:ArrayLike<number>|null,b:ArrayLike<number>)=>!!a&&a.length===b.length&&Array.from(a).every((v,i)=>Math.abs(v-b[i]!)<1e-5);
   if(!equal(mesh.getVerticesData(VertexBuffer.PositionKind),expected)||!equal(mesh.getVerticesData(VertexBuffer.NormalKind),unit.normals!)||!equal(mesh.getVerticesData(VertexBuffer.UVKind),unit.uvs!)||!equal(mesh.getIndices(),unit.indices!))return false;
  }
  return true;
 }
 function collect(root:TransformNode){
  if(!plainRoot(root))return null;
  const meshes=root.getChildMeshes(false).filter((m):m is Mesh=>m instanceof Mesh&&m.parent===root),selected:{mesh:Mesh;anchorY:number;heightScale:number}[]=[];
  if(root.name==='kingdom-truce'){
   const anchors=meshes.filter(m=>m.name==='truce-plaster'),expected=[[-7,4,5,4],[7,4,4.5,3.6],[-6.5,-1.5,5,3.2],[6.5,-.6,3,2]];
   if(anchors.length!==4||expected.some(([x,z,w,d])=>!anchors.some(m=>{const b=m.getBoundingInfo().boundingBox.extendSize;return m.position.x===x&&m.position.z===z&&m.position.y===1.5&&Math.abs(b.x-w!/2)<1e-5&&Math.abs(b.y-1.35)<1e-5&&Math.abs(b.z-d!/2)<1e-5;})))return null;
   for(const [name,count]of Object.entries(townCounts)){const group=meshes.filter(m=>m.name==='truce-'+name);if(group.length!==count)return null;
    for(const mesh of group){if(!box(mesh)||!['truce-craft-','truce-detail-'].some(p=>mesh.material!.name.startsWith(p)))return null;selected.push({mesh,...ARCHITECTURE_ART.town});}}
  }else if(root.name==='trial-courtroom'){
   for(const [i,name,recipe]of [[0,'judge-rostrum',ARCHITECTURE_ART.judge],[1,'defendant-stand',ARCHITECTURE_ART.defendant]] as const){
    const stand=meshes.filter(m=>m.name==='courtroom-'+name);if(stand.length!==1||stand[0]!.material?.name!=='place-art-court-oak')return null;
    const p=stand[0]!.position;if(!same(p.asArray(),i===0?[0,1.02,4.2]:[0,.43,-1.2]))return null;
    const parts=[stand[0]!];for(const kind of ['upright','rail'])for(const side of [-1,1]){const trim=meshes.filter(m=>m.name===`place-art-stand-${kind}-${i}-${side}`);if(trim.length!==1||trim[0]!.material?.name!=='place-art-walnut-moulding')return null;parts.push(trim[0]!);}
    for(const mesh of parts){if(!box(mesh))return null;selected.push({mesh,...recipe});}
   }
  }else return null;
  return exactLayout(root,selected.map(s=>s.mesh))?selected:null;
 }
 function release(root:TransformNode,block=false){const o=owners.get(root);if(!o)return;owners.delete(root);root.onDisposeObservable.remove(o.observer);if(block){rejected.add(root);rejections++;}
  for(const p of o.parts){if(!p.mesh.isDisposed()&&p.mesh.geometry===p.owned&&!p.source.isDisposed())p.source.applyToMesh(p.mesh);if(!p.owned.isDisposed()&&p.owned.meshes.length===0)p.owned.dispose();if(p.mesh.isDisposed()&&!p.source.isDisposed()&&p.source.meshes.length===0)p.source.dispose();}
 }
 function install(root:TransformNode){
  if(owners.size>=ARCHITECTURE_ART.maxRoots)return;const selected=collect(root);if(!selected)return;
  const count=[...owners.values()].reduce((n,o)=>n+o.parts.length,0);if(count+selected.length>ARCHITECTURE_ART.maxBindings)return;
  const prepared=selected.map(({mesh,anchorY,heightScale})=>{const source=mesh.geometry!,positions=reshapeArchitecture(Array.from(source.getVerticesData(VertexBuffer.PositionKind)!),mesh.position.y,mesh.rotation.z,anchorY,heightScale),normals:number[]=[];VertexData.ComputeNormals(positions,source.getIndices()!,normals);return {mesh,source,positions,normals};});
  const o:Owner={root,name:root.name,parts:[],observer:null};owners.set(root,o);
  try{for(const {mesh,source,positions,normals}of prepared){const owned=source.copy('architecture-art-'+mesh.uniqueId);o.parts.push({mesh,source,owned,name:mesh.name,material:mesh.material,position:mesh.position.asArray(),rotation:mesh.rotation.asArray(),scale:mesh.scaling.asArray(),bytes:912});owned.setVerticesData(VertexBuffer.PositionKind,positions,false);owned.setVerticesData(VertexBuffer.NormalKind,normals,false);owned.applyToMesh(mesh);mesh.computeWorldMatrix(true);authored++;}o.observer=root.onDisposeObservable.addOnce(()=>release(root));}catch(error){release(root);throw error;}
 }
 const before=scene.onBeforeRenderObservable.add(()=>{if(disposed)return;
  for(const [root,o]of owners){if(root.isDisposed()||root.name!==o.name||!plainRoot(root)||scene.transformNodes.filter(r=>r.name===o.name&&!r.isDisposed()).length!==1||o.parts.some(p=>p.mesh.isDisposed()||p.mesh.parent!==root||p.mesh.name!==p.name||p.mesh.geometry!==p.owned||p.mesh.material!==p.material||!same(p.mesh.position.asArray(),p.position)||!same(p.mesh.rotation.asArray(),p.rotation)||!same(p.mesh.scaling.asArray(),p.scale)))release(root,true);}
  for(const name of ['kingdom-truce','trial-courtroom']){const matches=scene.transformNodes.filter(r=>r.name===name&&!r.isDisposed()&&r.isEnabled());if(matches.length!==1)continue;const root=matches[0]!;if(!owners.has(root)&&!rejected.has(root))install(root);}
 });
 function dispose(){if(disposed)return;disposed=true;scene.onBeforeRenderObservable.remove(before);scene.onDisposeObservable.remove(onDispose);for(const root of [...owners.keys()])release(root);}
 const onDispose=scene.onDisposeObservable.addOnce(dispose);
 return {dispose,inspect(){return {profile:ARCHITECTURE_ART.id,approved:false,disposed,authored,rejections,roots:owners.size,bindings:[...owners.values()].reduce((n,o)=>n+o.parts.length,0),geometryBytes:[...owners.values()].reduce((n,o)=>n+o.parts.reduce((s,p)=>s+p.bytes,0),0),additionalTextures:0,additionalMaterials:0,additionalMeshes:0,actorTextureWrites:0,gameplayWrites:0,maps:[...owners.values()].map(o=>({owner:o.name,visible:o.root.isEnabled(),parts:o.parts.length}))};}};
}
