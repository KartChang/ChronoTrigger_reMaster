import type {NpcAttentionPose} from './production-npc-attention';
import {DynamicTexture,Mesh,Scene,StandardMaterial} from '@babylonjs/core';
import type {StoryNpcKind} from './story-npc-art';
import {legacyStoryNpcCell,storyNpcProductionCell,STORY_NPC_PRODUCTION} from './production-story-npc-art';
import {sameActorPixels} from './native-actor-pixels';
type Role=Readonly<{root:string;chapter:string;kind:StoryNpcKind}>;
const ROLES:Readonly<Record<string,Role>>={
 townsperson:{root:'kingdom-truce',chapter:'truce',kind:'resident'},innkeeper:{root:'kingdom-truce',chapter:'truce',kind:'innkeeper'},
 king:{root:'kingdom-castle',chapter:'castle',kind:'king'},guard:{root:'kingdom-castle',chapter:'castle',kind:'guard'},
 'disguised-nun':{root:'cathedral-set',chapter:'cathedral',kind:'nun'},
 'false-chancellor':{root:'sanctum-set',chapter:'sanctum',kind:'chancellor'},'true-chancellor':{root:'sanctum-set',chapter:'sanctum',kind:'chancellor'},'queen-leene':{root:'sanctum-set',chapter:'sanctum',kind:'queen'}
};
export const STORY_NPC_BINDING_LIMIT=12;
type Binding={mesh:Mesh;material:StandardMaterial;texture:DynamicTexture;role:Role;original:DynamicTexture['update'];wrapped:DynamicTexture['update'];raw:Uint8ClampedArray|null;finished:Uint8ClampedArray|null;frame:number|null;key:string;facing:number;pose:'ambient'|'greet';styled:boolean;refresh:boolean;detached:boolean;textureObserver:ReturnType<DynamicTexture['onDisposeObservable']['addOnce']>;meshObserver:ReturnType<Mesh['onDisposeObservable']['addOnce']>};
/** Exact source-cell replacement at the existing actor's owned upload boundary.
 * No atlas texture, new clock, gameplay mutation or inferred movement is introduced.
 * Optional G attention selects genuine authored direction/greet pixels. Walk stays staged. */
