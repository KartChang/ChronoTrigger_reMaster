import {DynamicTexture,Mesh,Scene,StandardMaterial} from '@babylonjs/core';
import type {HeroPose} from './hero-art';
import {PARTY_ART} from './production-party-art';
import {LEGACY_PARTY_CELLS} from './production-party-index';
import {partyCell,partyFingerprint,decodePartyCell,equalPartyPixels} from './production-party-cell';

type Pose=Readonly<{pose:HeroPose;frame:number;facing:number}>;
type Binding={texture:DynamicTexture;mesh:Mesh;slot:number|null;original:DynamicTexture['update'];wrapped:DynamicTexture['update'];raw:Uint8ClampedArray|null;finished:Uint8ClampedArray|null;styled:boolean;cell:number|null;needsRefresh:boolean};
const STATIC_NAMES=new Set(['lucca-handdrawn','lucca','marle-as-queen','frog-arrival','hall1000marle-waits']);
export const PARTY_BINDING_LIMIT=8;
/** Scene-scoped adapter of actual texture uploads. A genuine sampled pose plus exact
 * source bytes identifies a cell; fingerprint matches alone never authorize replacement.
 * No State/time/pose injection. Protected action cells are never substituted or relabelled.
 */
export function installProductionPartyArt(scene:Scene,readPose:(slot:number)=>Pose|null|undefined){
 if(scene.isDisposed)throw new Error('A live scene is required');
 const byHash=new Map<number,number[]>();LEGACY_PARTY_CELLS.forEach((h,i)=>{const a=byHash.get(h)??[];a.push(i);byHash.set(h,a);});
 const bindings=new Map<DynamicTexture,Binding>();let chapter='',disposed=false,paintedUploads=0,unknownUploads=0,protectedUploads=0,sourceChecks=0;
 const enabled=()=>!disposed&&chapter!==''&&!['bedroom','home','downstairs','lab'].includes(chapter);
 const write=(t:DynamicTexture,bytes:Uint8ClampedArray)=>{const c=t.getContext() as CanvasRenderingContext2D,image=c.createImageData(48,64);image.data.set(bytes);c.putImageData(image,0,0);};
 function recognise(bytes:Uint8ClampedArray,b:Binding):number|null{
  const pose=b.slot===null?{pose:'idle' as const,frame:0,facing:0}:readPose(b.slot);
  if(!pose||!PARTY_ART.redrawnPoses.includes(pose.pose)){protectedUploads++;return null;}
  const candidates=(byHash.get(partyFingerprint(bytes))??[]).filter(code=>{const d=decodePartyCell(code);return d.pose===pose.pose&&d.facing===pose.facing&&d.frame===pose.frame;});
  for(const code of candidates){sourceChecks++;if(equalPartyPixels(partyCell(code,true),bytes))return code;}
  unknownUploads++;return null;
 }
 function bind(mesh:Mesh,t:DynamicTexture,slot:number|null){
  if(bindings.has(t)||bindings.size>=PARTY_BINDING_LIMIT)return;
  const size=t.getSize();if(size.width!==48||size.height!==64)return;
  const b:Binding={texture:t,mesh,slot,original:t.update,wrapped:t.update,raw:null,finished:null,styled:false,cell:null,needsRefresh:false};
  b.wrapped=function(...args:Parameters<DynamicTexture['update']>){
   b.needsRefresh=false;
   const size=t.getSize();if(size.width!==48||size.height!==64){b.raw=null;b.finished=null;b.styled=false;b.cell=null;return b.original.apply(t,args);}
   const actual=t.getContext().getImageData(0,0,48,64).data;
   const own=!!b.finished&&equalPartyPixels(actual,b.finished);
   if(!own){b.raw=actual.slice();b.finished=null;b.styled=false;b.cell=null;}
   if(enabled()){
    const raw=b.raw??actual,code=recognise(raw,b);
    if(code!==null){if(b.cell!==code||!b.finished){b.finished=partyCell(code);b.cell=code;}
     if(!equalPartyPixels(actual,b.finished)){write(t,b.finished);paintedUploads++;}b.styled=true;
    }else if(own&&b.raw){write(t,b.raw);b.finished=null;b.cell=null;b.styled=false;}
   }else if(b.styled&&b.raw){write(t,b.raw);b.styled=false;b.finished=null;b.cell=null;}
   return b.original.apply(t,args);
  };
  bindings.set(t,b);t.update=b.wrapped;
  t.onDisposeObservable.addOnce(()=>{if(t.update===b.wrapped)t.update=b.original;bindings.delete(t);b.raw=null;b.finished=null;});
  t.update();
 }
 function beforeRender(){
  if(!enabled())return;
  for(const m of scene.meshes){if(!(m instanceof Mesh)||!m.isEnabled()||!m.isVisible)continue;
   const slot=m.name==='player-0'?0:m.name==='player-1'?1:m.name==='guest-companion'?2:null;
   if(slot===null&&!STATIC_NAMES.has(m.name))continue;
   const mat=m.material,t=mat instanceof StandardMaterial?mat.diffuseTexture:null;if(!(t instanceof DynamicTexture))continue;
   const b=bindings.get(t);if(!b)bind(m,t,slot);else if(b.needsRefresh)t.update();
  }
 }
 const observer=scene.onBeforeRenderObservable.add(beforeRender);
 scene.onDisposeObservable.addOnce(()=>{disposed=true;scene.onBeforeRenderObservable.remove(observer);for(const b of bindings.values())if(b.texture.update===b.wrapped)b.texture.update=b.original;bindings.clear();byHash.clear();});
 return {
  begin(next:string){const wasEnabled=enabled();chapter=next;const nowEnabled=enabled();if(!nowEnabled){for(const b of bindings.values())if(b.styled)b.texture.update();}else if(!wasEnabled){for(const b of bindings.values())b.needsRefresh=true;}},
  inspect(){return {profile:PARTY_ART.id,approved:false,chapter,disposed,bindings:bindings.size,limit:PARTY_BINDING_LIMIT,paintedUploads,unknownUploads,protectedUploads,sourceChecks,
   retainedCpuBytes:[...bindings.values()].reduce((n,b)=>n+(b.raw?.byteLength??0)+(b.finished?.byteLength??0),0),indexCells:LEGACY_PARTY_CELLS.length,
   additionalGpuTextures:0,redrawnPoses:[...PARTY_ART.redrawnPoses],retainedPoses:[...PARTY_ART.retainedPoses],fullCharacterArtComplete:false,
   actors:[...bindings.values()].map(b=>({name:b.mesh.name,active:b.mesh.isEnabled()&&b.mesh.isVisible,styled:b.styled,cell:b.cell===null?null:decodePartyCell(b.cell)}))};}
 };
}
