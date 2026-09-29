import {Color3,DynamicTexture,Material,Mesh,MeshBuilder,Scene,StandardMaterial,Texture,TransformNode,VertexBuffer,VertexData} from '@babylonjs/core';
import {GROVE_ART,paintGroveSurface} from './production-grove-art';
import type {GroveSurface} from './production-grove-art';
import {preservePixelPalette} from './pixel-presentation';
const SITES:Readonly<Record<string,readonly(readonly[number,number,number])[]>>=Object.freeze({
 'kingdom-truce':[[-10,-7,3.7],[10,8,3.7],[-10,9,3.7],[9,-8,3.7]],
 'kingdom-forest':[[-10.5,-7,4.8],[-10.5,-2,4.8],[-10.5,3,4.8],[-10.5,8,4.8],[10.5,-7,4.8],[10.5,-2,4.8],[10.5,3,4.8],[10.5,8,4.8],[-7,7,3.7],[7,8,3.7],[-6,-6,3.7],[6,-5,3.7]]
});
type Owner={root:TransformNode;trees:Mesh[];added:Mesh[];observer:ReturnType<TransformNode['onDisposeObservable']['addOnce']>};
/** The same static scene pass runs on CPU and WebGL. Original trees, textures, colliders and State are never written. */
export function installProductionGrove(scene:Scene){
 if(scene.isDisposed)throw new Error('A live scene is required');
 const owners=new Map<TransformNode,Owner>(),textures=new Map<GroveSurface,DynamicTexture>(),materials=new Map<GroveSurface,StandardMaterial>();
 const rejected=new WeakSet<TransformNode>();let disposed=false,uploads=0,rejections=0;
 const plain=(r:TransformNode)=>!r.parent&&!r.rotationQuaternion&&r.position.equalsToFloats(0,0,0)&&r.rotation.equalsToFloats(0,0,0)&&r.scaling.equalsToFloats(1,1,1);
 function collect(root:TransformNode):Mesh[]|null{
  const sites=Object.hasOwn(SITES,root.name)?SITES[root.name]:null;if(!sites||!plain(root))return null;
  const trees=root.getChildMeshes(false).filter((m):m is Mesh=>m instanceof Mesh&&m.name==='oak'&&m.parent===root);
  if(trees.length!==sites.length)return null;
  const selected:Mesh[]=[];
  for(const [x,z,w]of sites){const m=trees.find(m=>m.position.x===x&&m.position.z===z);if(!m||selected.includes(m)||m.isDisposed()||m.billboardMode!==Mesh.BILLBOARDMODE_ALL||m.rotationQuaternion||!m.scaling.equalsToFloats(1,1,1)||!m.rotation.equalsToFloats(0,0,0)||Math.abs(m.position.y-(w*1.25/2+.1))>1e-8||m.getTotalVertices()!==4||m.getTotalIndices()!==6)return null;
   const mat=m.material,t=mat instanceof StandardMaterial?mat.diffuseTexture:null;
   if(!(mat instanceof StandardMaterial)||mat.name!==root.name.slice(8)+'-oak'||!(t instanceof DynamicTexture)||mat.emissiveTexture!==t||!t.hasAlpha||t.samplingMode!==Texture.NEAREST_SAMPLINGMODE||t.getSize().width!==64||t.getSize().height!==80)return null;
   const shape=VertexData.CreatePlane({width:w,height:w*1.25});
   for(const [key,expected]of [[VertexBuffer.PositionKind,shape.positions!],[VertexBuffer.NormalKind,shape.normals!],[VertexBuffer.UVKind,shape.uvs!]] as const){const actual=m.getVerticesData(key);if(!actual||actual.length!==expected.length||Array.from(actual).some((v,i)=>!Number.isFinite(v)||Math.abs(v-expected[i]!)>1e-5))return null;}
   const indices=m.getIndices();if(!indices||indices.length!==shape.indices!.length||Array.from(indices).some((v,i)=>v!==shape.indices![i]))return null;
   selected.push(m);
  }
  return selected;
 }
 function mat(kind:GroveSurface){let m=materials.get(kind);if(m)return m;const p=paintGroveSurface(kind),t=new DynamicTexture('grove-art-'+kind,{width:p.width,height:p.height},scene,false,Texture.NEAREST_SAMPLINGMODE);
  textures.set(kind,t);const c=t.getContext() as CanvasRenderingContext2D,image=c.createImageData(p.width,p.height);image.data.set(p.rgba);c.putImageData(image,0,0);t.hasAlpha=true;t.wrapU=t.wrapV=Texture.CLAMP_ADDRESSMODE;t.update();uploads++;
  m=new StandardMaterial('grove-art-'+kind,scene);materials.set(kind,m);m.diffuseTexture=t;m.emissiveTexture=t;m.diffuseColor=Color3.White();m.disableLighting=true;m.useAlphaFromDiffuseTexture=true;m.transparencyMode=Material.MATERIAL_ALPHATEST;m.backFaceCulling=false;preservePixelPalette(m);return m;
 }
 function clearAssets(){for(const m of materials.values())m.dispose(false,false);for(const t of textures.values())t.dispose();materials.clear();textures.clear();}
 function release(root:TransformNode,block=false){const o=owners.get(root);if(!o)return;owners.delete(root);root.onDisposeObservable.remove(o.observer);for(const m of o.added)if(!m.isDisposed())m.dispose(false,false);if(block){rejected.add(root);rejections++;}if(!owners.size)clearAssets();}
 function install(root:TransformNode,trees:Mesh[]){
  const total=[...owners.values()].reduce((n,o)=>n+o.added.length,0);if(owners.size>=GROVE_ART.maxRoots||total+trees.length*2>GROVE_ART.maxMeshes)return;
  const o:Owner={root,trees,added:[],observer:null};owners.set(root,o);
  try{for(const [index,tree]of trees.entries())for(const kind of ['root-moss','fern-fronds'] as const){
   const moss=kind==='root-moss',m=moss?MeshBuilder.CreateGround('grove-art-roots-'+index,{width:1.9,height:1.4},scene):MeshBuilder.CreatePlane('grove-art-fronds-'+index,{width:1.18,height:.78},scene);
   o.added.push(m);m.parent=root;m.isPickable=false;m.material=mat(kind);
   if(moss)m.position.set(tree.position.x,.085,tree.position.z);else{m.position.set(tree.position.x-Math.sign(tree.position.x)*.78,.49,tree.position.z-.28);m.billboardMode=Mesh.BILLBOARDMODE_ALL;}
   const uv=m.getVerticesData(VertexBuffer.UVKind);if(!uv)throw new Error('Missing grove UV');m.setVerticesData(VertexBuffer.UVKind,Array.from(uv,(v,i)=>i%2?v:(index%4*64+2+v*60)/256),false);
  }o.observer=root.onDisposeObservable.addOnce(()=>release(root));}catch(error){release(root);throw error;}
 }
 const before=scene.onBeforeRenderObservable.add(()=>{if(disposed)return;
  for(const [root,o]of owners){const current=root.isDisposed()?null:collect(root);if(scene.transformNodes.filter(r=>r.name===root.name&&!r.isDisposed()).length!==1||!current||current.some((t,i)=>t!==o.trees[i])||o.added.some(m=>m.isDisposed()||m.parent!==root)){release(root,true);}}
  for(const name of Object.keys(SITES)){const matches=scene.transformNodes.filter(r=>r.name===name&&!r.isDisposed());if(matches.length!==1)continue;const root=matches[0]!;if(root.isEnabled()&&!owners.has(root)&&!rejected.has(root)){const trees=collect(root);if(trees)install(root,trees);}}
 });
 function dispose(){if(disposed)return;disposed=true;scene.onBeforeRenderObservable.remove(before);scene.onDisposeObservable.remove(onDispose);for(const root of [...owners.keys()])release(root);clearAssets();}
 const onDispose=scene.onDisposeObservable.addOnce(dispose);
 return {dispose,inspect(){return {profile:GROVE_ART.id,approved:false,disposed,uploads,rejections,roots:owners.size,addedMeshes:[...owners.values()].reduce((n,o)=>n+o.added.length,0),textureCount:textures.size,textureBytes:[...textures.values()].reduce((n,t)=>n+t.getSize().width*t.getSize().height*4,0),originalTextureWrites:0,gameplayWrites:0,maps:[...owners.values()].map(o=>({name:o.root.name,visible:o.root.isEnabled(),trees:o.trees.length,added:o.added.length}))};}};
}
