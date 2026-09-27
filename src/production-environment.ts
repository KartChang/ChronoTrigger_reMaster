import {Color3,DynamicTexture,Material,Mesh,MeshBuilder,Scene,StandardMaterial,Texture,TransformNode,VertexBuffer} from '@babylonjs/core';
import {paintProductionSurface,PRODUCTION_ART} from './production-art';
import type {ProductionSurface} from './production-art';
import {preservePixelPalette} from './pixel-presentation';
/** A scene-owned, lazy art finish at the application composition root.
 * Existing World still owns geometry, gameplay, animation, cameras and rendering.
 * This adds only authored static surfaces/architecture to explicit non-held roots.
 * It never reads State, consumes events, starts timers or writes collision/navigation.
 */
export function installProductionEnvironment(scene:Scene){
 if(scene.isDisposed)throw new Error('A live scene is required');
 const textures=new Map<ProductionSurface,DynamicTexture>(),materials=new Map<string,StandardMaterial>();
 const applied=new Map<TransformNode,{chapter:string;surfaces:string[];addedMeshes:number}>();
 let uploads=0,disposed=false;
 const texture=(kind:ProductionSurface):DynamicTexture=>{
  let t=textures.get(kind);if(t)return t;
  const pixels=paintProductionSurface(kind);t=new DynamicTexture('production-'+kind,{width:pixels.width,height:pixels.height},scene,false,Texture.NEAREST_SAMPLINGMODE);
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
  }else if(chapter==='guardia1000')trees(root,/^guardia1000(tree|canopy)$/);
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
   // Reframe the established fixed court only. Portrait keeps both jury banks; no camera rotation.
   const ratio=scene.getEngine().getRenderWidth()/Math.max(1,scene.getEngine().getRenderHeight()),half=Math.max(7.8,9/ratio);
   camera.orthoTop=half;camera.orthoBottom=-half;camera.orthoLeft=-half*ratio;camera.orthoRight=half*ratio;scene.updateTransformMatrix(true);
  }
 }
 const observer=scene.onBeforeRenderObservable.add(beforeRender);
 scene.onDisposeObservable.addOnce(()=>{disposed=true;scene.onBeforeRenderObservable.remove(observer);applied.clear();textures.clear();materials.clear();});
 return {inspect(){return {profile:PRODUCTION_ART.id,approved:false,disposed,uploads,textureBytes:[...textures.values()].reduce((n,t)=>{const s=t.getSize();return n+s.width*s.height*4;},0),
  textures:[...textures.entries()].map(([kind,t])=>({kind,...t.getSize(),alpha:t.hasAlpha,sampling:t.samplingMode})),
  maps:[...applied.entries()].map(([root,record])=>({chapter:record.chapter,visible:root.isEnabled(),surfaces:[...record.surfaces],addedMeshes:record.addedMeshes})),
  source:'authored-static-pixel-surfaces-and-wall-facings',conceptImagesEmbedded:false};}};
}
