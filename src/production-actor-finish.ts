import {DynamicTexture,Mesh,Scene,StandardMaterial} from '@babylonjs/core';

/** Final pigment pass, not a new pose/outline or a replacement gameplay renderer.
 * Alpha, native cell size, pivots and animation clocks remain owned by their painters.
 * Party/enemy painters are deliberately not bound: their exact native source-cell
 * acceptance remains unchanged. Court supporting-cast pose uploads pass through this once before the real texture upload.
 */
export const ACTOR_FINISH=Object.freeze({id:'vq04b-court-cast-pigment-and-form',approved:false,maxBindings:24,cellWidth:48,cellHeight:64});
const enabledChapter='courtroom';
const accent=new Map<number,readonly[number,number,number]>([
 [0x7e8c93,[63,100,128]],[0x415968,[35,53,74]],[0xc3ccc3,[221,209,153]],
 [0x55556d,[65,48,85]],[0x303447,[36,29,49]],[0x886087,[112,63,124]],
 [0x493857,[53,31,67]],[0x718a72,[80,125,88]],[0x3f5554,[44,67,56]],
 [0xb85b35,[185,58,29]],[0xe39b50,[248,155,55]],[0x754732,[98,40,31]],
 [0xce7c43,[223,103,34]],[0x487f86,[37,120,145]],[0x88b4ab,[101,182,184]],
 [0x354f5b,[34,59,80]],[0xb77b38,[192,121,33]],[0xdba94c,[238,175,58]],
 [0xbf9354,[200,149,54]],[0xe0c88f,[243,211,124]],[0x796c85,[109,79,139]],
 [0xab97b3,[178,150,198]],[0x81b85e,[110,165,74]],[0xc6d786,[201,223,129]],
]);
const same=(a:Uint8ClampedArray,b:Uint8ClampedArray|null)=>!!b&&a.length===b.length&&a.every((v,i)=>v===b[i]);
/** Integer pixels only. Hue-group shading follows the existing drawn cloth/skin/hair,
 * including collapsed and side-facing poses; transparent pixels are never filled.
 */
export function finishActorPixels(source:Uint8ClampedArray,width=48,height=64):Uint8ClampedArray{
 if(width!==48||height!==64||source.length!==width*height*4)throw new RangeError('Expected native 48x64 actor RGBA');
 const out=source.slice();
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const at=(y*width+x)*4;if(source[at+3]!==255)continue;
  const r=source[at]!,g=source[at+1]!,b=source[at+2]!,l=Math.max(r,g,b);
  // Keep the authentic dark keyline; highlights never replace silhouettes or pupils.
  if(l<78)continue;
  const base=accent.get((r<<16)|(g<<8)|b)??[r,g,b];
  const samePigment=(xx:number,yy:number)=>{if(xx<0||yy<0||xx>=width||yy>=height)return false;const q=(yy*width+xx)*4;return source[q+3]===255&&Math.abs(source[q]!-r)+Math.abs(source[q+1]!-g)+Math.abs(source[q+2]!-b)<26;};
  const upper=!samePigment(x,y-1),left=!samePigment(x-1,y),lower=!samePigment(x,y+1),right=!samePigment(x+1,y);
  const skin=r>g*1.11&&g>b*1.1&&g>108,cloth=(b>=r*.9||g>r*1.12)&&y>=29;
  // Broad, quiet form shading rather than independent per-pixel noise.
  let light=upper?.075:left?.035:lower?-.045:right?-.025:0;
  if(cloth&&samePigment(x,y-1)&&samePigment(x,y+1))light+=(x%9===2?.028:x%9===7?-.035:0);
  if(skin)light*=.5;
  for(let c=0;c<3;c++){const v=base[c]!;out[at+c]=Math.round(light>=0?v+(255-v)*light:v*(1+light));}
 }
 return out;
}