export function installProductionStoryNpcs(scene:Scene,presentation?:(name:string,x:number,z:number)=>NpcAttentionPose){
 if(scene.isDisposed)throw new Error('Live scene required');
 const bindings=new Map<DynamicTexture,Binding>();let chapter='',disposed=false,redrawnUploads=0,unknownUploads=0,sourceComparisons=0;
 const roleFor=(m:Mesh)=>Object.hasOwn(ROLES,m.name)&&m.parent?.name===ROLES[m.name]!.root?ROLES[m.name]:undefined;
 const active=(b:Binding)=>!disposed&&chapter===b.role.chapter;
 const selection=(b:Binding):NpcAttentionPose=>{const p=presentation?.(b.mesh.name,b.mesh.position.x,b.mesh.position.z);return p&&Number.isInteger(p.facing)&&p.facing>=0&&p.facing<4&&(p.pose==='ambient'||p.pose==='greet')?p:{facing:0,pose:'ambient'};};
 const nativeSize=(t:DynamicTexture)=>t.getSize().width===48&&t.getSize().height===64;
 const privateTexture=(m:Mesh,t:DynamicTexture)=>!scene.meshes.some(other=>other!==m&&!other.isDisposed()&&other.material instanceof StandardMaterial&&other.material.diffuseTexture===t);
 const owns=(b:Binding)=>!b.mesh.isDisposed()&&b.mesh.getScene()===scene&&roleFor(b.mesh)===b.role&&b.mesh.material===b.material&&b.material.diffuseTexture===b.texture&&nativeSize(b.texture)&&privateTexture(b.mesh,b.texture);
 const write=(t:DynamicTexture,rgba:Uint8ClampedArray)=>{const c=t.getContext() as CanvasRenderingContext2D,im=c.createImageData(48,64);im.data.set(rgba);c.putImageData(im,0,0);};
 function restoreRaw(b:Binding):boolean{
  // Never overwrite pixels uploaded by another painter or a later wrapper owner.
  if(!b.styled||!b.raw||!nativeSize(b.texture)||b.texture.update!==b.wrapped)return false;
  if(!sameActorPixels(b.texture.getContext().getImageData(0,0,48,64).data,b.finished))return false;
  write(b.texture,b.raw);b.finished=null;b.frame=null;b.key='';b.facing=0;b.pose='ambient';b.styled=false;return true;
 }
 function unbind(b:Binding){
  if(b.detached)return;b.detached=true;
  if(b.texture.update===b.wrapped)b.texture.update=b.original;
  b.texture.onDisposeObservable.remove(b.textureObserver);b.mesh.onDisposeObservable.remove(b.meshObserver);
  b.textureObserver=null;b.meshObserver=null;b.raw=null;b.finished=null;
  if(bindings.get(b.texture)===b)bindings.delete(b.texture);
 }
 function bind(mesh:Mesh,t:DynamicTexture,role:Role,material:StandardMaterial){
  if(bindings.has(t)||bindings.size>=STORY_NPC_BINDING_LIMIT||!nativeSize(t)||!privateTexture(mesh,t))return;
  const b:Binding={mesh,material,texture:t,role,original:t.update,wrapped:t.update,raw:null,finished:null,frame:null,key:'',facing:0,pose:'ambient',styled:false,refresh:false,detached:false,textureObserver:null,meshObserver:null};
  b.wrapped=function(...args:Parameters<DynamicTexture['update']>){
   if(b.detached)return b.original.apply(t,args);
   b.refresh=false;
   if(!owns(b)){restoreRaw(b);unbind(b);return b.original.apply(t,args);}
   const actual=t.getContext().getImageData(0,0,48,64).data,own=sameActorPixels(actual,b.finished);
   if(!own){b.raw=actual.slice();b.finished=null;b.frame=null;b.key='';b.facing=0;b.pose='ambient';b.styled=false;}
   if(active(b)){
    if(b.frame===null){const raw=b.raw??actual;for(let f=0;f<4;f++){sourceComparisons++;if(sameActorPixels(raw,legacyStoryNpcCell(role.kind,f))){b.frame=f;break;}}if(b.frame===null)unknownUploads++;}
    if(b.frame!==null){const p=selection(b),key=b.frame+'/'+p.facing+'/'+p.pose;if(key!==b.key){b.finished=storyNpcProductionCell(role.kind,b.frame,p.facing,p.pose);b.key=key;b.facing=p.facing;b.pose=p.pose;}}
    if(b.finished){if(!sameActorPixels(actual,b.finished)){write(t,b.finished);redrawnUploads++;}b.styled=true;}
   }else restoreRaw(b);
   return b.original.apply(t,args);
  };
  bindings.set(t,b);t.update=b.wrapped;
  b.textureObserver=t.onDisposeObservable.addOnce(()=>unbind(b));
  b.meshObserver=mesh.onDisposeObservable.addOnce(()=>{if(!disposed&&restoreRaw(b))b.original.call(t);unbind(b);});
  t.update();
 }
 const observer=scene.onBeforeRenderObservable.add(()=>{
  if(disposed)return;
  for(const b of bindings.values())if(b.texture.update!==b.wrapped||!owns(b)){if(restoreRaw(b))b.original.call(b.texture);unbind(b);}
  for(const m of scene.meshes){if(!(m instanceof Mesh)||!m.isEnabled()||!m.isVisible||m.visibility<=0)continue;
   const role=roleFor(m);if(!role||role.chapter!==chapter)continue;
   const mat=m.material,t=mat instanceof StandardMaterial?mat.diffuseTexture:null;if(!(mat instanceof StandardMaterial)||!(t instanceof DynamicTexture))continue;
   const b=bindings.get(t);if(!b)bind(m,t,role,mat);else {const p=selection(b);if(b.refresh||b.frame!==null&&b.key!==b.frame+'/'+p.facing+'/'+p.pose)t.update();}
  }
 });
 scene.onDisposeObservable.addOnce(()=>{disposed=true;scene.onBeforeRenderObservable.remove(observer);for(const b of [...bindings.values()])unbind(b);});
 return {
  begin(next:string){if(disposed)return;const changed=next!==chapter;chapter=next;for(const b of bindings.values()){if(!active(b)&&b.styled)b.texture.update();else if(changed&&active(b)&&!b.styled)b.refresh=true;}},
  inspect(){return {profile:STORY_NPC_PRODUCTION.id,approved:false,chapter,disposed,bindings:bindings.size,limit:STORY_NPC_BINDING_LIMIT,redrawnUploads,unknownUploads,sourceComparisons,additionalGpuTextures:0,
   retainedCpuBytes:[...bindings.values()].reduce((n,b)=>n+(b.raw?.byteLength??0)+(b.finished?.byteLength??0),0),runtimePoses:presentation?['ambient','greet']:['ambient'],directionalMovementEnabled:false,
   actors:[...bindings.values()].map(b=>({name:b.mesh.name,kind:b.role.kind,frame:b.frame,facing:b.facing,pose:b.pose,styled:b.styled,active:active(b)&&b.mesh.isEnabled()&&b.mesh.isVisible}))};}
 };
}
