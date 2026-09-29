import {Color3,DynamicTexture,Material,Mesh,MeshBuilder,Scene,StandardMaterial,Texture,TransformNode,VertexBuffer,VertexData} from '@babylonjs/core';
import {paintProductionSurface,paintProductionForestFloor,PRODUCTION_ART} from './production-art';
import type {PixelSurface,ProductionSurface} from './production-art';
export type EnvironmentComposition={surface?:(kind:ProductionSurface,base:PixelSurface)=>PixelSurface|null;courtFascia?:(name:string,positions:readonly number[],origin:readonly number[],rotation:readonly number[])=>number[]|null};
import {preservePixelPalette} from './pixel-presentation';
/** A scene-owned, lazy art finish at the application composition root.
 * Existing World still owns geometry, gameplay, animation, cameras and rendering.
 * This adds only authored static surfaces/architecture to explicit non-held roots.
 * It never reads State, consumes events, starts timers or writes collision/navigation.
 */
export function installProductionEnvironment(scene:Scene,composition?:EnvironmentComposition){
 if(scene.isDisposed)throw new Error('A live scene is required');
 const textures=new Map<ProductionSurface,DynamicTexture>(),materials=new Map<string,StandardMaterial>();
 const applied=new Map<TransformNode,{chapter:string;surfaces:string[];addedMeshes:number}>();
 let uploads=0,disposed=false,courtFasciaAuthored=0,canopyAuthored=0;
 const refinishedExistingTextures:string[]=[];
 const texture=(kind:ProductionSurface):DynamicTexture=>{
  let t=textures.get(kind);if(t)return t;
  const base=paintProductionSurface(kind),revised=composition?.surface?.(kind,base)??null,pixels=revised??base;
  if(pixels.width!==base.width||pixels.height!==base.height||!(pixels.rgba instanceof Uint8ClampedArray)||pixels.rgba.length!==base.rgba.length)throw new Error('Invalid authored surface output');
  if(revised&&kind==='canopy-atlas')canopyAuthored++;t=new DynamicTexture('production-'+kind,{width:pixels.width,height:pixels.height},scene,false,Texture.NEAREST_SAMPLINGMODE);
  const c=t.getContext() as CanvasRenderingContext2D,image=c.createImageData(pixels.width,pixels.height);image.data.set(pixels.rgba);c.putImageData(image,0,0);
  t.hasAlpha=['canopy-atlas','court-window','court-banner'].includes(kind);t.wrapU=t.wrapV=Texture.CLAMP_ADDRESSMODE;t.update();uploads++;textures.set(kind,t);return t;
 };
 const material=(kind:ProductionSurface,unlit=false,repeat=false):StandardMaterial=>{
  const key=kind+':'+unlit+':'+repeat;let m=materials.get(key);if(m)return m;
  m=new StandardMaterial('production-'+key,scene);m.diffuseTexture=texture(kind);m.diffuseColor=unlit?Color3.White():new Color3(.72,.72,.72);m.specularColor=Color3.Black();
  if(repeat)m.diffuseTexture.wrapU=m.diffuseTexture.wrapV=Texture.WRAP_ADDRESSMODE;
  if(unlit){m.emissiveTexture=m.diffuseTexture;m.disableLighting=true;preservePixelPalette(m);}
  if(m.diffuseTexture.hasAlpha){m.useAlphaFromDiffuseTexture=true;m.transparencyMode=Material.MATERIAL_ALPHATEST;m.backFaceCulling=false;}
  materials.set(key,m);return m;
 };
 const assign=(mesh:Mesh,kind:ProductionSurface,unlit=false,repeat=false)=>{mesh.material=material(kind,unlit,repeat);};
 const box=(root:TransformNode,name:string,x:number,y:number,z:number,w:number,h:number,d:number,kind:ProductionSurface)=>{
  const m=MeshBuilder.CreateBox('production-'+name,{width:w,height:h,depth:d},scene);m.parent=root;m.position.set(x,y,z);m.material=material(kind);m.isPickable=false;m.receiveShadows=true;return m;
 };
 const plane=(root:TransformNode,name:string,x:number,y:number,z:number,w:number,h:number,kind:ProductionSurface)=>{
  const m=MeshBuilder.CreatePlane('production-'+name,{width:w,height:h},scene);m.parent=root;m.position.set(x,y,z);m.material=material(kind,true);m.isPickable=false;return m;
 };
 function trees(root:TransformNode,names:RegExp,atlasAlready=false):number{
  let index=0;for(const m of root.getChildMeshes())if(m instanceof Mesh&&names.test(m.name)){
   assign(m,'canopy-atlas',true);if(!atlasAlready){const uvs=m.getVerticesData(VertexBuffer.UVKind);if(!uvs)throw new Error('Missing authored tree UVs');const variant=index%4;
    m.setVerticesData(VertexBuffer.UVKind,Array.from(uvs,(v,i)=>i%2?v:(variant*136+4+v*128)/544),false);
   }index++;
  }return index;
 }
 function apply(root:TransformNode,chapter:string):void{
  const before=scene.meshes.length,surfaces:string[]=[];
  if(chapter==='canyon'){
   for(const m of root.getChildMeshes())if(m instanceof Mesh){
    if(m.name==='canyon-floor'){assign(m,'canyon-ground',true);surfaces.push(m.name);}
    else if(m.name==='terrace-cliff'||m.name==='ridge'){assign(m,'canyon-rock');surfaces.push(m.name);}
    else if(m.name==='terrace-turf'){assign(m,'canyon-turf');surfaces.push(m.name);}
   }
   trees(root,/^pixel-canopy$/,true);
   // A distant painted ridge, not a replacement gameplay screenshot or a traversable prop.
   // Behind the original north boundary: actual actors, path, rocks and foreground trees remain 3D.
   plane(root,'canyon-distance',0,4.5,12.9,38,18,'mountain-distance');
  }else if(chapter==='courtroom'){
   if(composition?.courtFascia){
    const targets=root.getChildMeshes(false).filter((m):m is Mesh=>m instanceof Mesh&&/^courtroom-scenery-(judge|stand)-(panel|lip|stile-[-]?1|inlay)$/.test(m.name));
    if(targets.length!==10||new Set(targets.map(m=>m.name)).size!==10)throw new Error('Incomplete court fascia cohort');
    const prepared=targets.map(mesh=>{
     if(mesh.parent!==root||mesh.rotationQuaternion||!mesh.scaling.equalsToFloats(1,1,1)||mesh.geometry?.meshes.length!==1||mesh.getTotalVertices()!==24||mesh.getTotalIndices()!==36)throw new Error('Exclusive original court fascia required');
     const source=mesh.getVerticesData(VertexBuffer.PositionKind);if(!source)throw new Error('Missing court fascia vertices');
     const positions=composition.courtFascia!(mesh.name,Array.from(source),mesh.position.asArray(),mesh.rotation.asArray());
     if(!positions||positions.length!==72||!positions.every(Number.isFinite))throw new Error('Invalid court fascia author output');
     const normals:number[]=[];VertexData.ComputeNormals(positions,mesh.getIndices()!,normals);return {mesh,positions,normals};
    });
    // This is the initial authoring of the root's own exclusive geometry, just
    // like its surface assignment below. No extra retained Geometry/buffer layer.
    for(const {mesh,positions,normals}of prepared){mesh.setVerticesData(VertexBuffer.PositionKind,positions,false);mesh.setVerticesData(VertexBuffer.NormalKind,normals,false);mesh.computeWorldMatrix(true);courtFasciaAuthored++;}
   }
   for(const m of root.getChildMeshes())if(m instanceof Mesh){
    if(m.name==='courtroom-ground'){assign(m,'court-ground',true);surfaces.push(m.name);}
    else if(m.name==='court-curved-dais'){assign(m,'court-dais');surfaces.push(m.name);}
    else if(/^(courtroom-back-wall|courtroom-wall-course|courtroom-cutaway-side-wall)$/.test(m.name)){assign(m,'court-stone',false,true);surfaces.push(m.name);}
    else if(/courtroom-(judge-rostrum|defendant-stand)/.test(m.name)){assign(m,'court-wood');surfaces.push(m.name);}
    else if(/courtroom-(jury-tier|scenery-.*-panel)/.test(m.name)){assign(m,'court-timber');surfaces.push(m.name);}
    else if(m.name==='courtroom-velvet-curtain'){assign(m,'court-velvet');surfaces.push(m.name);}
    else if(m.name==='courtroomroyal-stained-glass'){assign(m,'court-window',true);surfaces.push(m.name);}
   }
   // Architectural facings stay on the existing north wall; no new obstacle enters the actor lane.
   for(const side of [-1,1]){
    const x=side*6.9;
    box(root,'court-pier-foot-'+side,x,.22,6.91,1.05,.44,.66,'court-stone');
    box(root,'court-pier-'+side,x,2.18,7.01,.62,3.6,.48,'court-stone');
    box(root,'court-capital-'+side,x,4.08,6.91,1.12,.26,.66,'court-stone');
    plane(root,'court-banner-'+side,side*4.65,2.61,6.32,1.48,3.94,'court-banner');
    for(const index of [-1,0,1]){
     const bx=side*5.95+index*.17;
     box(root,'court-candle-'+side+'-'+index,bx,1.92+(index===0?.15:0),6.34,.045,.34,.045,'court-wood');
    }
   }
   box(root,'court-cornice',0,4.21,7.02,15.9,.24,.64,'court-stone');
   // Side pilasters frame the aisle, outside the entire existing jury/actor corridor.
   for(const side of [-1,1])for(const z of [-4.8,-.8]){
    const x=side*7.7,tag=side+'-'+z;
    box(root,'court-side-plinth-'+tag,x,.20,z,.88,.40,.92,'court-stone');
    box(root,'court-side-pillar-'+tag,x,1.61,z,.51,2.42,.56,'court-stone');
    box(root,'court-side-cap-'+tag,x,2.90,z,.92,.22,.96,'court-stone');
   }
  }else if(chapter==='guardia1000'){
   trees(root,/^guardia1000(tree|canopy)$/);
   const floor=root.getChildMeshes().find(m=>m.name==='guardia1000-ground');
   const m=floor?.material,t=m instanceof StandardMaterial?m.diffuseTexture:null;
   if(m instanceof StandardMaterial&&t instanceof DynamicTexture){
    const pixels=paintProductionForestFloor(),size=t.getSize();
    if(size.width!==pixels.width||size.height!==pixels.height)throw new Error('Forest surface ownership/size mismatch');
    const c=t.getContext() as CanvasRenderingContext2D,image=c.createImageData(pixels.width,pixels.height);image.data.set(pixels.rgba);c.putImageData(image,0,0);t.update();
    m.disableLighting=true;m.emissiveTexture=t;preservePixelPalette(m);surfaces.push(floor!.name);refinishedExistingTextures.push(t.name);
   }
  }
  // Do not touch the 600-era woodland's diagnostic texture contract or held home objects here.
  applied.set(root,{chapter,surfaces,addedMeshes:scene.meshes.length-before});root.onDisposeObservable.addOnce(()=>applied.delete(root));
 }
 function beforeRender():void{
  if(disposed)return;
  for(const [name,chapter] of [['truce-canyon-600','canyon'],['trial-courtroom','courtroom'],['trial-guardia1000','guardia1000']] as const){
   const root=scene.getTransformNodeByName(name);if(root&&!root.isDisposed()&&root.isEnabled()&&!applied.has(root))apply(root,chapter);
  }
  const court=scene.getTransformNodeByName('trial-courtroom'),camera=scene.activeCamera;
  if(court?.isEnabled()&&camera&&camera.orthoTop!==null&&camera.orthoBottom!==null){
   // Keep the complete north-wall composition inside the HUD-safe area.
   // A 7.8 half-height cropped the lancet window/top cornice in the native CI98 view.
   // Shift the orthographic view upward rather than shrinking the cast to hide the crop.
   // The original angle/target and useful zoom remain; both jury banks stay in view.
   const ratio=scene.getEngine().getRenderWidth()/Math.max(1,scene.getEngine().getRenderHeight()),half=Math.max(7.8,9/ratio),lift=1.2;
   camera.orthoTop=half+lift;camera.orthoBottom=-half+lift;camera.orthoLeft=-half*ratio;camera.orthoRight=half*ratio;scene.updateTransformMatrix(true);
  }
 }
 const observer=scene.onBeforeRenderObservable.add(beforeRender);
 scene.onDisposeObservable.addOnce(()=>{disposed=true;scene.onBeforeRenderObservable.remove(observer);applied.clear();textures.clear();materials.clear();});
 return {inspect(){return {profile:PRODUCTION_ART.id,approved:false,disposed,uploads,...(composition?{composition:{courtFasciaAuthored,canopyAuthored,addedResources:0}}:{}),textureBytes:[...textures.values()].reduce((n,t)=>{const s=t.getSize();return n+s.width*s.height*4;},0),
  textures:[...textures.entries()].map(([kind,t])=>({kind,...t.getSize(),alpha:t.hasAlpha,sampling:t.samplingMode})),
  maps:[...applied.entries()].map(([root,record])=>({chapter:record.chapter,visible:root.isEnabled(),surfaces:[...record.surfaces],addedMeshes:record.addedMeshes})),
  refinishedExistingTextures:[...refinishedExistingTextures],source:'authored-static-pixel-surfaces-and-wall-facings',conceptImagesEmbedded:false};}};
}