type Binding={texture:DynamicTexture;original:DynamicTexture['update'];wrapped:DynamicTexture['update'];raw:Uint8ClampedArray|null;finished:Uint8ClampedArray|null;styled:boolean};
/** Scene-scoped borrowed-texture adapter. No extra GPU resources, no gameplay data,
 * no timer. Original upload, return value and exceptions are retained. */
export function installProductionActorFinish(scene:Scene){
 if(scene.isDisposed)throw new Error('A live scene is required');
 const bindings=new Map<DynamicTexture,Binding>();let chapter:string|null=null,disposed=false,finishedUploads=0;
 const enabled=()=>chapter===enabledChapter;
 const eligible=(m:Mesh)=>/^courtroom(judge|defender|prosecutor|juror-\d+|testimony-)/.test(m.name);
 const write=(t:DynamicTexture,rgba:Uint8ClampedArray)=>{const c=t.getContext() as CanvasRenderingContext2D,image=c.createImageData(48,64);image.data.set(rgba);c.putImageData(image,0,0);};
 function bind(t:DynamicTexture):void{
  if(bindings.has(t)||bindings.size>=ACTOR_FINISH.maxBindings)return;
  const size=t.getSize();if(size.width!==48||size.height!==64)return;
  const record:Binding={texture:t,original:t.update,wrapped:t.update,raw:null,finished:null,styled:false};
  record.wrapped=function(...args:Parameters<DynamicTexture['update']>){
   const current=t.getContext().getImageData(0,0,48,64).data;
   // A repeated upload of our own pixels must not accumulate the finish.
   if(!same(current,record.finished)){record.raw=current.slice();record.finished=null;record.styled=false;}
   if(enabled()){
    if(!record.raw)record.raw=current.slice();
    if(!record.finished)record.finished=finishActorPixels(record.raw);
    if(!record.styled||!same(current,record.finished)){write(t,record.finished);finishedUploads++;}
    record.styled=true;
   }else if(record.styled&&record.raw){write(t,record.raw);record.styled=false;record.finished=null;}
   return record.original.apply(t,args);
  };
  bindings.set(t,record);t.update=record.wrapped;
  t.onDisposeObservable.addOnce(()=>{if(t.update===record.wrapped)t.update=record.original;bindings.delete(t);});
  // Covers a new static NPC's first upload. Subsequent pose uploads go directly
  // through the borrowed adapter; this observer never repaints a stable frame.
  if(enabled())t.update();
 }
 function beforeRender():void{
  if(disposed||!enabled())return;
  for(const m of scene.meshes){if(!(m instanceof Mesh)||!eligible(m)||!m.isEnabled()||!m.isVisible)continue;
   const mat=m.material;if(!(mat instanceof StandardMaterial))continue;
   const t=mat.diffuseTexture;if(t instanceof DynamicTexture){const b=bindings.get(t);if(b&&!b.styled)t.update();else bind(t);}
  }
 }
 const observer=scene.onBeforeRenderObservable.add(beforeRender);
 scene.onDisposeObservable.addOnce(()=>{disposed=true;scene.onBeforeRenderObservable.remove(observer);for(const b of bindings.values())if(b.texture.update===b.wrapped)b.texture.update=b.original;bindings.clear();});
 return {
  begin(next:string):void{if(disposed)return;chapter=next;if(!enabled())for(const b of bindings.values())if(b.styled)b.texture.update();},
  inspect(){return {profile:ACTOR_FINISH.id,approved:false,chapter,active:enabled()&&!disposed,disposed,bindings:bindings.size,limit:ACTOR_FINISH.maxBindings,finishedUploads,
   retainedCpuBytes:[...bindings.values()].reduce((n,b)=>n+(b.raw?.byteLength??0)+(b.finished?.byteLength??0),0),additionalGpuTextures:0,
   alphaChanged:false,posesRedrawn:false,animationClocksChanged:false,runtimeScope:'courtroom supporting cast only',partyEnemyPaintersRetained:true};}
 };
}
