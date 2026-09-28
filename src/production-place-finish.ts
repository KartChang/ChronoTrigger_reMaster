import {Color3,DynamicTexture,Material,Mesh,MeshBuilder,Scene,StandardMaterial,Texture,TransformNode} from '@babylonjs/core';
import {PLACE_ART,paintPlaceSurface} from './production-place-art';
import type {PlaceSurface} from './production-place-art';
/** Additive town verge and furniture-specific court materials. No State, actor texture,
 * borrowed upload, navigation, camera, event, time, save or native-report access. */
export function installProductionPlaces(scene:Scene){
 if(scene.isDisposed)throw new Error('A live scene is required');
 type Assignment={mesh:Mesh;old:Material|null;owned:StandardMaterial};
 type Record={root:TransformNode;chapter:string;added:Mesh[];assigned:Assignment[];observer:ReturnType<TransformNode['onDisposeObservable']['addOnce']>};
 const roots=new Map<TransformNode,Record>(),textures=new Map<PlaceSurface,DynamicTexture>(),materials=new Map<string,StandardMaterial>();
 let disposed=false,uploads=0;
 function material(kind:PlaceSurface){let m=materials.get(kind);if(m)return m;
  const p=paintPlaceSurface(kind),t=new DynamicTexture('place-art-'+kind,{width:p.width,height:p.height},scene,false,Texture.NEAREST_SAMPLINGMODE),c=t.getContext() as CanvasRenderingContext2D,image=c.createImageData(p.width,p.height);image.data.set(p.rgba);c.putImageData(image,0,0);t.hasAlpha=kind==='town-verge';t.wrapU=t.wrapV=kind==='town-verge'?Texture.CLAMP_ADDRESSMODE:Texture.WRAP_ADDRESSMODE;t.update();uploads++;
  m=new StandardMaterial('place-art-'+kind,scene);m.diffuseTexture=t;m.diffuseColor=Color3.White();m.specularColor=Color3.Black();if(t.hasAlpha){m.useAlphaFromDiffuseTexture=true;m.transparencyMode=Material.MATERIAL_ALPHATEST;m.alphaCutOff=.4;}textures.set(kind,t);materials.set(kind,m);return m;
 }
 function trimMaterial(){let m=materials.get('trim');if(m)return m;m=new StandardMaterial('place-art-walnut-moulding',scene);m.diffuseColor=new Color3(.49,.34,.18);m.specularColor=Color3.Black();materials.set('trim',m);return m;}
 function releaseResources(){for(const m of materials.values())m.dispose(false,false);for(const t of textures.values())t.dispose();materials.clear();textures.clear();}
 function release(root:TransformNode){const r=roots.get(root);if(!r)return;roots.delete(root);root.onDisposeObservable.remove(r.observer);
  for(const a of r.assigned)if(!a.mesh.isDisposed()&&a.mesh.material===a.owned)a.mesh.material=a.old;
  for(const m of r.added)if(!m.isDisposed())m.dispose(false,false);if(!roots.size)releaseResources();
 }
 function install(root:TransformNode,chapter:string){
  if(roots.size>=2)return;
  const targets=root.getChildMeshes(false).filter((m):m is Mesh=>m instanceof Mesh&&m.parent===root&&!m.isDisposed());
  const floor=targets.find(m=>m.name==='truce-floor');
  const stands=targets.filter(m=>m.name==='courtroom-judge-rostrum'||m.name==='courtroom-defendant-stand'),seats=targets.filter(m=>m.name==='courtroom-jury-tier');
  if(chapter==='truce'){
   if(!floor||floor.position.x!==0||floor.position.y!==.06||floor.position.z!==1||!floor.scaling.equalsToFloats(1,1,1)||!floor.rotation.equalsToFloats(0,0,0))return;
   const b=floor.getBoundingInfo().boundingBox.extendSize;if(Math.abs(b.x-12)>1e-5||Math.abs(b.z-11)>1e-5)return;
  }else{
   if(stands.length!==2||new Set(stands.map(m=>m.name)).size!==2||seats.length!==7)return;
   for(const m of [...stands,...seats]){const seat=seats.includes(m);if(!(m.material instanceof StandardMaterial)||m.material.name!==('production-'+(seat?'court-timber':'court-wood')+':false:false')||m.getTotalVertices()!==24||!m.scaling.equalsToFloats(1,1,1)||!m.rotation.equalsToFloats(0,0,0))return;}
  }
  const r:Record={root,chapter,added:[],assigned:[],observer:null};roots.set(root,r);
  const add=(name:string,x:number,y:number,z:number,w:number,h:number,d:number,m:StandardMaterial)=>{const b=MeshBuilder.CreateBox('place-art-'+name,{width:w,height:h,depth:d},scene);b.parent=root;b.position.set(x,y,z);b.material=m;b.isPickable=false;b.receiveShadows=true;r.added.push(b);};
  try{
   if(chapter==='truce'){
    const m=MeshBuilder.CreateGround('place-art-town-verge',{width:24,height:22},scene);r.added.push(m);m.parent=root;m.position.set(0,.067,1);m.material=material('town-verge');m.isPickable=false;m.receiveShadows=true;
   }else{
    for(const m of [...stands,...seats]){const owned=material(seats.includes(m)?'court-seat':'court-oak');r.assigned.push({mesh:m,old:m.material,owned});m.material=owned;}
    for(const [i,m]of seats.entries()){const b=m.getBoundingInfo().boundingBox.extendSize;add('seat-cushion-'+i,m.position.x,m.position.y+b.y+.014,m.position.z,b.x*1.86,.026,b.z*1.45,material('court-velvet'));}
    for(const [i,m]of stands.entries()){const b=m.getBoundingInfo().boundingBox.extendSize,z=m.position.z-b.z-.021;
     for(const side of [-1,1]){add('stand-upright-'+i+'-'+side,m.position.x+side*b.x*.85,m.position.y,z,.035,b.y*1.62,.035,trimMaterial());add('stand-rail-'+i+'-'+side,m.position.x,m.position.y+side*b.y*.81,z,b.x*1.74,.035,.035,trimMaterial());}
    }
   }
   r.observer=root.onDisposeObservable.addOnce(()=>release(root));
  }catch(error){release(root);throw error;}
 }
 const before=scene.onBeforeRenderObservable.add(()=>{if(disposed)return;for(const [name,chapter]of [['kingdom-truce','truce'],['trial-courtroom','courtroom']] as const){const root=scene.getTransformNodeByName(name);if(root&&!root.isDisposed()&&root.isEnabled()&&!roots.has(root))install(root,chapter);}});
 function dispose(){if(disposed)return;disposed=true;scene.onBeforeRenderObservable.remove(before);scene.onDisposeObservable.remove(onDispose);for(const root of [...roots.keys()])release(root);releaseResources();}
 const onDispose=scene.onDisposeObservable.addOnce(dispose);
 return {dispose,inspect(){return {profile:PLACE_ART.id,approved:false,disposed,uploads,textureCount:textures.size,textureBytes:[...textures.values()].reduce((n,t)=>{const s=t.getSize();return n+s.width*s.height*4;},0),materialCount:materials.size,addedMeshes:[...roots.values()].reduce((n,r)=>n+r.added.filter(m=>!m.isDisposed()).length,0),maps:[...roots.values()].map(r=>({chapter:r.chapter,visible:r.root.isEnabled(),added:r.added.length,assignments:r.assigned.map(a=>a.mesh.name)})),baseTextureWrites:0,actorTextureWrites:0,gameplayWrites:0,cameraChanged:false};}};
}
