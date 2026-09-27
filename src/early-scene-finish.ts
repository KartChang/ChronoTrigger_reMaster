import {Color3,DynamicTexture,Material,Mesh,MeshBuilder,Scene,StandardMaterial,Texture,TransformNode,VertexBuffer} from '@babylonjs/core';
import {EARLY_SCENE_ART,paintEarlySceneSurface} from './early-scene-art';
import type {SceneSurface} from './early-scene-art';
import {preservePixelPalette} from './pixel-presentation';
/** Scene-owned static set dressing; existing World retains all gameplay/camera/animation.
 * Explicit root/name allowlists prevent indirect edits to held home/fair/actor resources.
 * Shared authored textures are lazy, immutable after upload and released with the scene.
 */
export const EARLY_SCENE_ROOTS=Object.freeze({
 'kingdom-castle':'castle','kingdom-chamber':'chamber','cathedral-set':'cathedral','passage-set':'passage','sanctum-set':'sanctum',
 'trial-hall1000':'hall1000','trial-cellblock':'cellblock','trial-execution':'execution','trial-prisonstairs':'prisonstairs','trial-warden':'warden','trial-prisonbridge':'prisonbridge','truce-canyon-600':'canyon'
} as const);
type Chapter=typeof EARLY_SCENE_ROOTS[keyof typeof EARLY_SCENE_ROOTS];
export function installEarlySceneFinish(scene:Scene){
 if(scene.isDisposed)throw new Error('A live scene is required');
 const textures=new Map<SceneSurface,DynamicTexture>(),materials=new Map<string,StandardMaterial>();
 const roots=new Map<TransformNode,{chapter:Chapter;assignments:string[];added:number}>();
 let disposed=false,uploads=0;
 function texture(kind:SceneSurface){let t=textures.get(kind);if(t)return t;const p=paintEarlySceneSurface(kind);
  t=new DynamicTexture('early-art-'+kind,{width:p.width,height:p.height},scene,false,Texture.NEAREST_SAMPLINGMODE);
  const ctx=t.getContext() as CanvasRenderingContext2D,image=ctx.createImageData(p.width,p.height);image.data.set(p.rgba);ctx.putImageData(image,0,0);
  t.hasAlpha=kind==='understory';t.wrapU=t.wrapV=['limestone','column-stone','crypt-stone','carved-oak','ironwork','linen','quilt'].includes(kind)?Texture.WRAP_ADDRESSMODE:Texture.CLAMP_ADDRESSMODE;t.update();uploads++;textures.set(kind,t);return t;
 }
 function material(kind:SceneSurface,lit=false){const key=kind+':'+lit;let m=materials.get(key);if(m)return m;
  m=new StandardMaterial('early-art-'+key,scene);m.diffuseTexture=texture(kind);m.specularColor=Color3.Black();m.diffuseColor=lit?new Color3(.78,.78,.78):Color3.White();
  if(!lit){m.emissiveTexture=m.diffuseTexture;m.disableLighting=true;preservePixelPalette(m);}
  if(kind==='understory'){m.useAlphaFromDiffuseTexture=true;m.transparencyMode=Material.MATERIAL_ALPHATEST;m.backFaceCulling=false;}
  materials.set(key,m);return m;
 }
 const assign=(mesh:Mesh,kind:SceneSurface,assignments:string[],lit=false)=>{mesh.material=material(kind,lit);assignments.push(mesh.name+':'+kind);};
 const detail=(root:TransformNode,name:string,x:number,y:number,z:number,w:number,h:number,d:number,kind:SceneSurface)=>{
  const m=MeshBuilder.CreateBox('early-art-'+name,{width:w,height:h,depth:d},scene);m.parent=root;m.position.set(x,y,z);m.material=material(kind,true);m.isPickable=false;m.receiveShadows=true;return m;
 };
 function canyonDressing(root:TransformNode){
  // Low plants lie on the outer banks, not in either actor lane or the gate approach.
  const sites:readonly(readonly[number,number,number,number])[]=[[-8.8,-8.4,0,1.3],[8.9,-6.3,1,1.5],[-9.6,-1.7,2,1.2],[8.8,.3,3,1.6],[-8.7,4.3,1,1.3],[9.8,7.2,0,1.5],[-10.4,6.7,3,1.5],[10.2,-3.7,2,1.2]];
  for(const [index,[x,z,variant,w]]of sites.entries()){
   const m=MeshBuilder.CreatePlane('early-art-bank-understory-'+index,{width:w,height:w*2},scene);m.parent=root;m.position.set(x,w+.045,z);m.billboardMode=Mesh.BILLBOARDMODE_ALL;m.material=material('understory');m.isPickable=false;
   const uv=m.getVerticesData(VertexBuffer.UVKind);if(!uv)throw new Error('Missing understory UV');m.setVerticesData(VertexBuffer.UVKind,Array.from(uv,(v,i)=>i%2?v:(variant+v)/4),false);
  }
 }
 function dress(root:TransformNode,chapter:Chapter){
  const before=scene.meshes.length,assignments:string[]=[];
  if(chapter==='canyon'){canyonDressing(root);roots.set(root,{chapter,assignments,added:scene.meshes.length-before});root.onDisposeObservable.addOnce(()=>roots.delete(root));return;}
  const crypt=chapter==='passage'||chapter==='sanctum',prison=['cellblock','execution','prisonstairs','warden','prisonbridge'].includes(chapter);
  const stone:SceneSurface=crypt||prison?'crypt-stone':'limestone';
  const floor:SceneSurface=chapter==='prisonbridge'?'bridge-floor':prison?'prison-floor':chapter==='chamber'?'chamber-floor':chapter==='passage'?'crypt-floor':chapter==='cathedral'||chapter==='sanctum'?'abbey-floor':'royal-floor';
  const meshes=root.getChildMeshes().filter((m):m is Mesh=>m instanceof Mesh);
  for(const m of meshes){
   const name=m.name.startsWith(chapter+'-')?m.name.slice(chapter.length+1):m.name;
   // No material-owned NPC or enemy picture is selected by these exact structural names.
   if(name==='ground'||name==='floor')assign(m,floor,assignments);
   else if(['column','fluted-column','pillar'].includes(name))assign(m,'column-stone',assignments,true);
   else if(['north-wall','back-wall','side-wall','wall-stone','wall-base','stone-course','wall-course','cutaway-side-wall','side-vault','stone-seam','tower-masonry','tower-sill','tower-back','stone-stair','east-stair','dais','raised-floor','altar-base','altar','altar-top','capital','plinth','cornice','pillar-base','pillar-capital','window-top','window-cross','secret-stone-door'].includes(name))assign(m,stone,assignments,true);
   else if(['bed-frame','cupboard','table','throne-back','pew-seat','pew-back','pew-end','organ-case','supply-box','supply-lid','captivity-box','storage-locker','cot-frame','warden-desk','supplies','supplies-lid','guillotine-upright','guillotine-crossbar','restraint'].includes(name))assign(m,'carved-oak',assignments,true);
   else if(['quilt','throne-seat'].includes(name))assign(m,'quilt',assignments);
   else if(['pillow','cot-straw'].includes(name))assign(m,'linen',assignments);
   else if(name==='royal-carpet')assign(m,'royal-runner',assignments);
   else if(['cell-bars','bridge-rail','bridge-post','guillotine-blade','organ-pipe'].includes(name))assign(m,'ironwork',assignments,true);
   else if(['arched-window','stained-glass','faded-window'].includes(name))assign(m,'lancet-glass',assignments);
   else if(name==='banner')assign(m,'royal-runner',assignments);
   // Do NOT replace the transparent cell gate, hidden-door shadow, keys, flames or actor cells.
  }
  // Raised mouldings follow existing column footprints; no new obstacle or tall prop in an aisle.
  for(const [columnIndex,m]of meshes.entries()){const name=m.name.startsWith(chapter+'-')?m.name.slice(chapter.length+1):m.name;
   if(name!=='column'&&name!=='fluted-column'&&name!=='pillar')continue;
   m.computeWorldMatrix(true);const b=m.getBoundingInfo().boundingBox,half=b.extendSize;
   const x=m.position.x,z=m.position.z,bottom=m.position.y-half.y,top=m.position.y+half.y;
   // Base/collar geometry stays below the original capital and inside its already-blocked footprint.
   for(const [i,y]of [bottom+.18,top-.19].entries())detail(root,'column-collar-'+chapter+'-'+columnIndex+'-'+i,x,y,z,half.x*2+.08,.13,half.z*2+.08,stone);
   if(name!=='fluted-column')for(const side of [-1,1])detail(root,'column-flute-'+chapter+'-'+columnIndex+'-'+side,x+side*half.x*.55,m.position.y,z-half.z-.018,.042,Math.max(.1,half.y*2-.55),.035,stone);
  }
  roots.set(root,{chapter,assignments,added:scene.meshes.length-before});root.onDisposeObservable.addOnce(()=>roots.delete(root));
 }
 const before=scene.onBeforeRenderObservable.add(()=>{if(disposed)return;for(const [name,chapter]of Object.entries(EARLY_SCENE_ROOTS)){
  const root=scene.getTransformNodeByName(name);if(root&&!root.isDisposed()&&root.isEnabled()&&!roots.has(root))dress(root,chapter);
 }});
 scene.onDisposeObservable.addOnce(()=>{disposed=true;scene.onBeforeRenderObservable.remove(before);roots.clear();textures.clear();materials.clear();});
 return {inspect(){return {profile:EARLY_SCENE_ART.id,approved:false,disposed,uploads,textureCount:textures.size,textureBytes:[...textures.values()].reduce((n,t)=>{const s=t.getSize();return n+s.width*s.height*4;},0),
  surfaces:[...textures].map(([kind,t])=>({kind,...t.getSize(),alpha:t.hasAlpha,sampling:t.samplingMode})),maps:[...roots].map(([r,d])=>({chapter:d.chapter,visible:r.isEnabled(),assignments:[...d.assignments],added:d.added})),
  gameplayWrites:0,actorTexturesReplaced:0,cameraChanged:false,conceptImagesEmbedded:false};}};
}
